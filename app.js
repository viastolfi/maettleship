const { io } = require(`${__dirname}/index.js`);
const { Player } = require(`${__dirname}/businesses/Player.js`);
const { Room } = require(`${__dirname}/businesses/Room.js`);

let room;
let game;
let players = [];

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
    game.room.players.forEach((player) => {
      io.to(player.socketId).emit("start game");
    });
    game.start();
  });

  socket.on("play", (id, move) => {
    game.modifyEnnemyGrid(id, move);
    game.move(move);
  });

  socket.on("get player", (id, callback) => {
    let out = "";
    players.forEach((p) => {
      if (p.socketId === id) {
        out = p;
      }
    });
    callback({
      player: out,
    });
  });

  socket.on("get ennemy", (id, callack) => {
    let out = "";
    players.forEach((p) => {
      if (p.socketId !== id) {
        out = p;
      }
    });
    callack({
      player: out,
    });
  });

  socket.on("update grid", (id, grid, callback) => {
    players.forEach((p) => {
      if (p.socketId === id) {
        p.grid = grid;
      }
    });
    callback({
      status: true,
    });
  });

  socket.on("update piece", (playerId, piece) => {
    players.forEach((p) => {
      if (p.socketId === playerId) {
        for (let i = 0; i < p.pieces.length; i++) {
          if (p.pieces[i].id === piece.id) {
            p.pieces[i] = piece;
          }
        }
      }
    });
  });

  socket.on("change selection status", (playerId, pieceId, status) => {
    players.forEach((p) => {
      if (p.id === playerId) {
        p.pieces.forEach((piece) => {
          if (piece.id === pieceId) {
            piece.isSelected = status;
          }
        });
      }
    });
  });
});

const askToPlay = (game) => {
  io.to(game.actualPlayer.socketId).emit("play");
};

const playedMoove = (game, isHit, isWin) => {
  game.room.players.forEach((player) => {
    io.to(player.socketId).emit("played move", isHit, isWin);
  });
};

class Game {
  constructor(room) {
    this.room = room;
    this.actualPlayer = "";
    this.ennemy = "";
  }

  start() {
    let rand = Math.floor(Math.random() * (1 - 0 + 1) + 0);
    this.actualPlayer = this.room.players[rand];
    rand === 0
      ? (this.ennemy = this.room.players[1])
      : (this.ennemy = this.room.players[0]);

    players.forEach((p) => {
      for (let i = 0; i < p.pieces.length; i++) {
        p.pieces[i].isMovable = false;
        p.pieces[i].isSelected = false;
      }
    });

    askToPlay(this);
  }

  /*
  endGame() {
    this.room.players.forEach((player) =>
      io.to(player.socketId).emit("end game"),
    );
  }
  */

  modifyEnnemyGrid(id, move) {
    players.forEach((p) => {
      if (p.socketId !== id) {
        p.grid.cases[move.col][move.row].isPlayed = true;
      }
    });
  }

  move(move) {
    let playedCase = this.ennemy.grid.cases[move.col][move.row];
    if (playedCase.isPlayed === false) {
      playedCase.isPlayed = true;
      let isHit = playedCase.isShip;
      let isWin = this.checkWin();
      playedMoove(this, isHit, isWin);
      let temp = this.actualPlayer;
      this.actualPlayer = this.ennemy;
      this.ennemy = temp;
    }
    askToPlay(this);
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
