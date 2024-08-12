const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 3000;
const db = require("./database.js")
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require('bcrypt');

const { Room } = require('./businesses/Room.js');
const { Player } = require(`${__dirname}/businesses/Player.js`);

app.use(express.static("public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const secretKey = process.env.COOKIE_SECRET_KEY;

// #region routing and cookies

app.get('/',  (req, res) => {
  return res.sendFile(path.join(__dirname, '/public/pages/connectionView.html'))
})

app.get('/register', (req, res) => {
    return res.sendFile(path.join(__dirname, '/public/pages/signupView.html'))
})

app.get('/game', (req, res) => {
  return res.sendFile(path.join(__dirname, '/public/pages/gameView.html'))
})

app.post('/logIn', (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    return res.status(400).send('pseudo and password are required.');
  }

  const query = 'SELECT hashed_password FROM users WHERE pseudo = ?';
  db.query(query, [pseudo], async (err, results) => {
    if (err) {
      console.error('Error selecting user into the database:', err);
      return res.status(500).send({message: 'Internal server error.'});
    }
    if (results.length === 1) {
      const user = results[0]
      if (await bcrypt.compare(password, user.hashed_password)) {
        const token = jwt.sign({ pseudo }, secretKey, { expiresIn: '1h' });
        res.cookie('authToken', token, { httpOnly: true, secure: false });
  
        return res.status(201).send({message: 'User logged in successfully.', redirectUrl: '/game' });
      } else {
        return res.status(401).send({message: "Password is incorrect"})
      }
    } else {
      return res.status(401).send({message: "Username is incorrect"})
    }
  })
})

app.post('/register', async (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    return res.status(400).send('Email and password are required.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const getPseudoQuery = 'SELECT pseudo FROM users WHERE pseudo = ?'
  db.query(getPseudoQuery, [pseudo], (err, results) => {
    if (err) {
      console.error('Error retrieving user info from the database:', err);
      return res.status(500).send('Internal server error.');
    }
    if (results.length !== 0) {
      return res.status(403).send({message:'User already exist. Try another username'});
    }
  });
  
  const query = 'INSERT INTO users (pseudo, hashed_password) VALUES (?, ?)';
  db.query(query, [pseudo, hashedPassword], (err, results) => {
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
      if (err) {
        console.error('Error retrieving user info from the database:', err);
        return res.status(500).send('Internal server error.');
      }
      if (results.length === 0) {
        return res.status(401).send('User not found.');
      }
      return res.json(results[0]);
    });
  } catch (ex) {
    return res.status(400).send('Invalid token.');
  }
});

// #endregion routing and cookies


// #region socket and game

let rooms = [];
let players = [];

io.on("connection", (socket) => {
  console.log("New connected : ", socket.id);

  socket.on("disconnect", () => {
    const index = players.findIndex((p) => p.id === socket.id)
    const roomIndex = rooms.findIndex(room => 
      room.players.some((player) => player.id === socket.id)
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

    if (index !== -1) {
      players.splice(index, 1)
    }

    console.log(`Player disconnected: ${socket.id}`);
  })

  socket.on('delete room', (roomId) => {
    const roomIndex = rooms.findIndex((r) => r.id === roomId)
    rooms.splice(roomIndex, 1)
    console.log(rooms)
  })

  socket.on("first connection", (socketId) => {
    const cookies = socket.request.headers.cookie;
    const authToken = cookies.split('; ').find(cookie => cookie.startsWith('authToken=')).split('=')[1];

    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, secretKey);
        const username = decoded.pseudo;
        let player = new Player(socketId, username);
        players.push(player);
      } catch (ex) {
        console.error('Invalid token:', ex);
      }
    } else {
      console.log('No auth token found in cookies.');
      }
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

  socket.on("ask for room", (roomId, id, callack) => {
    let room = rooms.find((r) => r.id === roomId);

    if (room == null) {
      callack({
        status: false,
        message: "No room for this code"
      })
      return 
    }

    if (room.players.length >= 2) {
      callack({
        status: false,
        message: "Room is full"
      })
      return
    }

    callack({
      status: true
    })

    room.addPlayer(players.find((p) => p.id === id));
    room.validBoards();

    for (let i = 0; i < room.players.length; i++) {
      io.to(room.players[i].id).emit("start game")
    }

    /*
    room.players.forEach((player) => {
      io.to(player.id).emit("start game");
    });
    */

    askToPlay(room.start());
  });

  socket.on("play", (roomId, id, move) => {
    let room = rooms.find((r) => r.id === roomId);

    sendMoveToPlayers(room.move(move));
  });

  socket.on("get player", (roomId, id, callback) => {
    let out = ""
    const room = rooms.find((r) => r.id === roomId)

    if (room == null) {
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

  socket.on("game ended", (roomId) => {
    const roomIndex = rooms.findIndex((r) => r.id === roomId)

    rooms[roomIndex].players.forEach(player => {
      player.resetGrid()
      io.to(player.id).emit("go to menu")
    });

    rooms.splice(roomIndex, 1)
  })

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

  // #region rematch hanlding

  socket.on("ask for rematch", (roomId, playerId) => {
    const room = rooms.find((r) => r.id === roomId)
    const opponent = room.players.find((p) => p.id !== playerId)

    io.to(opponent.id).emit("ask for rematch");
  })

  socket.on("rematch grid", (roomId) => {
    const room = rooms.find((r) => r.id === roomId)

    room.players.forEach(p => {
      p.resetGrid()
      io.to(p.id).emit("rematch grid")
    })
  })

  socket.on("valid grid", (roomId) => {
    const room = rooms.find((r) => r.id === roomId)

    room.wantRematch = room.wantRematch + 1 

    if (room.wantRematch === 2) {
      room.validBoards();
      room.wantRematch = 0
      room.players.forEach(p => {
        io.to(p.id).emit("start game")
      })
      askToPlay(room.start());
    }
  })

  // #endregion rematch hanlding
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

// #endregion socket and game


http.listen(port, () => {
  //console.log(`Listening on http://localhost:${port}`);
});