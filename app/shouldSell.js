import chalk from 'chalk'
import { stripIndent } from 'common-tags'
import { formatPercent, formatPrice, getIsOverPercentMargin, getPercentDiff } from './numberUtils.js'

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
 * @param {import('./Packets.js').Packet} packet
 */
export default function shouldSell(tickBestBid, packet) {
	const minPercentMargin = 1.5

	logSales(tickBestBid, packet, minPercentMargin)

	if (getIsOverPercentMargin(tickBestBid, packet.purchasePrice, minPercentMargin)) {
		return true
	}

	return false
}
