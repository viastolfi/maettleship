import { drawGrid, drawEnnemyGrid, play, selectPiece } from "./game.js";

export const socket = io();

function startConnection() {
  socket.emit("first connection", socket.id, (response) => {
    console.log(response);
    drawGrid(response.player);
    selectPiece(response.player);

    document
      .querySelector("#start")
      .addEventListener("click", onCreateRoom(response.player));
    document
      .querySelector("#join")
      .addEventListener("click", onJoinRoom(response.player));
  });
}

socket.on("start game", (game) => {
  const ennemyBoard = document.querySelector("#ennemy_board");

  ennemyBoard.classList.remove("hidden-element");

  drawBoards(game);
});

socket.on("end game", () => {
  console.log("end game");
  const ennemyBoard = document.querySelector("#ennemy_board");
  const loader = document.querySelector("#loader");

  loader.classList.remove("hidden-element");
  ennemyBoard.classList.add("hidden-element");
});

socket.on("play", () => {
  const notification = document.querySelector("#play_notification");
  notification.classList.remove("hidden-element");
  play();
});

socket.on("played move", (game, isHit, isWin) => {
  const hitNotification = document.querySelector("#hit_notification");
  const winNotification = document.querySelector("#win_notification");

  if (isHit) hitNotification.classList.remove("hidden-element");
  else hitNotification.classList.add("hidden-element");

  if (isWin) winNotification.classList.remove("hidden-element");
  else winNotification.classList.add("hidden-element");

  drawBoards(game);
});

function drawBoards(game) {
  let p, e;

  let p1 = game.room.players[0];
  let p2 = game.room.players[1];

  if (p1.socketId === socket.id) {
    p = p1;
    e = p2;
  } else {
    p = p2;
    e = p1;
  }

  drawGrid(p);
  drawEnnemyGrid(e);
}

export function sendMove(move) {
  const notification = document.querySelector("#play_notification");
  socket.emit("play", move);
  notification.classList.add("hidden-element");
}

function onCreateRoom(player) {
  const handler = function (event) {
    event.preventDefault();
    const loader = document.querySelector("#loader");
    loader.classList.add("hidden-element");

    socket.emit("room creation", player);
  };

  return handler;
}

function onJoinRoom(player) {
  const handler = function (event) {
    event.preventDefault();
    const loader = document.querySelector("#loader");
    loader.classList.add("hidden-element");

    socket.emit("ask for room", player);
  };

  return handler;
}

setTimeout(startConnection, 100);
console.log("coucou");
