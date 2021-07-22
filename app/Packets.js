import { join } from 'path'
import { Low, JSONFile } from 'lowdb'

/**
 * @typedef {Object} Packet
 * @property {number} purchasePrice
 * @property {number} purchaseTimestamp
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

	get lowestPurchasePrice() {
		const lowestPurchasePrices = this.all.map(item => item.purchasePrice)
		return Math.min(...lowestPurchasePrices)
	}

	/**
	 * @param {Packet} packet
	 */
	async add(packet) {
		this.all.push(packet)

		await this.#packets.write()
	}
}
