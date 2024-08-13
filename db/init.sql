CREATE DATABASE IF NOT EXISTS battleship;

USE battleship;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pseudo VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS scoreboards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player1 INT NOT NULL,
    player2 INT NOT NULL,
    player1Win INT NOT NULL DEFAULT 0,
    player2Win INT NOT NULL DEFAULT 0,
    FOREIGN KEY (player1) REFERENCES users(id),
    FOREIGN KEY (player2) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS score (
    id INT PRIMARY KEY AUTO_INCREMENT,
    playerId INT NOT NULL,
    wins INT NOT NULL DEFAULT 0,
    loses INT NOT NULL DEFAULT 0,
    FOREIGN KEY (playerId) REFERENCES users(id)
);