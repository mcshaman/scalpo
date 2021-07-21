import { getTick } from './btcMarketsApi.js'
import Packets from './Packets.js'

const packets = new Packets()

async function monitorPrice() {
	const tick = await getTick()

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
		await packets.add(tick)

		console.log(`✨  added ticker data with best bid $${tick.bestBid}`)
	}
	//Rule 1:  If no active packets, buy a packet and set a lastPurchasePrice
	//Rule 2:  If price drops 1.5% below lastPurchasePrice, buy a packet.
	//Rule 3:  If a buy order is "Fully Matched"? and has no Sell Order, Create sell order for 1.5% higher price
	//Rule 4:  If an active packet has both Buy and sell orders "Fully Matched", then set the packet as completed
}

const { POLLING_INTERVAL = '5000' } = process.env

setInterval(monitorPrice, parseInt(POLLING_INTERVAL))
