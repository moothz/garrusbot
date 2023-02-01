const headlessMode = true;			// true - janela escondida / false - mostra janela do navegador
const clientID = "garrus_bot";		// Nome da sessão do whatsapp
const meuNumero = "555598765432";	// O número do chip (o mesmo que aparece no contato do whatsapp)

// Configurações da Roleta Russa
const roletaRussa = {
	arquivoDados: "roleta-dados.json",		// Arquivo JSON onde serão armazenados os dados da roleta
	arquivoOpcoes: "roleta-opcoes.json",		// Arquivo JSON onde serão armazenados as opcoes da roleta
	fim: ""
}

module.exports = { headlessMode, meuNumero, clientID, roletaRussa };