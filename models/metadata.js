//Metadata object
//This object is used to store the metadata information
//tokens: A list of all token objects supported by the game
//default: a theme object denoting the default theme for new game creation

class Metadata{
    constructor(tokens, def){
        this.tokens = tokens;
        this.default = def;
    }
}

module.exports = Metadata;