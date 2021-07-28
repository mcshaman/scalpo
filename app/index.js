import { getTick } from './btcMarketsApi.js'
import Packets from './Packets.js'
import chalk from 'chalk'
import { stripIndent } from 'common-tags'

/**
 * @param {number} startValue
 * @param {number} endValue
 */
function getPercent(startValue, endValue) {
	return (endValue / startValue) * 100
}

/**
 * @param {number} startValue
 * @param {number} endValue
 */
function getPercentDiff(startValue, endValue) {
	const percent = getPercent(startValue, endValue)

	return percent - 100
}

/**
 * @param {number} startValue
 * @param {number} endValue
 * @param {number} percentMargin
 */
function getIsOverPercentMargin(startValue, endValue, percentMargin) {
	const percentDiff = getPercentDiff(startValue, endValue)

	return percentDiff > percentMargin
}

/**
 * @param {number} value
 */
function formatPrice(value) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

/**
 * @param {number} value
 */
function formatPercent(value) {
	return new Intl.NumberFormat('en-US', {
		style: 'percent',
		maximumFractionDigits: 2,
	}).format(value / 100)
}

/**
 * @param {number} tickBestBid
 * @param {Packets} packets
 * @param {number} minPercentMargin
 */
function logAcquisitions(tickBestBid, packets, minPercentMargin) {
	const lastPurchasedPrice = packets.lastPurchased.purchasePrice

	const formattedLastPurchasePrice = formatPrice(lastPurchasedPrice)

	const maxPurchasePrice = lastPurchasedPrice - (lastPurchasedPrice * minPercentMargin) / 100
	const formattedMaxPurchasePrice = formatPrice(maxPurchasePrice)
	const formattedMinPercentMargin = formatPercent(minPercentMargin)

	const isOverPercentMargin = getIsOverPercentMargin(tickBestBid, lastPurchasedPrice, minPercentMargin)
	const colourise = isOverPercentMargin ? chalk.green : chalk.red
	const formattedBestOfferPrice = colourise(formatPrice(tickBestBid))
	const formattedBestOfferPercent = colourise(formatPercent(getPercentDiff(tickBestBid, lastPurchasedPrice)))

	console.log(stripIndent`
		🛒 Acquisitions
		   Last purchase price: ${formattedLastPurchasePrice}
		   Max purchase price: ${formattedMaxPurchasePrice} • ${formattedMinPercentMargin}
		   Best offer: ${formattedBestOfferPrice} • ${formattedBestOfferPercent}
	`)

	console.log()
}

/**
 * @param {number} tickBestBid
 * @param {import('./Packets.js').Packet} packet
 * @param {number} minPercentMargin
 */
function logSales(tickBestBid, packet, minPercentMargin) {
	const purchasePrice = packet.purchasePrice

	const formattedPurchasePrice = formatPrice(purchasePrice)

	const minSellPrice = purchasePrice + (purchasePrice * minPercentMargin) / 100
	const formattedMinSellPrice = formatPrice(minSellPrice)
	const formattedMinPercentMargin = formatPercent(minPercentMargin)

	const isOverPercentMargin = getIsOverPercentMargin(tickBestBid, purchasePrice, minPercentMargin)
	const colourise = isOverPercentMargin ? chalk.green : chalk.red
	const formattedBestOfferPrice = colourise(formatPrice(tickBestBid))
	const formattedBestOfferPercent = colourise(formatPercent(getPercentDiff(tickBestBid, purchasePrice)))

	console.log(stripIndent`
		💰 Sales
		   Purchase price: ${formattedPurchasePrice}
		   Min sell price: ${formattedMinSellPrice} • ${formattedMinPercentMargin}
		   Best offer: ${formattedBestOfferPrice} • ${formattedBestOfferPercent}
	`)

	console.log()
}

/**
 * @param {number} tickBestBid
 * @param {Packets} packets
 */
function shouldPurchase(tickBestBid, packets) {
	if (packets.purchased.length === 0) {
		const formattedBestOfferPrice = chalk.green(formatPrice(tickBestBid))

		console.log(stripIndent`
			🛒 Acquisitions
			   Best offer: ${formattedBestOfferPrice}
		`)

		console.log()

		return true
	}

	const packetLastPurchased = packets.lastPurchased
	const minPercentMargin = 1.5

	logAcquisitions(tickBestBid, packets, minPercentMargin)

	if (getIsOverPercentMargin(tickBestBid, packetLastPurchased.purchasePrice, minPercentMargin)) {
		return true
	}

	return false
}

/**
 * @param {number} tickBestBid
 * @param {import('./Packets.js').Packet} packet
 */
function shouldSell(tickBestBid, packet) {
	const minPercentMargin = 1.5

	logSales(tickBestBid, packet, minPercentMargin)

	if (getIsOverPercentMargin(tickBestBid, packet.purchasePrice, minPercentMargin)) {
		return true
	}

	return false
}

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
