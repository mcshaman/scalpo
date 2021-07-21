import axios from 'axios'
import crypto from 'crypto'

const { BTC_MARKETS_API_KEY, BTC_MARKETS_PRIVATE_KEY } = process.env

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

/**
 * @typedef {Object} Tick
 * @property {string} marketId
 * @property {string} bestBid
 * @property {string} bestAsk
 * @property {string} lastPrice
 * @property {string} volume24h
 * @property {string} volumeQte24h
 * @property {string} price24h
 * @property {string} pricePct24h
 * @property {string} low24h
 * @property {string} high24h
 * @property {string} timestamp
 */

export async function getTick() {
	const marketId = 'ETH-AUD'

	const tick = await btcMarketsApi({
		method: 'get',
		url: `/v3/markets/${marketId}/ticker`,
		headers: buildAuthHeaders('get', `/v3/markets/${marketId}/ticker`),
	})

	return /** @type {import('axios').AxiosResponse<Tick>} */ (tick).data
}
