import chalk from 'chalk'
import { stripIndent } from 'common-tags'
import { formatPercent, formatPrice, getIsOverPercentMargin, getPercentDiff } from './numberUtils'
import Packets from './Packets'

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
 * @param {Packets} packets
 */
export default function shouldPurchase(tickBestBid, packets) {
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
