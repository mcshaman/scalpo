import { join } from 'path'
import { Low, JSONFile } from 'lowdb'

/**
 * @typedef {Object} Packet
 * @property {number} purchasePrice
 * @property {number} purchaseTimestamp
 * @property {'purchased' | 'sold'} status
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

	get purchased() {
		return this.all.filter(packet => packet.status === 'purchased')
	}

	get lastPurchased() {
		return this.purchased.sort((a, b) => b.purchaseTimestamp - a.purchaseTimestamp)[0]
	}

	/**
	 * @param {Object} purchaseData
	 * @param {number} purchaseData.purchasePrice
	 * @param {number} purchaseData.purchaseTimestamp
	 */
	async add(purchaseData) {
		this.all.push({...purchaseData, status: 'purchased'})

		await this.#packets.write()
	}
}
