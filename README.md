# garrusbot - jogos do zap

## Instruções

Instalar [node.js](https://nodejs.org/) e requisitos:

```sh
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
npm i whatsapp-web.js qrcode-terminal qr-image
```

Edite o arquivo `credenciais.js` com seus dados do Portal UFSM:

```sh
{
	"usuario": 12345,
	"senha": "password"
}
```

Execute o script:

```sh
node index.js
```