const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 4003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const { Client, LocalAuth } = require('whatsapp-web.js');
const { phoneNumberFormatter } = require('./helpers/formatter');
const client = new Client({
	restartOnAuthFail: true,
	authStrategy: new LocalAuth(),
	puppeteer: {
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	},
	webVersionCache: {
		type: 'remote',
		remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2332.15.html'
	},
});

client.on('qr', qr => {
	qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
	console.log('Client is ready!');
});

client.on('disconnected', (reason) => {
	client.initialize();
})

client.initialize();

app.get('/', (req, res) => {
	return res.send('Whatsapp BOT Marketing LP3I 🇮🇩');
})


app.post('/send', (req, res) => {
	try {
		const state = client.getState();
		const statePromise = new Promise((resolve, reject) => {
			resolve(state);
		});
		statePromise.then(async (value) => {
			if (value === 'CONNECTED') {
				let target = phoneNumberFormatter(req.body.target);
				let message = req.body.message;
				client.sendMessage(target, message);
				return res.json({
					status: true,
				});
			}
		})
			.catch((error) => {
				return res.json({
					status: false
				})
			})
	} catch (error) {
		return res.json({
			status: false
		})
	}
});

app.listen(port, () => {
	console.log(`http://localhost:${port}`);
})
