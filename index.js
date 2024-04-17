const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const port = 8081;
const io = require("socket.io")(http);
const { Player } = require(`${__dirname}/businesses/Player.js`);
const { Room } = require(`${__dirname}/businesses/Room.js`);
const { Game } = require(`${__dirname}/game.js`);

let room;
let game;

app.use(express.static("public"));

http.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

io.on("connection", (socket) => {
  socket.on("Hello", (callback) => {
    callback({
      Hello: "World",
    });
  });

  socket.on("room creation", (socketId) => {
    let player = new Player(socketId);
    player.grid.cases[2][2].isShip = true;
    player.grid.cases[3][2].isShip = true;
    room = new Room();
    room.addPlayer(player);
  });

  socket.on("ask for room", (socketId) => {
    if (room.players.length === 1) {
      let player = new Player(socketId);
      player.grid.cases[2][2].isShip = true;
      room.addPlayer(player);
      game = new Game(room);
      game.start();
    }
  });

  socket.on("play", (move) => {
    game.move(move);
  });
});

module.exports = {
  io,
};
