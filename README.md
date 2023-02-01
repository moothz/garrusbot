# garrusbot - jogos do zap

## O que é?

Este é um bot de joguinhos para WhatsApp que utiliza a biblioteca [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).
Na versão atual, está implementada apenas a **!roletarussa**.

## Quais as funções planejadas?

* **Jokenpo**: Pedra, papel e tesoura contra o bot
* **Comandos de zueira** do legion bot (!tinder, !pinto, etc.)

## Requisitos

* **Servidor** que irá hospedar o bot, Windows ou Linux. Ele não precisa de muito pra rodar, até um _Raspberry Pi_ serve!
* **WhatsApp** conectado em algum número. Você irá escanear um QRCode em "Dispositivos Conectados". _Não use seu número_, compre um chip só pra isso e habilite-o usando um _Dual Messenger/coisa parecida_ ou em outro celular. Bots _não são_ permitidos no WhatsApp e você **SERÁ** banido.

## Instruções

Instalar [node.js](https://nodejs.org/) e requisitos:

### Instalar node (debians, ubuntus)
```sh
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Instalar node (Windows)

Acesse o [site oficial do nodejs](https://nodejs.org/), baixe e instale a última versão.


### Instalar pacotes necessários

Baixe/clone este repositório e em um terminal na mesma pasta, execute:

```sh
npm i whatsapp-web.js qrcode-terminal qr-image
```

Edite o arquivo `configs.js` com o número do chip

```js
const meuNumero = "555598765432";	// O número do chip (o mesmo que aparece no contato do whatsapp)
```

Edite o arquivo `roleta-opcoes.json` conforme achar melhor:

```json
{
	"tempoFora": 120,					// Tempo, em segundos, que a pessoa irá ficar fora do grupo após perder
	"permiteTirosConsecutivos": true,	// Permite que a pessoa tente várias vezes em sequencia
	"tempoAntesRemover": 10,			// Tempo, em segundos, que o bot aguarda antes de remover a pessoa do grupo
	"tempoAguardarAdd": 60				// Não é necessário editar
}
```

### Executar o bot

```sh
node index.js
```

Quando solicitado, escaneie o `QRCode` apresentado no terminal ou no arquivo `logar.png`.
O arquivo `iniciar-bot.bat` serve para reiniciar o bot quando acontecer algum erro inesperado (solução simples).