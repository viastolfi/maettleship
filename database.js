const mysql = require("mysql2");
const fs = require('node:fs');


try {
	let db_user = ""
	let db_user_password = ""

	if (process.env.ACTUAL_ENV === 'dev') {
		db_user = process.env.DB_USER
		db_user_password = process.env.DB_PASSWORD
	} else {
		db_user_password = fs.readFileSync(process.env.DB_USER_PASSWORD_FILE, 'utf8').replace(/\r?\n|\r/g, "");
		db_user = fs.readFileSync(process.env.DB_USER_FILE, 'utf8').replace(/\r?\n|\r/g, "");
	}

	const connection = mysql.createPool({
		host: process.env.DB_HOST,
		user: db_user,
		password: db_user_password,
		database: process.env.DB_NAME,
	});  

	module.exports = connection;
} catch (e) {
	console.log(e)
}

