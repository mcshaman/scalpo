/**
 * @callback SetReadResult
 * @param {import('../app/Packets').Packet[]} [value]
 * @returns {void}
 */

/**
 * @typedef {Object} ExtendedProperties
 * @property {SetReadResult} setReadResult
 *
 * @typedef {import('lowdb') & ExtendedProperties} MockedLowdb
 */

jest.mock('lowdb', () => {
	const lowdb = jest.requireActual('lowdb')

	const readResult = jest.fn()

	const mockedLowdb = {
		__esModule: true,
		...lowdb,
		setReadResult(value) {
			readResult.mockImplementation(() => value)
		},
		Low: jest.fn((...args) => {
			const low = new lowdb.Low(...args)

			return {
				...low,
				read() {
					this.data = readResult()

					return Promise.resolve()
				},
			}
		})
	}

	return mockedLowdb
})

export * from 'lowdb'