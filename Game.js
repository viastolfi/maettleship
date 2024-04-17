class Game {
  constructor(room) {
    this.room = room;
    this.actualPlayer = "";
    this.ennemy = "";
  }

  start() {
    this.room.players.forEach((player) => {
      io.to(player.socketId).emit("start game", this);
    });

    let rand = Math.floor(Math.random() * (1 - 0 + 1) + 0);
    this.actualPlayer = this.room.players[rand];
    rand === 0
      ? (this.ennemy = this.room.players[1])
      : (this.ennemy = this.room.players[0]);

    this.askToPlay();
  }

  endGame() {
    this.room.players.forEach((player) =>
      io.to(player.socketId).emit("end game"),
    );
  }

  askToPlay() {
    io.to(this.actualPlayer.socketId).emit("play");
  }

  move(move) {
    let playedCase = this.ennemy.grid.cases[move.col][move.row];
    if (playedCase.isPlayed === false) {
      playedCase.isPlayed = true;
      let isHit = playedCase.isShip;
      let isWin = this.checkWin();
      this.room.players.forEach((player) => {
        io.to(player.socketId).emit("played move", this, isHit, isWin);
      });
      let temp = this.actualPlayer;
      this.actualPlayer = this.ennemy;
      this.ennemy = temp;
    }
    this.askToPlay();
  }

  checkWin() {
    let w = true;
    for (let i = 0; i < this.ennemy.grid.cases.length; i++) {
      for (let j = 0; j < this.ennemy.grid.cases.length; j++) {
        let c = this.ennemy.grid.cases[i][j];
        if (c.isShip && !c.isPlayed) {
          w = false;
          break;
        }
      }
    }
    return w;
  }
}

module.exports = {
  Game,
};
