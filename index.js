const path = require("path");
const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const http = require("http").Server(app);
const io = require("socket.io")(http);

const db = require(path.normalize(`${__dirname}/database.js`))
const { Room } = require(path.normalize(`${__dirname}/models/Room.js`));
const { Player } = require(path.normalize(`${__dirname}/models/Player.js`));
const secretKey = process.env.COOKIE_SECRET_KEY;

const port = 3000;
app.use(express.static("public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// #region routing and cookies

app.get('/',  (req, res) => {
  return res.sendFile(path.normalize(path.join(__dirname, '/public/pages/connectionView.html')))
})

app.get('/register', (req, res) => {
    return res.sendFile(path.normalize(path.join(__dirname, '/public/pages/signupView.html')))
})

app.get('/game', (req, res) => {
    return res.sendFile(path.normalize(path.join(__dirname, '/public/pages/gameView.html')))
})

app.get('/error', (req, res) => {
  res.status(200)
  return res.sendFile(path.normalize(path.join(__dirname, '/public/pages/errorView.html')))
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
  
  var query = 'INSERT INTO users (pseudo, hashed_password) VALUES (?, ?)';
  db.query(query, [pseudo, hashedPassword], (err, results) => {
    if (err) {
      console.error('Error inserting user into the database:', err);
      return res.status(500).send('Internal server error.');
    }

    query = 'SELECT id FROM users WHERE pseudo = ?'
    db.query(query, [pseudo], (err, results) => {
      if (err) {
        console.error('Error inserting user into the database:', err);
        return res.status(500).send('Internal server error.');
      }
      if (results.length === 1) {
        query = 'INSERT INTO score (playerId) VALUES (?)';
        db.query(query, [results[0].id], (err, results) => {
          if (err) {
            console.error('Error inserting user into the database:', err);
            return res.status(500).send('Internal server error.');
          }
        })
      }
    });

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

  socket.on("handle error", (id, roomId) => {
    const room = rooms.find((r) => r.id === roomId)

    if (room != null) {
      const playerIndex = room.players.findIndex((p) => p.id === id)
      room.players.splice(playerIndex, 1)

      if (room.players.length > 0) {
        io.to(room.players[0].id).emit("opponent left")
      } else {
        const roomIndex = rooms.findIndex((r) => r.id === roomId)
        rooms.splice(roomIndex, 1)
      }
    }
  })

  socket.on("first connection", (socketId) => {
    const cookies = socket.request.headers.cookie;
    const authToken = cookies.split('; ').find(cookie => cookie.startsWith('authToken=')).split('=')[1];

    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, secretKey);
        const username = decoded.pseudo;
        let player = new Player(socketId, username);

        const query = 'SELECT id FROM users WHERE pseudo = ?'
        db.query(query, [player.username], (err, results) => {
          if (err) {
            // TODO
          }
          if (results.length === 1) {
            player.dbId = results[0].id
          }
        });

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

  socket.on("ask for room", (roomId, id, callback) => {
    let room = rooms.find((r) => r.id === roomId);

    try {
      if (room == null) {
        callback({
          status: false,
          message: "No room for this code"
        })
        return 
      }
  
      if (room.players.length >= 2) {
        callback({
          status: false,
          message: "Room is full"
        })
        return
      }
  
      callback({
        status: true
      })

      const player1 = players.find((p) => p.id === id);
      const player2 = room.players.find((p) => p.id !== player1.id)
      
      room.addPlayer(player1);
      room.validBoards();

      const ids = [player1.dbId, player2.dbId].sort((a, b) => a - b)

      var query = 'SELECT * FROM scoreboards WHERE player1 = ? AND player2 = ?';
      db.query(query, [ids[0], ids[1]], async (err, results) => {
        if (err) {
          // TODO
        }
        if (results.length === 0) {
          query = 'INSERT INTO scoreboards (player1, player2) VALUES (?, ?)';
          db.query(query, [ids[0], ids[1]], async (err, results) => {
            if (err) {
              console.log(err)
            }
            if (results.length === 1) {
              console.log("Scoreboard create in base")
            }
          })
        }
      })
  
      for (let i = 0; i < room.players.length; i++) {
        io.to(room.players[i].id).emit("start game")
      }
  
      askToPlay(room.start());
    } catch (e){
      console.log(e)
      callback({
        status: false,
        reason: "exception"
      })
    }
  });

  socket.on("play", (roomId, id, move, callback) => {
    let room = rooms.find((r) => r.id === roomId);

    try {
      const results = room.move(move)

      if (results.isWin) {
        const winner = results.players.find((p) => p.id === results.player)
        const loser = results.players.find((p) => p.id !== winner.id)
        const alteredRow = "player" + (winner.dbId > loser.dbId ? 2 : 1) + "Win"
        const ids = [winner.dbId, loser.dbId].sort((a, b) => a - b)

        var query = 'UPDATE score SET wins = wins + 1 WHERE playerId = ?'
        db.query(query, [winner.dbId], (err, results) => {
          if (err) {
            console.log(err)
          }
        })

        query = 'UPDATE score SET loses = loses + 1 WHERE playerId = ?'
        db.query(query, [loser.dbId], (err, results) => {
          if (err) {
            console.log(err)
          }
        })

        query = `UPDATE scoreboards SET ${alteredRow} = ${alteredRow} + 1 WHERE player1 = ? AND player2 = ?`
        db.query(query, [ids[0], ids[1]], (err, results) => {
          if (err) {
            console.log(err)
          }
        });
      }

      sendMoveToPlayers(results);
    } catch (e) {
      console.log(e)
      callback({
        status: false
      })
    }
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

  socket.on("get ennemy", (roomId, id, callback) => {
    const room = rooms.find((r) => r.id === roomId);

    try {
      const out = room.players.find((p) => p.id !== id);
      
      callback({
        status: true,
        player: out,
      });
    } catch (e) {
      console.log(e)
      callback({
        status: false
      })
    }
  });

  socket.on("update grid", (id, grid, callback) => {
    const player = players.find((p) => p.id === id);

    try {
      player.grid = grid;
      callback({  
        status: true,
      });
    } catch (e) {
      console.log(e)
      callback({
        status: false
      })
    }
  });

  socket.on("game ended", (roomId, callback) => {
    const roomIndex = rooms.findIndex((r) => r.id === roomId)

    try {
      rooms[roomIndex].players.forEach(player => {
        player.resetGrid()
        io.to(player.id).emit("go to menu")
      });
  
      rooms.splice(roomIndex, 1)
    } catch (e) {
      console.log(e)
      callback({
        status: false
      })
    }
  })

  socket.on("reset grid", (roomId, callback) => {
    const player = rooms.find((r) => r.id === roomId).players[0]
    try {
      player.resetGrid();
    } catch (e) {
      console.log(e)
      callback({
        status: false
      })
    }
  })

  socket.on("update piece", (playerId, piece, callback) => {
    const player = players.find((p) => p.id === playerId);

    try {      
      const index = player.pieces.findIndex((p) => p.id === piece.id);
  
      player.pieces[index] = piece;
    } catch (e) {
      console.log(e)
      callback({
        status: false
      })
    }
  });

  socket.on("change selection status", (playerId, pieceId, status, callback) => {
    try {
      players
        .find((p) => p.id === playerId)
        .pieces.find((piece) => piece.id === pieceId).isSelected = status;
    } catch (e) {
      console.log(e)
      callback({
        status: false
      })
    }
  });

  // #region rematch hanlding

  socket.on("ask for rematch", (roomId, playerId, callback) => {
    const room = rooms.find((r) => r.id === roomId)

    try {
      const opponent = room.players.find((p) => p.id !== playerId)
  
      io.to(opponent.id).emit("ask for rematch");
    } catch (e) {
      console.log(e)
      callback({
        statu: false
      })
    }
  })

  socket.on("rematch grid", (roomId, callback) => {
    const room = rooms.find((r) => r.id === roomId)

    try {
      room.players.forEach(p => {
        p.resetGrid()
        io.to(p.id).emit("rematch grid")
      })
    } catch (e) {
      console.log(e)
      callback({
        status: false
      })
    }
  })

  socket.on("valid grid", (roomId, callback) => {
    const room = rooms.find((r) => r.id === roomId)

    try {
      room.wantRematch = room.wantRematch + 1 
  
      if (room.wantRematch === 2) {
        room.validBoards();
        room.wantRematch = 0
        room.players.forEach(p => {
          io.to(p.id).emit("start game")
        })
        askToPlay(room.start());
      }
    } catch (e) {
      console.log(e)
      callback({
        status: false
      })
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
