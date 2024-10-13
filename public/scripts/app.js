import { drawGrid, drawEnnemyGrid, play, selectPiece } from "./game.js";

export const socket = io();
export let roomId = "";

socket.on("connect", () => {
  socket.emit("first connection", socket.id)

  drawGrid();
  selectPiece();

  document
    .querySelector("#start")
    .addEventListener("click", onCreateRoom());
  document
    .querySelector("#join")
    .addEventListener("click", onJoinRoom());
  document
    .querySelector("#joinQueue")
    .addEventListener("click", onJoinQueue());
})


export function handleError() {
  console.log("an error occurs")
  socket.emit("handle error", socket.id, roomId)
  window.location.href = "/error"
}

socket.on("start game", () => {
  const ennemyBoard = document.querySelector("#ennemy_board");
  const waitChoiceModal = document.getElementById("waitChoiceModal")
  const validGrid = document.getElementById("validGrid")

  validGrid.style.display = 'none'
  waitChoiceModal.style.display = 'none'
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

// #region rematch handling

socket.on("ask for rematch", () => {
  const rematchModal = document.getElementById("rematchModal")
  const gameEndedModal = document.getElementById("gameEndedModal")

  gameEndedModal.style.display = 'none'
  rematchModal.style.display = 'block'
})

socket.on("rematch grid", () => {
  const waitChoiceModal = document.getElementById("waitChoiceModal")
  const rematchModal = document.getElementById("rematchModal")
  const playNotification = document.querySelector("#play_notification");
  const hitNotification = document.querySelector("#hit_notification");
  const winNotification = document.querySelector("#win_notification");
  const ennemyGrid = document.getElementById("ennemy_board")
  const validGrid = document.getElementById("validGrid")

  validGrid.style.display = 'block'
  playNotification.style.display = 'none'
  hitNotification.style.display = 'none'
  winNotification.style.display = 'none'
  waitChoiceModal.style.display = 'none'
  rematchModal.style.display = 'none'
  ennemyGrid.style.display = 'none'

  drawGrid()
})

document.getElementById("validGrid").addEventListener('click', () => {
  const waitChoiceModal = document.getElementById("waitChoiceModal")
  waitChoiceModal.style.display = 'block'

  socket.emit("valid grid", roomId, (response) => {
    if (response.status === false) {
    }
  })
})

// #endregion rematch handling

function goToMenu() {
  const gameEndedModal = document.getElementById("gameEndedModal")
  const waitChoiceModal = document.getElementById("waitChoiceModal")
  const rematchModal = document.getElementById("rematchModal")
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
  gameEndedModal.style.display = 'none'
  waitChoiceModal.style.display = 'none'
  rematchModal.style.display = 'none'
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
  socket.emit("play", roomId, socket.id, move, (response) => {
    if (response.status === false) {
      handleError()
    } 
  });
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

function onJoinQueue() {
  const handler = function(event) {
    event.preventDefault();

    const loader = document.querySelector("#loader");
    const errorHolder = document.querySelector("#errorHandler")

    socket.emit("join matchmaking", socket.id, (response) => {
      if (response.status !== true) {
        if (response.reason === "exception") {
          handleError()
        }
        errorHolder.textContent = "Error : " + response.message
      } else {
        roomId = response.roomId;
        loader.style.display = "none"
      }
    });
  }

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
        if (response.reason === "exception") {
          handleError()
        }
        errorHolder.textContent = "Error : " + response.message
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

  socket.emit("reset grid", roomId, (respone) => {
    if (respone.status === false) {
      handleError()
    }
  })

  goToMenu()
});

document.getElementById('acceptButton').addEventListener('click', () => {
  const rematchModal = document.getElementById('rematchModal')
  rematchModal.style.display = 'none'

  socket.emit('rematch grid', roomId, (response) => {
    if (response.status === false) {
      handleError()
    }
  })
})

function sendGameEnded() {
  socket.emit("game ended", roomId, (response) => {
    if (response.status === false) {
      handleError()
    }
  });
}

document.getElementById('goToMenuButton').addEventListener('click', () => {
  sendGameEnded()
})

document.getElementById('goToMenuButton2').addEventListener('click', () => {
  sendGameEnded()
})

document.getElementById('rematchButton').addEventListener('click', () => {
  const endGameModal = document.getElementById('gameEndedModal')
  const waitChoicemodal = document.getElementById('waitChoiceModal');

  waitChoicemodal.style.display = 'block'
  endGameModal.style.display = 'none'

  socket.emit("ask for rematch", roomId, socket.id, (response) => {
    if (response.status === false) {
      handleError()
    }
  })
})
