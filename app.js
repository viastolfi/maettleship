const { io } = require(`${__dirname}/index.js`);
const { Player } = require(`${__dirname}/businesses/Player.js`);
const uuid = require("uuid");

let rooms = [];
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

  socket.on("first connection", (socketId) => {
    let player = new Player(socketId);
    players.push(player);
  });

  socket.on("Hello", (callback) => {
    callback({
      Hello: "World",
    });
  });

  socket.on("room creation", (id, callback) => {
    let room = new Room();
    room.addPlayer(players.find((p) => p.id === id));
    rooms.push(room);

    callback({
      roomId: room.id,
    });
  });

  socket.on("ask for room", (roomId, id) => {
    let room = rooms.find((r) => r.id === roomId);

    room.addPlayer(players.find((p) => p.id === id));
    room.validBoards();

    room.players.forEach((player) => {
      io.to(player.id).emit("start game");
    });

    room.start();
  });

  socket.on("play", (roomId, id, move) => {
    let room = rooms.find((r) => r.id === roomId);

    room.move(move);
  });

  socket.on("get player", (id, callback) => {
    const out = players.find((p) => p.id === id);

    callback({
      player: out,
    });
  });

  socket.on("get ennemy", (roomId, id, callack) => {
    const out = players.find((p) => p.id !== id)
    //const out = rooms.find((r) => r.id === roomId)
    //  .players.find((p) => p.id !== id);

    callack({
      player: out,
    });
  });

  socket.on("update grid", (id, grid, callback) => {
    const player = players.find((p) => p.id === id);
    player.grid = grid;

    callback({
      status: true,
    });
  });

  socket.on("update piece", (playerId, piece) => {
    const player = players.find((p) => p.id === playerId);
    const index = player.pieces.findIndex((p) => p.id === piece.id);

    player.pieces[index] = piece;
  });

  socket.on("change selection status", (playerId, pieceId, status) => {
    players
      .find((p) => p.id === playerId)
      .pieces.find((piece) => piece.id === pieceId).isSelected = status;
  });
});

const askToPlay = (game) => {
  console.log(game.actualPlayer)
  io.to(game.actualPlayer).emit("play");
};

const playedMoove = (game, isHit, isWin) => {
  game.players.forEach((player) => {
    io.to(player.id).emit("played move", isHit, isWin);
  });
};

class Room {
  constructor(room) {
    this.id = this.generateRoomId(); // change the id with something prettier
    this.players = [];
    this.room = room;
    this.actualPlayer = "";
    this.ennemy = "";
  }

  addPlayer(player) {
    this.players.push(player);
  }

  start() {
    let rand = Math.floor(Math.random() * (1 - 0 + 1) + 0);
    this.actualPlayer = this.players[rand].id;
    rand === 0
      ? (this.ennemy = this.players[1].id)
      : (this.ennemy = this.players[0].id);

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

  move(move) {
    let playedCase = this.players.find((p) => p.id === this.ennemy).grid.cases[move.col][move.row];

    if (playedCase.isPlayed === false) {
      players.find((p) => p.id === this.ennemy).grid.cases[move.col][move.row].isPlayed = true;
      playedMoove(this, playedCase.isShip, this.checkWin());

      let tmp = this.actualPlayer;
      this.actualPlayer = this.ennemy;
      this.ennemy = tmp;
    }

    askToPlay(this);
  }

  checkWin() {
    const e = this.players.find((p) => p.id === this.ennemy);
    let w = true;

    for (let i = 0; i < e.grid.cases.length; i++) {
      for (let j = 0; j < e.grid.cases.length; j++) {
        let c = e.grid.cases[i][j];

        if (c.isShip && !c.isPlayed) {
          w = false;
          break;
        }
      }
    }

    return w;
  }

  validBoards() {
    this.players.forEach((player) => {
      player.pieces.forEach((piece) => {
        for (let i = piece.startPos.x; i <= piece.endPos.x; i++) {
          for (let j = piece.startPos.y; j <= piece.endPos.y; j++) {
            player.grid.cases[i][j].isShip = true;
          }
        }
      });
    });
  }
  
  generateRoomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const idLength = 5;
    let roomId = '';
  
    for (let i = 0; i < idLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      roomId += characters[randomIndex];
    }
  
    return roomId;
  }
}
