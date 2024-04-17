const uuid = require("uuid");

class Piece {
  constructor(size, startPos, endPos) {
    this.id = uuid.v4();
    this.size = size;
    this.startPos = startPos;
    this.endPos = endPos;
    this.vertical = true;
    this.isSelected = false;
  }
}

module.exports = {
  Piece,
};
