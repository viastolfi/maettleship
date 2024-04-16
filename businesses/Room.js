const uuid = require("uuid");

class Room {
  constructor() {
    this.id = uuid.v4();
    this.players = [];
  }

  addPlayer(player) {
    this.players.push(player);
  }
}

module.exports = {
  Room,
};
