CREATE DATABASE IF NOT EXISTS battleship;

USE battleship;
CREATE TABLE IF NOT EXISTS users (
    pseudo VARCHAR(256),
    password VARCHAR(256)
);

CREATE USER 'root' IDENTIFIED WITH mysql_native_password BY 'rootpassword';
GRANT ALL PRIVILEGES ON battleship.* TO 'root';
FLUSH PRIVILEGES;