import { sendMove, socket, roomId, handleError } from "./app.js";

const ownCanvas = document.getElementById("own_board");
const ownCtx = ownCanvas.getContext("2d");

const ennemyCanvas = document.getElementById("ennemy_board");
const ennemyCtx = ennemyCanvas.getContext("2d");

const CASE_SIZE = 30;
let selectedPiece = "";

export function drawGrid() {
  ownCtx.strokeStyle = "black";
  socket.emit("get player", roomId, socket.id, (response) => {
    if (response.status === false) {
      handleError()
    }
    let player = response.player;
    player.pieces.forEach((piece) => {
      for (let i = piece.startPos.x; i <= piece.endPos.x; i++) {
        for (let j = piece.startPos.y; j <= piece.endPos.y; j++) {
          if (piece.isSelected) {
            ownCtx.fillStyle = "#F88379";
            ownCtx.fillRect(
              i * CASE_SIZE + 1,
              j * CASE_SIZE + 1,
              CASE_SIZE - 1,
              CASE_SIZE - 1,
            );
          } else {
            ownCtx.fillStyle = "#A9A9A9";
            ownCtx.fillRect(
              i * CASE_SIZE + 1,
              j * CASE_SIZE + 1,
              CASE_SIZE - 1,
              CASE_SIZE - 1,
            );
          }
        }
      }
    });

    for (let i = 0; i < player.grid.cases.length; i++) {
      for (let j = 0; j < player.grid.cases.length; j++) {
        if (!player.grid.cases[i][j].isShip) {
          ownCtx.fillStyle = "white"
          ownCtx.fillRect(
            i * CASE_SIZE,
            j * CASE_SIZE,
            CASE_SIZE,
            CASE_SIZE
          )
        }

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
  });
}

export function drawEnnemyGrid() {
  ennemyCtx.strokeStyle = "red";

  socket.emit("get ennemy", roomId, socket.id, (response) => {
    if (response.status === false) {
      handleError()
    }

    let player = response.player;
    for (let i = 0; i < player.grid.cases.length; i++) {
      for (let j = 0; j < player.grid.cases.length; j++) {
        if (!player.grid.cases[i][j].isPlayed) {
          ennemyCtx.fillStyle = "white"
          ennemyCtx.fillRect(
            i * CASE_SIZE,
            j * CASE_SIZE,
            CASE_SIZE,
            CASE_SIZE
          )
        }

        ennemyCtx.strokeRect(
          i * CASE_SIZE + 1,
          j * CASE_SIZE + 1,
          CASE_SIZE,
          CASE_SIZE,
        );

        if (player.grid.cases[i][j].isPlayed) {
          const centerX = CASE_SIZE / 2 + i * CASE_SIZE;
          const centerY = CASE_SIZE / 2 + j * CASE_SIZE;

          if (player.grid.cases[i][j].isShip) {
            ennemyCtx.fillStyle = "#FFFFCC";
            ennemyCtx.fillRect(
              i * CASE_SIZE + 1,
              j * CASE_SIZE + 1,
              CASE_SIZE - 1,
              CASE_SIZE - 1,
            );
          }

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
  });
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

function validMoove(player, piece, movement) {
  let isValid = true;
  player.pieces.forEach((p) => {
    if (p.id === piece.id) {
      if (movement.type === "move") {
        if (p.vertical && movement.selectedCase.row + p.size > 10)
          isValid = false;
        if (!p.vertical && movement.selectedCase.col + p.size > 10)
          isValid = false;

        let colMin, colMax, rowMin, rowMax;

        if (p.vertical) {
          colMin =
            movement.selectedCase.col - 1 < 0
              ? 0
              : movement.selectedCase.col - 1;
          colMax =
            movement.selectedCase.col + 1 > 9
              ? 9
              : movement.selectedCase.col + 1;
          rowMin =
            movement.selectedCase.row - 1 < 0
              ? 0
              : movement.selectedCase.row - 1;
          rowMax =
            movement.selectedCase.row + p.size > 9
              ? 9
              : movement.selectedCase.row + p.size;
        } else {
          colMin =
            movement.selectedCase.col - 1 < 0
              ? 0
              : movement.selectedCase.col - 1;
          colMax =
            movement.selectedCase.col + p.size > 9
              ? 9
              : movement.selectedCase.col + p.size;
          rowMin =
            movement.selectedCase.row - 1 < 0
              ? 0
              : movement.selectedCase.row - 1;
          rowMax =
            movement.selectedCase.row + 1 > 9
              ? 9
              : movement.selectedCase.row + 1;
        }

        for (let i = colMin; i <= colMax; i++) {
          for (let j = rowMin; j <= rowMax; j++) {
            if (
              player.grid.cases[i][j].isShip &&
              player.grid.cases[i][j].piece.id !== p.id
            )
              isValid = false;
          }
        }
      } else {
        if (p.vertical && movement.selectedCase.x + p.size > 10)
          isValid = false;
        if (!p.vertical && movement.selectedCase.y + p.size > 10)
          isValid = false;
      }
    }
  });
  return isValid;
}

function clickNewCase(piece) {
  const clickNewCasehandler = function (event) {
    let selectedCase = getCursorPosition(ownCanvas, event);

    socket.emit("get player", " ", socket.id, (response) => {
      if (response.status === false) {
        handleError()
      }
      let player = response.player;
      player.pieces.forEach((p) => {
        if (
          p.id === piece.id &&
          p.isSelected &&
          p.isMovable &&
          validMoove(player, piece, {
            type: "move",
            selectedCase: selectedCase,
          })
        ) {
          for (let i = p.startPos.x; i <= p.endPos.x; i++) {
            for (let j = p.startPos.y; j <= p.endPos.y; j++) {
              player.grid.cases[i][j].piece = "";
              player.grid.cases[i][j].isShip = false;
            }
          }
          p.startPos = { x: selectedCase.col, y: selectedCase.row };
          if (p.vertical) {
            p.endPos = {
              x: selectedCase.col,
              y: selectedCase.row + piece.size - 1,
            };
          } else {
            p.endPos = {
              x: selectedCase.col + piece.size - 1,
              y: selectedCase.row,
            };
          }
          for (let i = p.startPos.x; i <= p.endPos.x; i++) {
            for (let j = p.startPos.y; j <= p.endPos.y; j++) {
              player.grid.cases[i][j].piece = p;
              player.grid.cases[i][j].isShip = true;
            }
          }
          socket.emit("update piece", socket.id, p, (response) => {
            if (response.status === false) {
              handleError()
            }
          });
          socket.emit("update grid", socket.id, player.grid, (response) => {
            if (response.status === true) {
              drawGrid();
            } else {
              handleError()
            }
          });
        }
      });
    });
  };

  return clickNewCasehandler;
}

function rotatePiece(piece) {
  const handler = function (event) {
    event.preventDefault();

    socket.emit("get player", " ", socket.id, (response) => {
      if (response.status === false) {
        handleError()
      }
      let player = response.player;
      player.pieces.forEach((p) => {
        if (
          p.id === piece.id &&
          p.isSelected &&
          p.isMovable &&
          validMoove(player, piece, {
            type: "rotation",
            selectedCase: p.startPos,
          })
        ) {
          for (let i = p.startPos.x; i <= p.endPos.x; i++) {
            for (let j = p.startPos.y; j <= p.endPos.y; j++) {
              player.grid.cases[i][j].piece = "";
              player.grid.cases[i][j].isShip = false;
            }
          }
          if (p.vertical) {
            p.endPos = { x: p.startPos.x + p.size - 1, y: p.startPos.y };
            p.vertical = false;
          } else {
            p.endPos = { x: p.startPos.x, y: p.startPos.y + p.size - 1 };
            p.vertical = true;
          }

          for (let i = p.startPos.x; i <= p.endPos.x; i++) {
            for (let j = p.startPos.y; j <= p.endPos.y; j++) {
              player.grid.cases[i][j].piece = p;
              player.grid.cases[i][j].isShip = true;
            }
          }
        }
        socket.emit("update piece", socket.id, p, (response) => {
          if (response.status === false) {
            handleError()
          }
        });
        socket.emit("update grid", socket.id, player.grid, (response) => {
          if (response.status === true) {
            drawGrid();
          } else {
            handleError()
          }
        });
      });
    });
  };
  return handler;
}

function clickChoose(event) {
  event.preventDefault();
  let selectedCase = getCursorPosition(ownCanvas, event);

  socket.emit("get player", " ", socket.id, (response) => {
    if (response.status === false) {
      handleError()
    }
    let player = response.player;
    if (player.grid.cases[selectedCase.col][selectedCase.row].isShip) {
      const rotate_button = document.querySelector("#rotate");
      rotate_button.classList.remove("hidden-element");

      let piece = player.grid.cases[selectedCase.col][selectedCase.row].piece;
      if (piece.isMovable) {
        let oldPieceId = selectedPiece.id;
        player.pieces.forEach((p) => {
          if (p.id === oldPieceId) {
            socket.emit("change selection status", socket.id, p.id, false, (response) => {
              if (response.status === false) {
                handleError()
              }
            });
          }
          if (p.id === piece.id) {
            selectedPiece = p;
            socket.emit("change selection status", socket.id, p.id, true, (response) => {
              if (response.status === false) {
                handleError()
              }
            });
          }
        });
      }

      drawGrid();

      rotate_button.addEventListener("click", rotatePiece(piece));
      ownCanvas.addEventListener("mousedown", clickNewCase(piece));
    }
  });
}

export function play() {
  ennemyCanvas.addEventListener("mousedown", clickPlay);
}

export function selectPiece() {
  ownCanvas.addEventListener("mousedown", clickChoose);
}
