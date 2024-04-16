const { io } = require(`${__dirname}/index.js`);
const { Player } = require(`${__dirname}/businesses/Player.js`);
const { Room } = require(`${__dirname}/businesses/Room.js`);
const { Game } = require(`${__dirname}/game.js`);

let room;
let game;

io.on("connection", (socket) => {
  /* TODO : handle disconnection
  socket.on("disconnect", (reason) => {
    if (game.room.players.length === 2) {
      game.endGame();
      delete game.room;
    }
    console.debug(game);
  });
  */

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
