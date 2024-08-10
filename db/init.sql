CREATE DATABASE IF NOT EXISTS battleship;

USE battleship;
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pseudo VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL
);

CREATE USER 'root' IDENTIFIED WITH mysql_native_password BY 'rootpassword';
GRANT ALL PRIVILEGES ON battleship.* TO 'root';
FLUSH PRIVILEGES;