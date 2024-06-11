const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 8080;
const db = require("./database.js")

const bodyParser = require("body-parser");
const path = require("path");

app.use(express.static("public"))
app.use(express.json());

const { Player } = require(`${__dirname}/businesses/Player.js`);

app.get('/',  (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/pages/connectionView.html'))
})

app.post('/register', (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    return res.status(400).send('Email and password are required.');
  }
  
  const query = 'INSERT INTO users (pseudo, password) VALUES (?, ?)';
  db.execute(query, [pseudo, password], (err, results) => {
    if (err) {
      console.error('Error inserting user into the database:', err);
      return res.status(500).send('Internal server error.');
    }

    res.status(201).send('User registered successfully.');
  })
});

let rooms = [];
let players = [];

io.on("connection", (socket) => {
  console.log("New connected : ", socket.id);

  socket.on("disconnect", () => {
    const index = players.findIndex((p) => p.id === socket.id)
    const roomIndex = rooms.findIndex(room => 
      room.players.some(player => player.id === socket.id)
    );

    if (roomIndex !== -1) {
      const room = rooms[roomIndex];
      const opponent = room.players.find(player => player.id !== socket.id);
      const inRoomIndex = room.players.findIndex(player => player.id === socket.id);

      if (opponent) {
        io.to(opponent.id).emit('opponent left');
      }

      room.players.splice(inRoomIndex, 1)

      if (room.players.length === 0) {
        rooms.splice(roomIndex, 1);
      }
    }

    players.splice(index, 1)

    console.log(`Player disconnected: ${socket.id}`);
  })

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

  socket.on("get player", (roomId, id, callback) => {
    let out = ""
    const room = rooms.find((r) => r.id === roomId)

    if (room === undefined) {
      out = players.find((p) => p.id === id);
    } else {
      out = room.players.find((p) => p.id === id)
    }

    callback({
      player: out,
    });
  });

  socket.on("get ennemy", (roomId, id, callack) => {
    const room = rooms.find((r) => r.id === roomId);
    const out = room.players.find((p) => p.id !== id);

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

  socket.on("reset grid", (roomId) => {
    const player = rooms.find((r) => r.id === roomId).players[0]
    player.resetGrid();
  })

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
      this.players.find((p) => p.id === this.ennemy).grid.cases[move.col][move.row].isPlayed = true;
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

http.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

module.exports = {
  io,
};
