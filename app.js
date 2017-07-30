const https = require('https');
const mongoose    = require('mongoose');
const env 		  = require('node-env-file');
env(`${__dirname}/.env`);

mongoose.connect(process.env.MONGODB_URL);
mongoose.Promise = global.Promise;

const Quote = require('./quote.js');

let foreign, domestic;

function refresh () {
	https.get('https://api.coinbase.com/v2/prices/btc-usd/spot', res => {
		let string = '';

		res.on('data', chunk => {
			string += chunk;
		});

		res.on('end', () => {
			const data = JSON.parse(string);

			const quote = new Quote({
				time: new Date,
				code: 'btc-coinbase',
				currency: 'usd',
				price: Number(data.data.amount)
			});
			quote.save();
			foreign = data.data.amount;
			showDiff();
		});
	});

	https.get('https://www.okex.com/api/v1/future_ticker.do?symbol=btc_usd&contract_type=quarter', res => {
		let string = '';

		res.on('data', chunk => {
			string += chunk;
		});

		res.on('end', () => {
			const data = JSON.parse(string);
			const quote = new Quote({
				time: new Date,
				code: 'btcfq-okex',
				currency: 'usd',
				price: data.ticker.last
			});
			quote.save();
			domestic = data.ticker.last;
			showDiff();
		});
	});
}

function showDiff () {
	
	if (!domestic || !foreign) {
		return;
	}

	console.log((new Date()).toString(), (domestic - foreign).toFixed(2), ((1 - foreign / domestic) * 100).toFixed(2));
}

setInterval(refresh, 4000);
