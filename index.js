const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 8080;
const db = require("./database.js")
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const path = require("path");

const { Room } = require('./businesses/Room.js');
const { Player } = require(`${__dirname}/businesses/Player.js`);

app.use(express.static("public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const secretKey = process.env.COOKIE_SECRET_KEY;

app.get('/',  (req, res) => {
  res.sendFile(path.join(__dirname, '/public/pages/connectionView.html'))
})

app.get('/game', (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  res.sendFile(path.join(__dirname, '/public/pages/gameView.html'))
})

app.post('/register', (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    return res.status(400).send('Email and password are required.');
  }
  
  const query = 'INSERT INTO users (pseudo, password) VALUES (?, ?)';
  db.query(query, [pseudo, password], (err, results) => {
    if (err) {
      console.error('Error inserting user into the database:', err);
      return res.status(500).send('Internal server error.');
    }

    const token = jwt.sign({ pseudo }, secretKey, { expiresIn: '1h' });
    res.cookie('authToken', token, { httpOnly: true, secure: false });

    res.status(201).send({message: 'User registered successfully.', redirectUrl: '/game' });
  })
});

app.get('/user-info', (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const query = 'SELECT pseudo FROM users WHERE pseudo = ?';
    db.query(query, [decoded.pseudo], (err, results) => {
      console.log(results)
      if (err) {
        console.error('Error retrieving user info from the database:', err);
        return res.status(500).send('Internal server error.');
      }
      if (results.length === 0) {
        return res.status(404).send('User not found.');
      }
      res.json(results[0]);
    });
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
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

    askToPlay(room.start());
  });

  socket.on("play", (roomId, id, move) => {
    let room = rooms.find((r) => r.id === roomId);

    sendMoveToPlayers(room.move(move));
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

const askToPlay = (player) => {
  io.to(player).emit("play")
}

const sendMoveToPlayers = (moveData) => {
  if (moveData.isMove === true) {
    for (let i = 0; i <= 1; i++) {
      io.to(moveData.players[i].id).emit("played move", moveData.isHit, moveData.isWin);
    }
  }
  askToPlay(moveData.player)
};

http.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});