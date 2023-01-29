const { Client, LocalAuth, version } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrimg = require('qr-image');
const fs = require('fs');

const { inicializaRoleta, processaRoletaRussa, getRankingRoleta, resetRankingRoleta, ressuscitaTodos, getQtdMortos, setNomePessoa } = require("./roleta")
const configs = require("./configs");
const { dispatchMessages, reagirMsg, setWrapperClient } = require("./wrappers-bot");

console.log(`[garrusbot] Iniciando bot (wwebjs ${version})`);

const client = new Client({
	authStrategy: new LocalAuth({ clientId: configs.clientID }),
	puppeteer: {
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
		headless: configs.headlessMode
	}
});

client.initialize();

client.on('qr', (qr) => {
	console.log('[garrusbot] Recebido QRCode (logar.png): ', qr);
	qrcode.generate(qr, {small: true});
	let qr_png = qrimg.image(qr, { type: 'png' });
	qr_png.pipe(fs.createWriteStream('logar.png'));
});
client.on('authenticated', () => { console.log('[garrusbot] Autenticado com sucesso.'); });
client.on('auth_failure', msg => { console.error('[garrusbot] Erro Autenticando o whatsapp, limpe os arquivos de .wwebjs_auth e tente novamente', msg); });
client.on('ready', () => {
	setWrapperClient(client);
	inicializaRoleta(client);
	console.log("[garrusbot] Inicializado");
});

const jaRecebeuMsgPv = [];
client.on('message', async msg => {
	let chat = await msg.getChat();
	let numeroAutor = chat.isGroup ? msg.author : msg.from;
	let nomeAutor = msg._data.notifyName;
	let idChat = chat.id._serialized;
	let mensagemRecebida = msg.body.trim().toLowerCase();

	if(mensagemRecebida.startsWith("! ")){ // Remove espaço
		mensagemRecebida = mensagemRecebida.replace("! ", "!");
	}

	let mensagensEnviar = [];
	if(chat.isGroup){
		// Roleta Russa
		if (mensagemRecebida.startsWith("!roletarussa")) {
			mensagensEnviar = await processaRoletaRussa(nomeAutor,numeroAutor,chat);
		} else 
		if (mensagemRecebida.startsWith("!roletaranking")) {
			mensagensEnviar = getRankingRoleta(idChat);
		} else 
		if (mensagemRecebida.startsWith("!roletareset")) {
			const cttAutor = await msg.getContact();
			if(isUserAdmin(cttAutor,chat)){
				mensagensEnviar = resetRankingRoleta(idChat);
			} else {
				reagirMsg(msg,"🚫");
			}
		} else 
		if (mensagemRecebida.startsWith("!roletarename ")) {
			let novoNome = mensagemRecebida.split("!roletarename ").pop();
			if(novoNome.length > 0){
				setNomePessoa(novoNome,numeroAutor,idChat);
				reagirMsg(msg,"👍");
			} else {
				reagirMsg(msg,"👎");
			}
		}
	} else {
		// Atualmente, o bot só faz sentido em grupos, avisa pessoa no pv (apenas 1 vez)
		if(!jaRecebeuMsgPv.includes(numeroAutor)){
			mensagensEnviar = [{msg: `🤖 Olá, ${nomeAutor}! Sou o _garrusbot_. Me adicione em um grupo para jogar!`, react: "👋", reply: true}];
			jaRecebeuMsgPv.push(numeroAutor);
		}
	}

	if(mensagensEnviar.length > 0){
		dispatchMessages(msg,mensagensEnviar);

	}
});

// Auxiliares pra evitar erros e fechar direito
var fechando = false;
async function exitHandler() {
	if(fechando){
		return;
	}
	fechando = true;

	console.log(`[exitHandler] Pedido pra encerrar o processo.`);
	const qtdMortos = getQtdMortos();
	const tempoEsperar = qtdMortos*600;
	if(qtdMortos > 0){
		console.log(`\t- ${qtdMortos} pessoas fora de grupo, aguardando ${tempoEsperar}ms para ressucitarem...`);
		ressuscitaTodos();
		await sleep(tempoEsperar);
	}

	console.log(`[exitHandler] Todos de volta aos seus grupos`);
	console.log("[exitHandler] Saindo!");
	process.exit(0);
}

process.on('exit', exitHandler.bind(null));
process.on('SIGINT', exitHandler.bind(null));
process.on('SIGTERM', exitHandler.bind(null));
process.on('SIGUSR1', exitHandler.bind(null));
process.on('SIGUSR2', exitHandler.bind(null));

// Exceções que não foram pegas em outras partes explicitamente, pega aqui pra evitar que ele feche por besteira
process.on('unhandledRejection', (reason, p) => console.warn(reason,p)).on('uncaughtException', err => console.warn(err));