import { getTick } from './btcMarketsApi.js'
import Packets from './Packets.js'
import chalk from 'chalk'

/**
 * @param {number} valueA
 * @param {number} valueB
 * @param {number} minPercent
 */
function isMinimumDifference(valueA, valueB, minPercent) {
	const difference = valueB - valueA
	const differencePercent = (difference / valueA) * 100
	return differencePercent > minPercent
}

/**
 * @param {number} tickBestBid
 * @param {Packets} packets
 */
function shouldPurchase(tickBestBid, packets) {
	if (packets.purchased.length === 0) {
		console.log(`🛒  purchase packet ${makePrice(tickBestBid)}`)

		return true
	}

	const packetLastPurchased = packets.lastPurchased

	if (isMinimumDifference(packetLastPurchased.purchasePrice, tickBestBid, 1.5)) {
		const difference = packetLastPurchased.purchasePrice - tickBestBid
		console.log(`🛒  purchase packet ${makePrice(tickBestBid)} ${makeRelativePrice(difference)}`)

		return true
	}

	return false
}

/**
 * @param {number} tickBestBid
 * @param {import('./Packets.js').Packet} packet
 */
function shouldSell(tickBestBid, packet) {
	if (isMinimumDifference(packet.purchasePrice, tickBestBid, 1.5)) {
		const difference = tickBestBid - packet.purchasePrice
		console.log(`💰  sell packet ${makePrice(tickBestBid)} ${makeRelativePrice(difference)}`)

		return true
	}

	return false
}

function makeRelativePrice(value) {
	const price = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		signDisplay: 'exceptZero',
	}).format(value)

	return `${chalk.bold.green(price)}`
}

function makePrice(value) {
	const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
	return `${chalk.bold(price)}`
}

/**
 * @param {Packets} packets
 */
async function monitorPrice(packets) {
	const tick = await getTick()

	const tickBestBid = parseFloat(tick.bestBid)

	//Rule 2:  If price drops 1.5% below lastPurchasePrice, buy a packet.
	if (shouldPurchase(tickBestBid, packets)) {
		await packets.add({
			purchasePrice: parseFloat(tick.bestBid),
			purchaseTimestamp: new Date(tick.timestamp).getTime(),
		})
	}

	//Rule 3:  If a buy order is "Fully Matched"? and has no Sell Order, Create sell order for 1.5% higher price
	packets.purchased.forEach((packet) => {
		if (shouldSell(tickBestBid, packet)) {
			packets.sell(packet.id, {
				sellPrice: parseFloat(tick.bestBid),
				sellTimestamp: new Date(tick.timestamp).getTime(),
			})
		}
	})

	//Rule 4:  If an active packet has both Buy and sell orders "Fully Matched", then set the packet as completed
}

async function main() {
	const packets = await new Packets().initialise()

	const { POLLING_INTERVAL = '5000' } = process.env

	setInterval(() => monitorPrice(packets), parseInt(POLLING_INTERVAL))
}

main()
