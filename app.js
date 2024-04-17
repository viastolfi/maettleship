const { Player } = require(`${__dirname}/businesses/Player.js`);
const { Room } = require(`${__dirname}/businesses/Room.js`);
const { Game } = require(`${__dirname}/game.js`);
const { io } = require(`${__dirname}/index.js`);

let room;
let game;
let players = [];

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
    game.start();
  });

  socket.on("play", (move) => {
    game.move(move);
  });
});
