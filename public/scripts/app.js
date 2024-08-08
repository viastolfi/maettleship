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

socket.on("start game", (username) => {
  const ennemyBoard = document.querySelector("#ennemy_board");

  ennemyBoard.style.display = 'block'

  drawGrid();
  drawEnnemyGrid();
});

socket.on("end game", () => {
  console.log("end game");
  const ennemyBoard = document.querySelector("#ennemy_board");
  const loader = document.querySelector("#loader");

  loader.style.display = 'block'
  ennemyBoard.style.display = 'none'
});

socket.on("play", () => {
  const notification = document.querySelector("#play_notification");
  notification.style.display = 'block'
  play();
});

socket.on("played move", (isHit, isWin) => {
  const hitNotification = document.querySelector("#hit_notification");
  const winNotification = document.querySelector("#win_notification");

  if (isHit) hitNotification.style.display = 'block'
  else hitNotification.style.display = 'none'

  if (isWin) gameEnd()

  if (isWin) winNotification.style.display = 'block'
  else winNotification.style.display = 'none'

  drawGrid();
  drawEnnemyGrid();
});

socket.on('opponent left', () => {
  const modal = document.getElementById('opponentLeftModal');
  modal.style.display = 'block';
})

socket.on("go to menu", () => {
  goToMenu()
})

function goToMenu() {
  const modal = document.getElementById("gameEndedModal")
  const ennemyGrid = document.getElementById("ennemy_board")
  const roomkeyHolder = document.getElementById("roomkeyHolder")
  const loader = document.querySelector("#loader");
  const playNotification = document.querySelector("#play_notification");
  const hitNotification = document.querySelector("#hit_notification");
  const winNotification = document.querySelector("#win_notification");

  roomId = ""

  playNotification.style.display = 'none'
  hitNotification.style.display = 'none'
  winNotification.style.display = 'none'
  modal.style.display = 'none'
  ennemyGrid.style.display = 'none'
  loader.style.display = 'block'

  roomkeyHolder.innerHTML = ""
  roomkeyHolder.style.display = 'block'

  drawGrid()
}

function gameEnd() {
  const modal = document.getElementById('gameEndedModal');
  modal.style.display = 'block';
}

export function sendMove(move) {
  const notification = document.querySelector("#play_notification");
  socket.emit("play", roomId, socket.id, move);
  notification.style.display = 'none'
}

function onCreateRoom() {
  const handler = function (event) {
    event.preventDefault();
    const loader = document.querySelector("#loader");
    const roomkeyHolder = document.querySelector("#roomkeyHolder");
    loader.style.display = 'none';

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
    const errorHolder = document.querySelector("#errorHandler")

    roomId = roomKey;
    
    socket.emit("ask for room", roomKey, socket.id, (response) => {
      if (response.status !== true) {
        if (errorHolder.textContent == "") {
          errorHolder.append("Error : Room Id don't exist")
        }
      } else {
        loader.style.display = "none";
        roomkeyHolder.innerHTML += `Your room key is : <strong>` + roomId + `</strong>`;
      }
    });
  };

  return handler;
}

document.getElementById('closeModalButton').addEventListener('click', () => {
  const modal = document.getElementById('opponentLeftModal');
  modal.style.display = 'none';

  socket.emit("reset grid", roomId)

  goToMenu()
});

document.getElementById('goToMenuButton').addEventListener('click', () => {
  socket.emit("game ended", roomId);
})

setTimeout(startConnection, 100);