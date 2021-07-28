import db from '../db.js'

//Create a table for products in the database if it doesn't exist at application start
async function createTable() {
	const tableQuery = `CREATE TABLE IF NOT EXISTS packets (
		packet_id INT PRIMARY KEY AUTO_INCREMENT,
		market_id VARCHAR(20) NOT NULL,
		status VARCHAR(20))`

	await db.query(tableQuery)
}

!createTable()

export async function findAll() {
	const results = await db.query('SELECT * FROM packets')
	return results[0]
}

export async function findOne(packet_id) {
	const result = await db.query('SELECT * FROM packets WHERE packet_id=?', packet_id)
	return result[0]
}

export async function create(market_id, status = 'pending') {
	const result = await db.query('INSERT INTO packets(market_id, status) VALUES (?, ?)', [market_id, status])
	return result
}

export async function update(packet_id, market_id, status) {
	await db.query('UPDATE packets SET market_id=?, status=? WHERE packet_id=?', [
		packet_id,
		market_id,
		status,
		packet_id,
	])
}
