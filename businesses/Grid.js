const { Case } = require("./Case");

const GRID_SIZE = 10;

class Grid {
  constructor() {
    this.gridSize = GRID_SIZE;
    this.cases = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      let row = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        row.push(new Case());
      }
      this.cases.push(row);
    }
  }
}

module.exports = {
  Grid,
};
