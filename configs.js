const headlessMode = true;			// true - janela escondida / false - mostra janela do navegador
const clientID = "garrusbot";		// Nome da sessão do whatsapp
const meuNumero = "55XXXXXXXXXX";	// O número do chip

// Configurações da Roleta Russa
const roletaRussa = {
	tempoFora: 300,						// Tempo fora do grupo (s)
	permiteTirosConsecutivos: false,	// false: 1 tentativa por vez / true: pessoa pode tentar ao infinito
	tempoAguardarAdd: 60,				// Tempo (s) pra ver se a pessoa realmente foi adicionada no grupo (WhatsApp demora pra atualizar)
	tempoAntesRemover: 10,				// Tempo (s) antes de remover a pessoa do grupo quando perde

	arquivoDados: "roleta.json",		// Arquivo JSON onde serão armazenados os dados da roleta
	fim: ""
}

module.exports = { headlessMode, clientID, roletaRussa };