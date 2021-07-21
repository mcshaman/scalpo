const db = require('../db')

//Create a table for products in the database if it doesn't exist at application start
async function createTable() {
	const tableQuery = `CREATE TABLE IF NOT EXISTS orders (
		order_id INT PRIMARY KEY AUTO_INCREMENT,
		packet_id INT NOT NULL,
		price DECIMAL(8,2) NOT NULL,
		amount DECIMAL(8,2) NOT NULL,
		order_placed timestamp NOT NULL,
		order_type VARCHAR(20) NOT NULL,
		status VARCHAR(20))`

	await db.query(tableQuery)
}

!createTable()

exports.findAll = async function () {
	const results = await db.query('SELECT * FROM orders')
	return results[0]
}

exports.findOne = async function (order_id) {
	const result = await db.query('SELECT * FROM orders WHERE order_id=?', order_id)
	return result[0]
}

exports.create = async function (packet_id, price, amount, order_placed, order_type, status) {
	await db.query(
		'INSERT INTO orders(packet_id, price, amount, order_placed, order_type, status) VALUES (?, ?, ?, ?, ?, ?)',
		[packet_id, price, amount, order_placed, order_type, status],
	)
}

exports.update = async function (order_id, packet_id, price, amount, order_placed, order_type, status) {
	await db.query(
		'UPDATE orders SET packet_id=?, price=?, amount=?, order_placed=?, order_type=?, status=? WHERE order_id=?',
		[packet_id, price, amount, order_placed, order_type, status, order_id],
	)
}
