let clientBot = undefined;
function setWrapperClient(client){
	clientBot = client;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function roughSizeOfObject( object ) {
	var objectList = [];
	var stack = [ object ];
	var bytes = 0;

	while ( stack.length ) {
		var value = stack.pop();

		if ( typeof value === 'boolean' ) {
			bytes += 4;
		}
		else if ( typeof value === 'string' ) {
			bytes += value.length * 2;
		}
		else if ( typeof value === 'number' ) {
			bytes += 8;
		}
		else if
		(
			typeof value === 'object'
			&& objectList.indexOf( value ) === -1
		)
		{
			objectList.push( value );

			for( var i in value ) {
				stack.push( value[ i ] );
			}
		}
	}
	return bytes;
}

function logMensagemEnviada(tipo,msgEnviar,opts,destinatario){
	// Log dados da mensagem
	if (typeof msgEnviar.msg === 'string'){
		let msgAbreviada = msgEnviar.msg.replace(/\n/g,"\\n");
		if(msgEnviar.msg.length > 50){
			msgAbreviada = msgEnviar.msg.substring(0,50)+"...";
		}
		console.log(`[sistema][msg][${tipo}] ${msgAbreviada} para '${destinatario}'`);
	} else {
		console.log(`[sistema][msg][${tipo}][media] opts: ${JSON.stringify(opts)} para '${destinatario}'`);
	}
}

async function reagirMsg(msg,emoji){
	try {
		await msg.react(emoji);
	} catch(e){
		console.warn(`[reagirMsg] Erro enviando react '${emoji}'. (${e})`);
	}
}

async function removerPessoasGrupo(grupo,pessoas){
	try{
		if(Array.isArray(pessoas)){
			await grupo.removeParticipants(pessoas);
		} else {
			await grupo.removeParticipants([pessoas]);
		}
	} catch(e){
		console.warn(`[removerPessoasGrupo] Erro removendo pessoas '${JSON.stringify(pessoas)}'. (${e})`);
	}
}

async function adicionarPessoasGrupo(grupo,pessoas){
	try{

		if(Array.isArray(pessoas)){
			await grupo.addParticipants(pessoas);
		} else {
			await grupo.addParticipants([pessoas]);
		}
	} catch(e){
		console.warn(`[adicionarPessoasGrupo] Erro adicionando pessoas '${JSON.stringify(pessoas)}'. (${e})`);
	}
}

async function tornarPessoasAdmin(grupo,pessoas){
	try{
		if(Array.isArray(pessoas)){
			await grupo.promoteParticipants(pessoas);
		} else {
			await grupo.promoteParticipants([pessoas]);
		}
	} catch(e){
		console.warn(`[tornarPessoasAdmin] Erro tornando pessoas admin '${JSON.stringify(pessoas)}'. (${e})`);
	}
}

async function dispatchMessages(msg,mensagensEnviar,quotedMsg=undefined,nomeGrupo="garrus"){
	console.log(`[dispatchMessages] Enviando ${mensagensEnviar.length} mensagens.`);
	let toEnvioAtual = 0;

	mensagensEnviar.forEach((mesgEnviar) => {
		
		toEnvioAtual += getRandomInt(0,50);
		setTimeout((msgObj, qutdMsg, msgEnviar) => { // Pra não responder msgs instant
			// Opções de envio
			let opts = undefined;
			if(msgEnviar.isSticker){
				if(opts){
					opts.sendMediaAsSticker = true;
					opts.stickerAuthor = `legionbot`;
					opts.stickerName = `sticker-${nomeGrupo}`;
				} else {
					opts = {
						sendMediaAsSticker: true,
						stickerAuthor: `legionbot`,
						stickerName: `sticker-${nomeGrupo}`
					};
				}
			} 
			if(msgEnviar.isGif){
				if(opts){
					opts.sendVideoAsGif = true;
				} else {
					opts = {
						sendVideoAsGif: true,
					};
				}
			}
			if(msgEnviar.isAudio){
				if(opts){
					opts.sendAudioAsVoice = true;
				} else {
					opts = {
						sendAudioAsVoice: true,
					};
				}
			}
			if(msgEnviar.isFile){
				if(opts){
					opts.sendMediaAsDocument = true;
				} else {
					opts = {
						sendMediaAsDocument: true,
					};
				}
			}

			if(msgEnviar.replyCustomMsg){
				msgEnviar.reply = false; // Pra ter certeza que vai usar o sendMessage
				if(opts){
					opts.quotedMessageId = msgEnviar.replyCustomMsg;
				} else {
					opts = {
						quotedMessageId: msgEnviar.replyCustomMsg
					};
				}
			}
			if(msgEnviar.legenda){
				if(opts){
					opts.caption = msgEnviar.legenda;
				} else {
					opts = {
						caption: msgEnviar.legenda
					};
				}
			}
			if(msgEnviar.marcarPessoas){
				if(opts){
					opts.mentions = msgEnviar.marcarPessoas;
				} else {
					opts = {
						mentions: msgEnviar.marcarPessoas
					};
				}
			}

			// Envia
			try{
				if(msgEnviar.react){
					if(msgEnviar.react.length > 0){
						reagirMsg(msgObj,msgEnviar.react);
						if(qutdMsg){
							reagirMsg(qutdMsg,msgEnviar.react);
						}
					}
				}
				if(msgEnviar.reply){
					if(qutdMsg){
						// Se alguém quotou uma mensagem, responde pra ela ao invés da original
						// Isso pode dar erro pq a mensagem já foi deletada, por isso esse monte de catch
						qutdMsg.reply(msgEnviar.msg,msgObj.from,opts).catch(e => {
							console.warn(`[sistema] Erro usando quotedMsg.reply, provavelmente não existe mais.`);
							msgObj.reply(msgEnviar.msg,msgObj.from,opts).catch(e => {
								// Algumas vezes o whatsweb não consegue dar reply numa mensagem, então aqui a gente apela por enviar ela sem ser reply mesmo. (último caso)
								console.warn(`[sistema] Erro usando messg.reply, provavelmente não existe mais.`);
								clientBot.sendMessage(msgObj.from,msgEnviar.msg,msgObj.from,opts).catch((e) => {
									console.warn(`[sistema][msg][erro][q] ${e}`);
									//reagirMsg(msg,"🚫");
								});
							});
						});
					} else {
						msgObj.reply(msgEnviar.msg,msgObj.from,opts).catch(e => {
							console.warn(`[sistema] Erro usando msg.reply, provavelmente não existe mais.`);
							clientBot.sendMessage(msgObj.from,msgEnviar.msg,msgObj.from,opts).catch((e) => {
								console.warn(`[sistema][msg][erro][nq] ${e}`);
								//reagirMsg(msgObj,"🚫");
							});
						});
					}

					logMensagemEnviada(`reply (${toEnvioAtual}ms)`,msgEnviar,opts,msgObj.from);
				} else {
					clientBot.sendMessage(msgObj.from, msgEnviar.msg, opts).catch((e) => {
						console.warn(`[sistema][msg][erro][nr] ${e}`);
						//reagirMsg(msgObj,"🚫");
					});
					logMensagemEnviada(`sendMessage (${toEnvioAtual}m)`,msgEnviar,opts,msgObj.from);
				}
			} catch(e){
				let msgErro = e.toString();
				console.warn(`[sistema] Erro enviando mensagem: ${msgErro}`);
				console.warn("stack");
				console.warn(e.stack);
				console.warn("message");
			    console.warn(e.message);
			    console.warn("name");
			    console.warn(e.name);
			}
		}, toEnvioAtual, msg, quotedMsg, mesgEnviar);
	});
}

module.exports = { reagirMsg, removerPessoasGrupo, adicionarPessoasGrupo, tornarPessoasAdmin, dispatchMessages, setWrapperClient }