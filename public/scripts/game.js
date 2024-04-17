import { sendMove } from "./index.js";

const ownCanvas = document.getElementById("own_board");
const ownCtx = ownCanvas.getContext("2d");

const ennemyCanvas = document.getElementById("ennemy_board");
const ennemyCtx = ennemyCanvas.getContext("2d");

const CASE_SIZE = 30;

function drawSelectedPiece(piece) {
  for (let i = piece.startPos.x; i <= piece.endPos.x; i++) {
    for (let j = piece.startPos.y; j <= piece.endPos.y; j++) {
      ownCtx.fillStyle = "#F88379";
      ownCtx.fillRect(
        i * CASE_SIZE + 1,
        j * CASE_SIZE + 1,
        CASE_SIZE - 1,
        CASE_SIZE - 1,
      );
    }
  }
}

export function drawGrid(player) {
  ownCtx.clearRect(0, 0, ownCanvas.height, ownCanvas.width);

  ownCtx.strokeStyle = "black";

  player.pieces.forEach((piece) => {
    for (let i = piece.startPos.x; i <= piece.endPos.x; i++) {
      for (let j = piece.startPos.y; j <= piece.endPos.y; j++) {
        ownCtx.fillStyle = "#A9A9A9";
        ownCtx.fillRect(
          i * CASE_SIZE + 1,
          j * CASE_SIZE + 1,
          CASE_SIZE - 1,
          CASE_SIZE - 1,
        );
      }
    }
  });

  for (let i = 0; i < player.grid.cases.length; i++) {
    for (let j = 0; j < player.grid.cases.length; j++) {
      ownCtx.strokeRect(
        i * CASE_SIZE + 1,
        j * CASE_SIZE + 1,
        CASE_SIZE,
        CASE_SIZE,
      );

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

function clickNewCase(player, piece) {
  const clickNewCasehandler = function (event) {
    let selectedCase = getCursorPosition(ownCanvas, event);
    player.pieces.forEach((p) => {
      if (p.id === piece.id) {
        for (let i = p.startPos.x; i <= p.endPos.x; i++) {
          for (let j = p.startPos.y; j <= p.endPos.y; j++) {
            player.grid.cases[i][j].piece = "";
            player.grid.cases[i][j].isShip = false;
          }
        }
        p.startPos = { x: selectedCase.col, y: selectedCase.row };
        if (p.isVertical) {
          p.endPos = {
            x: selectedCase.col + piece.size - 1,
            y: selectedCase.row,
          };
        } else {
          p.endPos = {
            x: selectedCase.col,
            y: selectedCase.row + piece.size - 1,
          };
        }
        for (let i = p.startPos.x; i <= p.endPos.x; i++) {
          for (let j = p.startPos.y; j <= p.endPos.y; j++) {
            player.grid.cases[i][j].piece = p;
            player.grid.cases[i][j].isShip = true;
          }
        }
      }
    });
    drawGrid(player);
    ownCanvas.removeEventListener("mousedown", clickNewCasehandler);
    selectPiece(player);
  };

  return clickNewCasehandler;
}

function clickChoose(player) {
  const clickHandler = function (event) {
    let selectedCase = getCursorPosition(ownCanvas, event);
    if (player.grid.cases[selectedCase.col][selectedCase.row].isShip) {
      let piece = player.grid.cases[selectedCase.col][selectedCase.row].piece;
      drawSelectedPiece(piece);
      ownCanvas.removeEventListener("mousedown", clickHandler);
      ownCanvas.addEventListener("mousedown", clickNewCase(player, piece));
    }
  };

  return clickHandler;
}

export function play() {
  ennemyCanvas.addEventListener("mousedown", clickPlay);
}

export function selectPiece(player) {
  ownCanvas.addEventListener("mousedown", clickChoose(player));
}
