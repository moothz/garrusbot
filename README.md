
# 🤖 garrusbot - jogos do zap

Um bot de joguinhos para WhatsApp que utiliza a biblioteca [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)!

## Lista de Comandos
Essa é a lista de comandos planejados para o bot, são funções que foram removidas do bot principal, o _legionbot_. Aos poucos estarei atualizando este repositório com novas funções.

No momento atual, esta são as funções pretendidas/implementadas no escopo do _garrusbot_:
- [X] **!roletarussa**: Roda a roleta, 1 em 6 chances de ser removido do grupo (o bot readiciona automaticamente após o tempo configurado)
- [ ] **!jokenpo**: Pedra, papel e tesoura contra o bot
- [ ] **!timeout** _n_ _@pessoa1 @pessoa2_:  Remove por _n_ segundos pessoas mencionadas na mensagem
- [ ] **!ban** _@pessoa1 @pessoa2_:  Remove por tempo indeterminado pessoas mencionadas na mensagem
- [ ] **Comandos de zueira** do legion bot (!tinder, !pinto, etc.)

## Requisitos

* **Um servidor** para hospedar o bot, _Windows_ ou _Linux_, capaz de rodar _nodejs_. Ele não precisa de muito pra rodar, até um _Raspberry Pi_ serve!
* **WhatsApp** conectado em algum número. Você irá escanear um QRCode em _"Dispositivos Conectados"_. _Não use seu número_, compre um chip só pra isso e habilite-o usando um _Dual Messenger/coisa parecida_ ou em outro celular. Bots _não são_ permitidos no WhatsApp e você **SERÁ** banido.

## Instruções
### 1. Instalar o Node.js
1. **Debian e derivados**
```sh
$ curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
$ sudo apt install -y nodejs
```
2. **Windows**:
	>Acesse o site oficial do [nodejs](https://nodejs.org/), baixe e instale a versão LTS.

### 2. Instalar pacotes necessários

1. Baixe/clone este repositório
2. Em um terminal na mesma pasta, execute:
```sh
npm i whatsapp-web.js qrcode-terminal qr-image
```
3. Edite o arquivo `configs.js`, alterando `meuNumero` com o número do seu chip.
```js
const meuNumero = "555598765432";
```
> O número deve obedecer o formato do WhasApp. Na dúvida, copie o número que aparece no contato do WhatApp, [abaixo da foto de perfil](https://imgur.com/a/Hh809rG).
4. Edite o arquivo `roleta-opcoes.json` conforme achar melhor:

```js
{
	"tempoFora": 120,					// Tempo, em segundos, que a pessoa irá ficar fora do grupo após perder
	"permiteTirosConsecutivos": true,	// Permite que a pessoa tente várias vezes em sequencia
	"tempoAntesRemover": 10,			// Tempo, em segundos, que o bot aguarda antes de remover a pessoa do grupo
	"tempoAguardarAdd": 60				// Não é necessário editar
}
```
### 3. Executar o bot
1. Ainda no mesmo diretório execute:
```sh
node index.js
```
2. Quando solicitado, escaneie o `QRCode` apresentado no terminal ou no arquivo `logar.png`.
3. _Opcional:_ O arquivo `iniciar-bot.bat` serve para reiniciar o bot quando acontecer algum erro inesperado (solução simples para o Windows). O que recomendo é rodá-lo como serviço, no Windows, gosto de utilizar o [nssm](https://nssm.cc/), no Linux, vá de [systemd](https://gist.github.com/leommoore/ea74061dc3bb086f36d42666a6153e0c).
