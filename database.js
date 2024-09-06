const mysql = require("mysql2");
const fs = require('node:fs');


try {
	const db_user_password = fs.readFileSync(process.env.DB_USER_PASSWORD_FILE, 'utf8').replace(/\r?\n|\r/g, "");
	const db_user = fs.readFileSync(process.env.DB_USER_FILE, 'utf8').replace(/\r?\n|\r/g, "");


	console.log(db_user)

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

