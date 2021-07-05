const db = require("../db");

//Create a table for products in the database if it doesn't exist at application start
!async function createTable() {
	const tableQuery = `CREATE TABLE IF NOT EXISTS packets (
        packet_id INT PRIMARY KEY AUTO_INCREMENT,
        market_id VARCHAR(20) NOT NULL,
        status VARCHAR(20))`;

	await db.query(tableQuery);
}();

exports.findAll = async function () {
	const results = await db.query("SELECT * FROM packets");
	return results[0];
};

exports.findOne = async function (packet_id) {
	const result = await db.query("SELECT * FROM packets WHERE packet_id=?", packet_id);
	return result[0];
};

exports.create = async function (market_id, status = 'pending') {
	await db.query("INSERT INTO packets(market_id, status) VALUES (?, ?)", [market_id, status])
		.then((result) => {
		return result.insertId
	});

};

exports.update = async function (packet_id, market_id, status) {
	await db.query("UPDATE packets SET market_id=?, status=? WHERE packet_id=?",
		[packet_id, market_id, status, packet_id]);
};