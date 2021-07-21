import express from 'express'
import Packets from './Packets.js'
import crypto from 'crypto'
import axios from 'axios'

const { BTC_MARKETS_API_KEY, BTC_MARKETS_PRIVATE_KEY, PORT = '5000', POLLING_INTERVAL = '5000' } = process.env

if (!BTC_MARKETS_API_KEY || !BTC_MARKETS_PRIVATE_KEY) {
	console.log('🚨 BTC Markets ENVs not set')
	process.exit()
}

const btcMarketsApi = axios.create({
	baseURL: 'https://api.btcmarkets.net',
	headers: {
		'Accept-Charset': 'UTF-8',
		'Content-Type': 'application/json',
	},
})

const packets = new Packets()

// SERVER CONFIG
const app = express()
app.listen(PORT, () => console.log(`Listening on ${PORT}`))

function buildAuthHeaders(method, path) {
	const now = Date.now()

	return {
		'BM-AUTH-APIKEY': BTC_MARKETS_API_KEY,
		'BM-AUTH-TIMESTAMP': now,
		'BM-AUTH-SIGNATURE': signMessage(BTC_MARKETS_PRIVATE_KEY, `${method}${path}${now}`),
	}
}

function signMessage(secret, message) {
	var buffer = Buffer.from(secret, 'base64')
	var hmac = crypto.createHmac('sha512', buffer)
	var signature = hmac.update(message).digest('base64')
	return signature
}

async function monitorPrice() {
	const marketId = 'ETH-AUD'

	const response = await btcMarketsApi({
		method: 'get',
		url: `/v3/markets/${marketId}/ticker`,
		headers: buildAuthHeaders('get', `/v3/markets/${marketId}/ticker`),
	})

	// console.table([{
	//	'Input Token': inputTokenSymbol,
	//	'Output Token': outputTokenSymbol,
	//	'Input Amount': web3.utils.fromWei(inputAmount, 'Ether'),
	//	'Uniswap Return': web3.utils.fromWei(uniswapResult, 'Ether'),
	//	'Kyber Expected Rate': web3.utils.fromWei(kyberResult.expectedRate, 'Ether'),
	//	'Kyber Min Return': web3.utils.fromWei(kyberResult.slippageRate, 'Ether'),
	//	'Timestamp': moment().tz('America/Chicago').format(),
	// }])

	//Rule 1:  If no active packets, buy a packet
	const allPackets = await packets.getAll()
	if (allPackets.length === 0) {
		await packets.add(response.data)

		console.log(`✨  added ticker data with best bid $${response.data.bestBid}`)
	}
	//Rule 1:  If no active packets, buy a packet and set a lastPurchasePrice
	//Rule 2:  If price drops 1.5% below lastPurchasePrice, buy a packet.
	//Rule 3:  If a buy order is "Fully Matched"? and has no Sell Order, Create sell order for 1.5% higher price
	//Rule 4:  If an active packet has both Buy and sell orders "Fully Matched", then set the packet as completed
}

setInterval(monitorPrice, parseInt(POLLING_INTERVAL))
