//Theme Object
//This object is used to store the theme information in the database
//color: a string denoting the color of the theme
//playerToken: a token object denoting the player
//computerToken: a token object denoting the computer

class Theme{
    constructor(color, playerToken, computerToken){
        this.color = color;
        this.playerToken = playerToken;
        this.computerToken = computerToken;
    }
}

module.exports = Theme;