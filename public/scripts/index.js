import { drawGrid, drawEnnemyGrid, play } from "./game.js";

export const socket = io();

socket.on("start game", (game) => {
  const gameCard = document.querySelector("#game");

  gameCard.classList.remove("hidden-element");

  drawBoards(game);
});

socket.on("end game", () => {
  console.log("end game");
  const game = document.querySelector("#game");
  const loader = document.querySelector("#loader");

  loader.classList.remove("hidden-element");
  game.classList.add("hidden-element");
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

const onCreateRoom = function (event) {
  event.preventDefault();

  const loader = document.querySelector("#loader");
  loader.classList.add("hidden-element");

  socket.emit("room creation", socket.id);
};

const onJoinRoom = function (event) {
  event.preventDefault();

  const loader = document.querySelector("#loader");
  loader.classList.add("hidden-element");

  socket.emit("ask for room", socket.id);
};

document.querySelector("#start").addEventListener("click", onCreateRoom);
document.querySelector("#join").addEventListener("click", onJoinRoom);
