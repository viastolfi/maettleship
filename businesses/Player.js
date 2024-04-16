const uuid = require("uuid");
const { Grid } = require("./Grid.js");

class Player {
  constructor(socketId) {
    this.id = uuid.v4();
    this.socketId = socketId;
    this.grid = new Grid();
  }
}

module.exports = {
  Player,
};
