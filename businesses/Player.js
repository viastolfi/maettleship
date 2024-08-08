const uuid = require("uuid");
const { Grid } = require("./Grid.js");
const { Piece } = require("./Piece.js");

class Player {
  constructor(socketId, username) {
    this.id = socketId;
    this.username = username
    this.grid = new Grid();
    this.pieces = [];
    this.createPiece()
  }

  createPiece() {
    this.pieces.push(new Piece(1, { x: 0, y: 0 }, { x: 0, y: 0 }));
    //this.pieces.push(new Piece(2, { x: 2, y: 2 }, { x: 2, y: 3 }));
    //this.pieces.push(new Piece(3, { x: 4, y: 3 }, { x: 4, y: 5 }))

    this.pieces.forEach((piece) => {
      for (let i = piece.startPos.x; i <= piece.endPos.x; i++) {
        for (let j = piece.startPos.y; j <= piece.endPos.y; j++) {
          this.grid.cases[i][j].isShip = true;
          this.grid.cases[i][j].piece = piece;
        }
      }
    });
  }

  resetGrid() {
    this.grid = new Grid()
    this.pieces = []

    this.createPiece()
  }
}

module.exports = {
  Player,
};
