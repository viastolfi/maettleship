class Room {
    constructor() {
        this.id = this.generateRoomId(); // change the id with something prettier
        this.players = [];
        this.actualPlayer = "";
        this.ennemy = "";
        this.wantRematch = 0;
    }

    addPlayer(player) {
        this.players.push(player);
    }

    start() {
        let rand = Math.floor(Math.random() * (1 - 0 + 1) + 0);
        this.actualPlayer = this.players[rand].id;
        rand === 0
        ? (this.ennemy = this.players[1].id)
        : (this.ennemy = this.players[0].id);

        this.players.forEach((p) => {
            for (let i = 0; i < p.pieces.length; i++) {
                p.pieces[i].isMovable = false;
                p.pieces[i].isSelected = false;
            }
        });

        return this.actualPlayer
    }

    move(move) {
        let ret = {isMove: false, player: this.actualPlayer}
        let playedCase = this.players.find((p) => p.id === this.ennemy).grid.cases[move.col][move.row];
    
        if (playedCase.isPlayed === false) {
            this.players.find((p) => p.id === this.ennemy).grid.cases[move.col][move.row].isPlayed = true;

            ret = {isMove: true, players: this.players, isHit: playedCase.isShip, 
                isWin: this.checkWin()}

            if(!ret.isHit || ret.isWin) {
                let tmp = this.actualPlayer;
                this.actualPlayer = this.ennemy;
                this.ennemy = tmp;
            }
            
            ret.player = this.actualPlayer
        }
        
        return ret
    }

    checkWin() {
        const e = this.players.find((p) => p.id === this.ennemy);
        let w = true;
    
        for (let i = 0; i < e.grid.cases.length; i++) {
            for (let j = 0; j < e.grid.cases.length; j++) {
            let c = e.grid.cases[i][j];
    
            if (c.isShip && !c.isPlayed) {
                w = false;
                break;
            }
            }
        }
    
        return w;
    }

    validBoards() {
        try {
            this.players.forEach((player) => {
                // sometimes i get error here
                player.pieces.forEach((piece) => {
                for (let i = piece.startPos.x; i <= piece.endPos.x; i++) {
                    for (let j = piece.startPos.y; j <= piece.endPos.y; j++) {
                        player.grid.cases[i][j].isShip = true;
                    }
                }
                });
            });
        } catch {
            throw new Error()
        }
    }

    generateRoomId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const idLength = 5;
        let roomId = '';
        
        for (let i = 0; i < idLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            roomId += characters[randomIndex];
        }
        
        return roomId;
    }
}

module.exports = {
    Room,
}