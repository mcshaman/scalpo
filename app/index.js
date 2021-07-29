import shouldPurchase from './shouldPurchase.js'
import { getTick } from './btcMarketsApi.js'
import Packets from './Packets.js'
import shouldSell from './shouldSell.js'

/**
 * @param {Packets} packets
 */
async function monitorPrice(packets) {
	const tick = await getTick()

	const tickBestBid = parseFloat(tick.bestBid)

	if (shouldPurchase(tickBestBid, packets)) {
		await packets.add({
			purchasePrice: parseFloat(tick.bestBid),
			purchaseTimestamp: new Date(tick.timestamp).getTime(),
		})
	}

	packets.purchased.forEach((packet) => {
		if (shouldSell(tickBestBid, packet)) {
			packets.sell(packet.id, {
				sellPrice: parseFloat(tick.bestBid),
				sellTimestamp: new Date(tick.timestamp).getTime(),
			})
		}
	})
}

async function main() {
	const packets = await new Packets().initialise()

	const { POLLING_INTERVAL = '5000' } = process.env

	setInterval(() => monitorPrice(packets), parseInt(POLLING_INTERVAL))
}

main()
