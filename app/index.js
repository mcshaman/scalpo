import { getTick } from './btcMarketsApi.js'
import Packets from './Packets.js'

/**
 * @param {Packets} packets
 */
async function monitorPrice(packets) {
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
	const tickBestBid = parseFloat(tick.bestBid)

	if (packets.all.length === 0) {
		console.log(`🛒  purchasing $${tickBestBid} packet – first packet`)

		return await packets.add({
			purchasePrice: parseFloat(tick.bestBid),
			purchaseTimestamp: new Date(tick.timestamp).getTime(),
		})
	}

	//Rule 2:  If price drops 1.5% below lastPurchasePrice, buy a packet.
	const packetsLastPurchased = packets.lastPurchased

	if (tickBestBid < packetsLastPurchased.purchasePrice) {
		console.log(
			`🛒  purchasing $${tickBestBid} packet – last purchased packet $${packetsLastPurchased.purchasePrice}`,
		)

		return await packets.add({
			purchasePrice: parseFloat(tick.bestBid),
			purchaseTimestamp: new Date(tick.timestamp).getTime(),
		})
	}

	//Rule 3:  If a buy order is "Fully Matched"? and has no Sell Order, Create sell order for 1.5% higher price
	//Rule 4:  If an active packet has both Buy and sell orders "Fully Matched", then set the packet as completed
}

async function main() {
	const packets = await new Packets().initialise()

	const { POLLING_INTERVAL = '5000' } = process.env

	setInterval(() => monitorPrice(packets), parseInt(POLLING_INTERVAL))
}

main()
