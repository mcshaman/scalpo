import mysql from 'mysql2'

const pool = mysql.createPool({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_ROOT_USER,
	password: process.env.MYSQL_ROOT_PASSWORD,
	database: process.env.MYSQL_DATABASE,
})

export default pool.promise()
