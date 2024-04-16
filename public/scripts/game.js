import { sendMove } from "./index.js";

const ownCanvas = document.getElementById("own_board");
const ownCtx = ownCanvas.getContext("2d");

const ennemyCanvas = document.getElementById("ennemy_board");
const ennemyCtx = ennemyCanvas.getContext("2d");

const CASE_SIZE = 30;

export function drawGrid(player) {
  ownCtx.strokeStyle = "black";

  for (let i = 0; i < player.grid.cases.length; i++) {
    for (let j = 0; j < player.grid.cases.length; j++) {
      ownCtx.strokeRect(
        i * CASE_SIZE + 1,
        j * CASE_SIZE + 1,
        CASE_SIZE,
        CASE_SIZE,
      );

      if (player.grid.cases[i][j].isShip) {
        ownCtx.fillStyle = "#A9A9A9";
        ownCtx.fillRect(
          i * CASE_SIZE + 1,
          j * CASE_SIZE + 1,
          CASE_SIZE - 1,
          CASE_SIZE - 1,
        );
      }

      if (player.grid.cases[i][j].isPlayed) {
        const centerX = CASE_SIZE / 2 + i * CASE_SIZE;
        const centerY = CASE_SIZE / 2 + j * CASE_SIZE;
        ownCtx.fillStyle = "red";

        const pointSize = 5;
        ownCtx.fillRect(
          centerX - pointSize / 2,
          centerY - pointSize / 2,
          pointSize,
          pointSize,
        );
      }
    }
  }
}

export function drawEnnemyGrid(player) {
  ennemyCtx.strokeStyle = "red";

  for (let i = 0; i < player.grid.cases.length; i++) {
    for (let j = 0; j < player.grid.cases.length; j++) {
      ennemyCtx.strokeRect(
        i * CASE_SIZE + 1,
        j * CASE_SIZE + 1,
        CASE_SIZE,
        CASE_SIZE,
      );

      if (player.grid.cases[i][j].isShip && player.grid.cases[i][j].isPlayed) {
        ennemyCtx.fillStyle = "#FFFFCC";
        ennemyCtx.fillRect(
          i * CASE_SIZE + 1,
          j * CASE_SIZE + 1,
          CASE_SIZE - 1,
          CASE_SIZE - 1,
        );
      }

      if (player.grid.cases[i][j].isPlayed) {
        const centerX = CASE_SIZE / 2 + i * CASE_SIZE;
        const centerY = CASE_SIZE / 2 + j * CASE_SIZE;
        ennemyCtx.fillStyle = "red";

        const pointSize = 5;
        ennemyCtx.fillRect(
          centerX - pointSize / 2,
          centerY - pointSize / 2,
          pointSize,
          pointSize,
        );
      }
    }
  }
}

function getCursorPosition(ennemyCanvas, event) {
  const rect = ennemyCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let col = Math.ceil(x / 30) - 1;
  let row = Math.ceil(y / 30) - 1;

  return { col: col, row: row };
}

function clickPlay(event) {
  let play = getCursorPosition(ennemyCanvas, event);
  ennemyCanvas.removeEventListener("mousedown", clickPlay);

  sendMove(play);
}

export function play() {
  ennemyCanvas.addEventListener("mousedown", clickPlay);
}
