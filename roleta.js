const fs = require('fs');
const configs = require("./configs.js");
const { reagirMsg, removerPessoasGrupo, adicionarPessoasGrupo, tornarPessoasAdmin } = require("./wrappers-bot");

var clientBot = false;
var ultimosTiros = {};
var estatisticasRoleta = {};
let mortosAtuais = {};
const pessoasAvisadas = [];

function isMemberIDInGroup(membro,grupo){
	let numeroMembro = membro;
	if(membro.includes("@")){
		numeroMembro = membro.split("@")[0];
	}
	let membros = grupo.participants;
	let inGroup = false;

	membros.forEach((mem) => {
		if(mem.id.user.includes(numeroMembro)){
			inGroup = true;
		}
	});
	return inGroup;
}

function isUserAdminById(idContato,infoGrupo){
	let membros = infoGrupo.participants;
	let isAdmin = false;
	idContato = idContato.replace("@c.us","");
	membros.forEach((membro) => {
		if(membro.id.user.includes(idContato)){
			if(membro.isAdmin === true){
				isAdmin = true;
			}
		}
	});
	return isAdmin;
}

function inicializaRoleta(client){
	const data = fs.readFileSync(configs.roletaRussa.arquivoDados, "utf8");
	estatisticasRoleta = JSON.parse(data);
	clientBot = client;
	console.log("[roletaRussa] Inicializada.");
}

function saveDbRoleta(){
	let data = JSON.stringify(estatisticasRoleta, null, 2);
	fs.writeFileSync(configs.roletaRussa.arquivoDados, data);
}

function getEmojiRanking(i){
	const emojis = ["","🥇","🥈","🥉","🐅","🐆","🦌","🐐","🐏","🐓","🐇"];
	return emojis[i];
}

function getQtdMortos(){
	let qtd = Object.keys(mortosAtuais).length ?? 0;
	if(isNaN(qtd)){
		qtd = 0;
	}
	return qtd;
}

async function ressuscitaTodos(){
	console.log(`[roletaRussa][ressuscitaTodos] Ressucitando todos que sobraram (${Object.keys(mortosAtuais).length}).`);
	let toResAtual = 0;

	let resAtual = undefined;
	let mt = undefined;
	for(mt in mortosAtuais){
		resAtual = mortosAtuais[mt];
		if(resAtual){
			// foda-se se era admin
			console.log(`[roletaRussa][ressuscitaTodos] Ressucitado '${mt}' para '${resAtual.name}'.`);
			toResAtual += 300;
			setTimeout(()=>{
				console.log(`[ressuscitaTodos] Res: ${JSON.stringify(mt)}`);
				adicionarPessoasGrupo(resAtual,[mt]);
			}, toResAtual);
		}
	}
}

function resetRankingRoleta(idGrupo){	
	let ultimoRanking = getRankingRoleta(idGrupo);

	console.log(`[resetRankingRoleta] Apagando dados do grupo '${idGrupo}'.\nBackup: ${JSON.stringify(estatisticasRoleta[idGrupo])}`);
	estatisticasRoleta[idGrupo] = {};
	saveDbRoleta();

	return ultimoRanking.concat([{msg: `🏆 *Rankings Roleta Russa*: Os dados da roleta russa deste grupo foram *apagados*. 🪦`, reply: true}]);
}

function getRankingRoleta(idGrupo){	
	const dados = estatisticasRoleta[idGrupo];
	let rankTent = [];
	let rankMort = [];
	for(const pIndex in estatisticasRoleta[idGrupo]){
		const pessoa = estatisticasRoleta[idGrupo][pIndex];
		rankTent.push(`*${pessoa.qtdMaximaTentativas}* - ${pessoa.nome}`);
		rankMort.push(`*${pessoa.qtdMortes}* - ${pessoa.nome}`);
	}

	var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
	let i = 1;

	let rankingTentativas = "";
	rankTent.sort(collator.compare);
	rankTent.reverse();
	rankTent.forEach((r) => {
		if(i < 11){
			rankingTentativas += `\t${getEmojiRanking(i)} ${i}°: ${r}\n`;
			i++;
		}
	});

	let rankingMortes = "";
	rankMort.sort(collator.compare);
	rankMort.reverse();
	i = 1;
	rankMort.forEach((r) => {
		if(i < 11){
			rankingMortes += `\t${getEmojiRanking(i)} ${i}°: ${r}\n`;
			i++;
		}
	});

	return [{msg: `🏆 *Rankings Roleta Russa* 🔫\n\n_🍀 Sorte - Máx. Tentativas sem morrer_\n${rankingTentativas}\n\n_🪦 Número de Mortes_\n${rankingMortes}`, reply: false}];
}

function getNumerosTentativas(numeroVitima,idGrupo){
	const dados = estatisticasRoleta[idGrupo][numeroVitima];
	return dados.qtdTentativasAtual;
}

function getEstatisticasTentativa(numeroVitima,idGrupo){
	let frase = "";
	const dados = estatisticasRoleta[idGrupo][numeroVitima];

	if(dados.qtdTentativasAtual > dados.qtdMaximaTentativas){
		frase = `\nMorreu em ${dados.qtdTentativasAtual}, um novo record! Seu máximo antes disso era ${dados.qtdMaximaTentativas}.\nNeste grupo, você já morreu ${dados.qtdMortes} vezes.\n`;
	} else {
		frase = `\nMorreu em ${dados.qtdTentativasAtual}.\nNeste grupo, você já morreu ${dados.qtdMortes} vezes.\n`;
	}

	return frase;
}

function marcaMorte(numeroVitima,idGrupo){	
	// Achei a pessoa, zera tiro e add morte
	if(estatisticasRoleta[idGrupo][numeroVitima].qtdTentativasAtual > estatisticasRoleta[idGrupo][numeroVitima].qtdMaximaTentativas){
		// Atualiza máximo de tentativas
		estatisticasRoleta[idGrupo][numeroVitima].qtdMaximaTentativas = estatisticasRoleta[idGrupo][numeroVitima].qtdTentativasAtual;
	}

	// Zera atual
	estatisticasRoleta[idGrupo][numeroVitima].qtdTentativasAtual = 0;

	// Soma mortes
	estatisticasRoleta[idGrupo][numeroVitima].qtdMortes++;
}

function marcaTiro(numeroVitima,nomeVitima,idGrupo){
	if(estatisticasRoleta[idGrupo] !== undefined){
		if(estatisticasRoleta[idGrupo][numeroVitima] !== undefined){
			// Achei a pessoa, add tiro
			estatisticasRoleta[idGrupo][numeroVitima].qtdTentativasAtual++;
			estatisticasRoleta[idGrupo][numeroVitima].qtdTentativasTotal++;
		} else {
			// Grupo existe na db, mas pessoa não
			estatisticasRoleta[idGrupo][numeroVitima] = {numero: numeroVitima, nome: nomeVitima, qtdTentativasTotal: 1, qtdTentativasAtual: 1, qtdMortes: 0, qtdMaximaTentativas: 0};	
		}
	} else {
		// Nem o grupo existe na db ainda
		estatisticasRoleta[idGrupo] = {};
		estatisticasRoleta[idGrupo][numeroVitima] = {numero: numeroVitima, nome: nomeVitima, qtdTentativasTotal: 1, qtdTentativasAtual: 1, qtdMortes: 0, qtdMaximaTentativas: 0};
	}

	const repetido = marcaUltimoTiro(numeroVitima,idGrupo);
	if(repetido){
		estatisticasRoleta[idGrupo][numeroVitima].qtdTentativasAtual--;
		estatisticasRoleta[idGrupo][numeroVitima].qtdTentativasTotal--;
	}

	// Atualiza máximo de tentativas
	if(estatisticasRoleta[idGrupo][numeroVitima].qtdTentativasAtual > estatisticasRoleta[idGrupo][numeroVitima].qtdMaximaTentativas){
		estatisticasRoleta[idGrupo][numeroVitima].qtdMaximaTentativas = estatisticasRoleta[idGrupo][numeroVitima].qtdTentativasAtual;
	}

	return configs.roletaRussa.permiteTirosConsecutivos ? false : repetido;
}

function marcaUltimoTiro(numeroVitima,idGrupo){
	let tiroRepetido = false;
	let qtdTentativasSeguidas = 0;
	if(ultimosTiros[idGrupo] !== undefined){
		if(ultimosTiros[idGrupo].pessoa == numeroVitima){
			// Tiro mais recente no grupo foi da mesma pessoa
			qtdTentativasSeguidas = ultimosTiros[idGrupo].qtd + 1;
			tiroRepetido = true;
		}
	}

	// Atualiza tiro mais recente
	ultimosTiros[idGrupo] = {pessoa: numeroVitima, qtd: qtdTentativasSeguidas};
	return configs.roletaRussa.permiteTirosConsecutivos ? false : tiroRepetido;
}

function isMensagemRepetida(numeroVitima,idGrupo){
	let repetida = false;
	if(ultimosTiros[idGrupo] !== undefined){
		if(ultimosTiros[idGrupo].pessoa == numeroVitima && ultimosTiros[idGrupo].qtd > 1){
			repetida = true;
		}
	}
	return repetida;
}

async function processaRoletaRussa(nomeVitima,numeroVitima,grupo){
	const idGrupo = grupo.id._serialized;
	let resultado = [];
	console.log(`[roletaRussa] Rolando para '${numeroVitima}/${nomeVitima}'`);
	const tiroRepetido = marcaTiro(numeroVitima,nomeVitima,idGrupo);

	if(tiroRepetido){
		console.log(`[roletaRussa] Tiro repetido. '${numeroVitima}/${nomeVitima}/${grupo.name}'`);
		if(!isMensagemRepetida(numeroVitima,idGrupo)){
			// Responde apenas a 1° msg pra evitar spam
			resultado.push({msg: `${nomeVitima}, apenas 1 tentativa por vez, aguarde o próximo! 😒`, react: "💢", reply: true});
		}
	} else {
		if((Math.random() < 0.17)){
			let eraAdmin = isUserAdminById(numeroVitima,grupo);

			console.log(`[roletaRussa] Bang! Removendo: '${numeroVitima}/${nomeVitima}' de '${grupo.name}' (admin: ${eraAdmin}) (tempo: ${configs.roletaRussa.tempoFora})`);
			resultado.push({msg: `💥🔫 *BANG* - _F no chat_${getEstatisticasTentativa(numeroVitima,idGrupo)}\n\`\`\`últimas palavras? (${configs.roletaRussa.tempoAntesRemover}s)\`\`\``, react: "☠️", reply: true});
			marcaMorte(numeroVitima,idGrupo);

			// Coloca na lista de mortos pra reviver automaticamente quando o bot precisa reiniciar
			mortosAtuais[numeroVitima] = grupo;

			if(isUserAdminById(configs.meuNumero,grupo)){
				setTimeout(()=>{
					removerPessoasGrupo(grupo,numeroVitima);
				},1000*configs.roletaRussa.tempoAntesRemover);

				setTimeout(()=>{
					console.log(`[roletaRussa] Colocando de volta: '${numeroVitima}/${nomeVitima}' em '${grupo.name}'`);
					adicionarPessoasGrupo(grupo,numeroVitima);
					
					// Aguarda um tempo pra ver se a pessoa realmente foi adicionada no grupo
					setTimeout(async () => {
						try {
							let grupoAtualizado = await clientBot.getChatById(idGrupo);	
							if(isMemberIDInGroup(numeroVitima,grupoAtualizado)){
								// Pessoa foi adicionada de volta com sucesso
								if(eraAdmin){
									try{
										tornarPessoasAdmin(grupoAtualizado,numeroVitima);
										console.log(`[roletaRussa] Concedido admin de volta: '${numeroVitima}/${nomeVitima}' em '${grupoAtualizado.name}'`);
									} catch(e) {
										console.warn(`[roletaRussa] ERRO concedendo admin de volta '${numeroVitima}/${nomeVitima}' em '${grupoAtualizado.name}'\n${JSON.stringify(e)}\n${e}`);
									}
								}
								mortosAtuais[numeroVitima] = undefined;
							} else {
								console.log(`[roletaRussa] Não foi possível adicionar '${numeroVitima}/${nomeVitima}' de volta em '${grupoAtualizado.name}', avisando no PV dela...`);

								let msgErroColocarGrupo = `🤖 ${nomeVitima}, não consegui te colocar de volta no grupo '${grupoAtualizado.name}'. \n\nAdicione o bot como contato para que isso não aconteça - em 2 minutos vou tentar de colocar de novo no grupo. Se ainda assim não conseguir entrar, peça ajuda para algum administrador.`;
								// Manda msg avisando, mas só 1 vez
								if(!pessoasAvisadas.includes(numeroVitima)){
									await clientBot.sendMessage(numeroVitima,msgErroColocarGrupo);
									pessoasAvisadas.push(numeroVitima);
								}

								// SEGUNDA chance de tentar add
								setTimeout(async () => {
									grupoAtualizado = await clientBot.getChatById(idGrupo);	

									console.log(`[roletaRussa][segunda chance] Colocando de volta: '${numeroVitima}/${nomeVitima}' em '${grupoAtualizado.name}'`);
									adicionarPessoasGrupo(grupoAtualizado,numeroVitima);
									mortosAtuais[numeroVitima] = undefined;
									setTimeout(async () => {
										if(eraAdmin){
											console.log(`[roletaRussa][segunda chance] Concedido admin de volta: '${numeroVitima}/${nomeVitima}' em '${grupoAtualizado.name}'`);
											tornarPessoasAdmin(grupoAtualizado,numeroVitima);
										}
									}, configs.roletaRussa.tempoAguardarAdd);
								}, configs.roletaRussa.tempoAguardarAdd);
							}
						} catch(e){
							console.warn(`[roletaRussa] Erro Verificando pós-add`, e);
						}
					}, configs.roletaRussa.tempoAguardarAdd);
				}, 1000*configs.roletaRussa.tempoFora);
			} else {
				console.log(`[roletaRussa] Não sou admin, então não posso remover a pessoa do grupo.`)
				resultado.push({msg: `⚠️ \`\`\`Preciso ser administrador para conseguir remover a pessoa do grupo.\`\`\``, reply: true});
			}
		} else {
			console.log(`[roletaRussa] Safe! Mantido: '${numeroVitima}/${nomeVitima}' de '${grupo.name}'`);
			const tentAtual = getNumerosTentativas(numeroVitima,idGrupo);
			resultado.push({msg: `💨🔫 *click* - Tá *safe*! \`\`\`${tentAtual}\`\`\``, react: "🍀", reply: true});
		}

		saveDbRoleta();
	}

	return resultado;
}

module.exports = { inicializaRoleta, processaRoletaRussa, getRankingRoleta, resetRankingRoleta, ressuscitaTodos, getQtdMortos };