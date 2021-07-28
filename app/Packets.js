import { join } from 'path'
import { Low, JSONFile } from 'lowdb'
import { v4 as uuidv4 } from 'uuid'

/**
 * @typedef {Object} Packet
 * @property {string} id
 * @property {number} purchasePrice
 * @property {number} purchaseTimestamp
 * @property {number} [sellPrice]
 * @property {number} [sellTimestamp]
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

	#getPacketIndex(packetId) {
		return this.all.findIndex(packet => packet.id === packetId)
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
		this.all.push({...purchaseData, id: uuidv4(), status: 'purchased'})

		await this.#packets.write()
	}

	/**
	 * @param {string} packetId
	 * @param {Object} sellData
	 * @param {number} sellData.sellPrice
	 * @param {number} sellData.sellTimestamp
	 */
	async sell(packetId, sellData) {
		const packetIndex = this.#getPacketIndex(packetId)

		const packet = this.all[packetIndex]
		this.all[packetIndex] = {
			...packet,
			...sellData,
			status: 'sold'
		}

		await this.#packets.write()
	}
}
