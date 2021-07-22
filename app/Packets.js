import { join } from 'path'
import { Low, JSONFile } from 'lowdb'

/**
 * @typedef {Object} Packet
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

export default class Packets {
	/**
	 * @type {Low<Packet[]>}
	 */
	#packets

	constructor() {
		const file = join(process.cwd(), 'packets.json')
		/** @type {JSONFile<Packet[]>} */
		const adapter = new JSONFile(file)
		this.#packets = new Low(adapter)
	}

	get #data() {
		const { data } = this.#packets

		if (!data) {
			throw new Error('🤬 Packets instance not initialised')
		}

		return data
	}

	async initialise() {
		const packets = this.#packets

		await packets.read()

		packets.data = packets.data || []

		return this
	}

	get all() {
		return this.#data
	}

	get lowestBestBid() {
		const bestBids = this.#data.map(item => parseFloat(item.bestBid))
		return Math.min(...bestBids).toString()
	}

	/**
	 * @param {Packet} packet
	 */
	async add(packet) {
		this.#data.push(packet)

		await this.#packets.write()
	}
}
