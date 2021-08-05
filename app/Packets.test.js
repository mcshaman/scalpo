import Packets, { Packet } from './Packets'
import * as lowdb from 'lowdb'

const mockedLowdb = /** @type {import('../__mocks__/lowdb').MockedLowdb} */ (lowdb)

afterEach(() => jest.clearAllMocks())

describe('when getting all from a Packets instance', () => {
	/** @type Packet */
	const packet1 = {
		purchasePrice: 3021.57,
		purchaseTimestamp: 1627336000179,
		id: '2575c164-fe99-4d76-8f4a-856c2e18fad3',
		status: 'sold',
		sellPrice: 2966,
		sellTimestamp: 1627348709510,
	}

	/** @type Packet */
	const packet2 = {
		purchasePrice: 3147.18,
		purchaseTimestamp: 1627467886702,
		id: '37a8532b-ba85-442c-9b73-06a32d830ef0',
		status: 'purchased',
	}

	test('and data source is empty, returns zero packets', async () => {
		mockedLowdb.setReadResult(undefined)

		const packets = await new Packets().initialise()

		expect(packets.all).toEqual([])
	})

	test('and data source contains zero packets, returns zero packets', async () => {
		mockedLowdb.setReadResult([])

		const packets = await new Packets().initialise()

		expect(packets.all).toEqual([])
	})

	test('and data source contains single packet, returns that packet', async () => {
		mockedLowdb.setReadResult([packet1])

		const packets = await new Packets().initialise()

		expect(packets.all).toEqual([packet1])
	})

	test('and data source contains multiple packets, returns those packets', async () => {
		mockedLowdb.setReadResult([packet1, packet2])

		const packets = await new Packets().initialise()

		expect(packets.all).toEqual([packet1, packet2])
	})
})

describe('when getting purchased from Packets instance', () => {
	/** @type Packet */
	const packet1Purchased = {
		purchasePrice: 3021.57,
		purchaseTimestamp: 1627336000179,
		id: '2575c164-fe99-4d76-8f4a-856c2e18fad3',
		status: 'purchased',
	}

	/** @type Packet */
	const packet1Sold = {
		purchasePrice: 3021.57,
		purchaseTimestamp: 1627336000179,
		id: '2575c164-fe99-4d76-8f4a-856c2e18fad3',
		status: 'sold',
		sellPrice: 2966,
		sellTimestamp: 1627348709510,
	}

	/** @type Packet */
	const packet2Purchased = {
		purchasePrice: 3147.18,
		purchaseTimestamp: 1627467886702,
		id: '37a8532b-ba85-442c-9b73-06a32d830ef0',
		status: 'purchased',
	}

	test('and data source is empty, returns zero packets', async () => {
		mockedLowdb.setReadResult(undefined)

		const packets = await new Packets().initialise()

		expect(packets.purchased).toEqual([])
	})

	test('and data source contains zero packets, returns zero packets', async () => {
		mockedLowdb.setReadResult([])

		const packets = await new Packets().initialise()

		expect(packets.purchased).toEqual([])
	})

	test('and data source contains a sold packet, returns zero packets', async () => {
		mockedLowdb.setReadResult([packet1Sold])

		const packets = await new Packets().initialise()

		expect(packets.purchased).toEqual([])
	})

	test('and data source contains a sold and purchased packet, returns the purchased packet', async () => {
		mockedLowdb.setReadResult([packet1Sold, packet2Purchased])

		const packets = await new Packets().initialise()

		expect(packets.purchased).toEqual([packet2Purchased])
	})

	test('and data source contains multiple purchased packets, returns those packets', async () => {
		mockedLowdb.setReadResult([packet1Purchased, packet2Purchased])

		const packets = await new Packets().initialise()

		expect(packets.purchased).toEqual([packet1Purchased, packet2Purchased])
	})
})

describe('when getting last purchased from Packets instance', () => {
	/** @type Packet */
	const packet1Purchased = {
		purchasePrice: 3021.57,
		purchaseTimestamp: 1627336000179,
		id: '2575c164-fe99-4d76-8f4a-856c2e18fad3',
		status: 'purchased',
	}

	/** @type Packet */
	const packet1Sold = {
		purchasePrice: 3021.57,
		purchaseTimestamp: 1627336000179,
		id: '2575c164-fe99-4d76-8f4a-856c2e18fad3',
		status: 'sold',
		sellPrice: 2966,
		sellTimestamp: 1627348709510,
	}

	/** @type Packet */
	const packet2Purchased = {
		purchasePrice: 3147.18,
		purchaseTimestamp: 1627467886702,
		id: '37a8532b-ba85-442c-9b73-06a32d830ef0',
		status: 'purchased',
	}

	test('and data source is empty, returns nothing', async () => {
		mockedLowdb.setReadResult(undefined)

		const packets = await new Packets().initialise()

		expect(packets.lastPurchased).toBeUndefined()
	})

	test('and data source contains zero packets, returns nothing', async () => {
		mockedLowdb.setReadResult([])

		const packets = await new Packets().initialise()

		expect(packets.lastPurchased).toBeUndefined()
	})

	test('and data source contains a sold packet, returns nothing', async () => {
		mockedLowdb.setReadResult([packet1Sold])

		const packets = await new Packets().initialise()

		expect(packets.lastPurchased).toBeUndefined()
	})

	test('and data source contains a sold and purchased packet, returns the purchased packet', async () => {
		mockedLowdb.setReadResult([packet1Sold, packet2Purchased])

		const packets = await new Packets().initialise()

		expect(packets.lastPurchased).toEqual(packet2Purchased)
	})

	test('and data source contains multiple purchased packets, returns the last purchased packet', async () => {
		mockedLowdb.setReadResult([packet1Purchased, packet2Purchased])

		const packets = await new Packets().initialise()

		expect(packets.lastPurchased).toEqual(packet2Purchased)
	})
})
