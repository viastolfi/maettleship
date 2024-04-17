const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 8081;

const { Player } = require(`${__dirname}/businesses/Player.js`);
const { Room } = require(`${__dirname}/businesses/Room.js`);

let room;
let game;
let players = [];

app.use(express.static("public"));

http.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

io.on("connection", (socket) => {
  console.log("New connected : ", socket.id);
  /* TODO : handle disconnection
  socket.on("disconnect", (reason) => {
    if (game.room.players.length === 2) {
      game.endGame();
      delete game.room;
    }
    console.debug(game);
  });
  */

  socket.on("first connection", (socketId, callback) => {
    console.log("first connection");
    let player = new Player(socketId);
    players.push(player);
    callback({
      player: player,
    });
  });

  socket.on("Hello", (callback) => {
    callback({
      Hello: "World",
    });
  });

  socket.on("room creation", (player) => {
    room = new Room();
    room.addPlayer(player);
  });

  socket.on("ask for room", (player) => {
    room.addPlayer(player);
    game = new Game(room);
    game.validBoards();
    game.start();
  });

  socket.on("play", (move) => {
    game.move(move);
  });
});

class Game {
  constructor(room) {
    this.room = room;
    this.actualPlayer = "";
    this.ennemy = "";
  }

  start() {
    this.room.players.forEach((player) => {
      io.to(player.socketId).emit("start game", this);
    });

    let rand = Math.floor(Math.random() * (1 - 0 + 1) + 0);
    this.actualPlayer = this.room.players[rand];
    rand === 0
      ? (this.ennemy = this.room.players[1])
      : (this.ennemy = this.room.players[0]);

    this.askToPlay();
  }

  endGame() {
    this.room.players.forEach((player) =>
      io.to(player.socketId).emit("end game"),
    );
  }

  askToPlay() {
    io.to(this.actualPlayer.socketId).emit("play");
  }

  move(move) {
    let playedCase = this.ennemy.grid.cases[move.col][move.row];
    if (playedCase.isPlayed === false) {
      playedCase.isPlayed = true;
      let isHit = playedCase.isShip;
      let isWin = this.checkWin();
      this.room.players.forEach((player) => {
        io.to(player.socketId).emit("played move", this, isHit, isWin);
      });
      let temp = this.actualPlayer;
      this.actualPlayer = this.ennemy;
      this.ennemy = temp;
    }
    this.askToPlay();
  }

  checkWin() {
    let w = true;
    for (let i = 0; i < this.ennemy.grid.cases.length; i++) {
      for (let j = 0; j < this.ennemy.grid.cases.length; j++) {
        let c = this.ennemy.grid.cases[i][j];
        if (c.isShip && !c.isPlayed) {
          w = false;
          break;
        }
      }
    }
    return w;
  }

  validBoards() {
    this.room.players.forEach((player) => {
      player.pieces.forEach((piece) => {
        for (let i = piece.startPos.x; i <= piece.endPos.x; i++) {
          for (let j = piece.startPos.y; j <= piece.endPos.y; j++) {
            player.grid.cases[i][j].isShip = true;
          }
        }
      });
    });
  }
}
