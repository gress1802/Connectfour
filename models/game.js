//Game object
//This object is used to store the game information
//theme: a theme object denoting the theme of the game
//id: a string denoting the unique id of the game
//status: a string denoting the status of the game. Can be either "Unfinished", "Loss", "Victory", or "Tie"
//start: a string denoting the time the game was started
//finish: a string denoting the time the game was finished. This property is only presented if the game is finished
//grid: a 2D array of token objects denoting the grid of the game. Each cell contains either an X (for a cell the player occupies), an O (for a cell the computer occupies), or a single space (for an empty cell)

const { v4: uuidv4 } = require('uuid');

class Game{
    constructor(theme, status, start, finish, grid){
        this.id = uuidv4();
        this.theme = theme;
        this.status = status;
        this.start = start;
        this.finish = finish;
        this.grid = grid;
    }
}

module.exports = Game;