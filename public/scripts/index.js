import { drawGrid, drawEnnemyGrid, play, selectPiece } from "./game.js";

export const socket = io();
export let roomId = "";

function startConnection() {
  socket.emit("first connection", socket.id)

  drawGrid();
  selectPiece();

  document
    .querySelector("#start")
    .addEventListener("click", onCreateRoom());
  document
    .querySelector("#join")
    .addEventListener("click", onJoinRoom());
}

socket.on("start game", () => {
  const ennemyBoard = document.querySelector("#ennemy_board");

  ennemyBoard.classList.remove("hidden-element");

  drawGrid();
  drawEnnemyGrid();
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

socket.on("played move", (isHit, isWin) => {
  const hitNotification = document.querySelector("#hit_notification");
  const winNotification = document.querySelector("#win_notification");

  if (isHit) hitNotification.classList.remove("hidden-element");
  else hitNotification.classList.add("hidden-element");

  if (isWin) winNotification.classList.remove("hidden-element");
  else winNotification.classList.add("hidden-element");

  drawGrid();
  drawEnnemyGrid();
});

export function sendMove(move) {
  const notification = document.querySelector("#play_notification");
  socket.emit("play", roomId, socket.id, move);
  notification.classList.add("hidden-element");
}

function onCreateRoom() {
  const handler = function (event) {
    event.preventDefault();
    const loader = document.querySelector("#loader");
    const roomkeyHolder = document.querySelector("#roomkeyHolder");
    loader.classList.add("hidden-element");

    socket.emit("room creation", socket.id, (response) => {
      roomId = response.roomId;
      roomkeyHolder.innerHTML += `Your room key is : <strong>` + roomId + `</strong>`;
    });
  };

  return handler;
}

function onJoinRoom() {
  const handler = function (event) {
    event.preventDefault();

    const loader = document.querySelector("#loader");
    const roomKey = document.querySelector("#roomKey").value;
    const roomkeyHolder = document.querySelector("#roomkeyHolder");

    loader.classList.add("hidden-element");

    roomId = roomKey;
    roomkeyHolder.innerHTML += `Your room key is : <strong>` + roomId + `</strong>`;
    socket.emit("ask for room", roomKey, socket.id);
  };

  return handler;
}

setTimeout(startConnection, 100);
