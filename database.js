const mysql = require("mysql");

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'vinz',
    password: process.env.DB_PASSWORD || '19735',
    database: process.env.DB_NAME || 'maettleship'
});  

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

module.exports = connection;