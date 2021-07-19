require('dotenv-flow').config();
const express = require('express');
const packetModel = require("./models/packets");
const crypto = require('crypto');
const axios = require('axios')

const {
	BTC_MARKETS_API_KEY,
	BTC_MARKETS_PRIVATE_KEY,
	PORT = 5000,
	POLLING_INTERVAL = 5000,
} = process.env

if (!BTC_MARKETS_API_KEY || !BTC_MARKETS_PRIVATE_KEY) {
	console.log('🚨 BTC Markets ENVs not set')
	process.exit()
}

const btcMarketsApi = axios.create({
    baseURL: 'https://api.btcmarkets.net',
    headers: {
        'Accept-Charset': 'UTF-8',
        'Content-Type': 'application/json',
    }
});

// SERVER CONFIG
const app = express();
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

function buildAuthHeaders(method, path) {
    const now = Date.now()

    return headers = {
        'BM-AUTH-APIKEY': BTC_MARKETS_API_KEY,
        'BM-AUTH-TIMESTAMP': now,
        'BM-AUTH-SIGNATURE': signMessage(
            BTC_MARKETS_PRIVATE_KEY,
            `${method}${path}${now}`
        ),
    }
}

function signMessage(secret, message) {
    var buffer = Buffer.from(secret, 'base64');
    var hmac = crypto.createHmac('sha512', buffer);
    var signature = hmac.update(message).digest('base64');
    return signature;
}

let activePackets = 0;

async function monitorPrice() {
	const marketId = 'ETH-AUD'

    console.log("Checking prices...");

    const response = await btcMarketsApi({
        method: 'get',
        url: `/v3/markets/${marketId}/ticker`,
        headers: buildAuthHeaders('get', `/v3/markets/${marketId}/ticker`),
    })

    console.log(`FreshMarketData: $${response.data.lastPrice}`)

    // console.table([{
    //     'Input Token': inputTokenSymbol,
    //     'Output Token': outputTokenSymbol,
    //     'Input Amount': web3.utils.fromWei(inputAmount, 'Ether'),
    //     'Uniswap Return': web3.utils.fromWei(uniswapResult, 'Ether'),
    //     'Kyber Expected Rate': web3.utils.fromWei(kyberResult.expectedRate, 'Ether'),
    //     'Kyber Min Return': web3.utils.fromWei(kyberResult.slippageRate, 'Ether'),
    //     'Timestamp': moment().tz('America/Chicago').format(),
    // }])

    //Rule 1:  If no active packets, buy a packet
    if (!activePackets && (response.data.lastPrice > 0)) {
        const result = await packetModel.create(marketId, 'ACTIVE')
        console.log(result)
//        console.log("Packet should be created here ... "+packet_id);
        activePackets++;
    }
    //Rule 1:  If no active packets, buy a packet and set a lastPurchasePrice
    //Rule 2:  If price drops 1.5% below lastPurchasePrice, buy a packet.
    //Rule 3:  If a buy order is "Fully Matched"? and has no Sell Order, Create sell order for 1.5% higher price
    //Rule 4:  If an active packet has both Buy and sell orders "Fully Matched", then set the packet as completed
}

setInterval(monitorPrice, POLLING_INTERVAL)
