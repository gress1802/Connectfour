//Token Object
//This object is used to store the token information in the database
//id: a string denoting the unique id of the token
//name: a string that describes the tokens appearance
//url: a string giving the url of the image of the token in either PNG, GIF, or JPEG format

const { v4: uuidv4 } = require('uuid');

class Token {
   constructor(name, url) {
        this.name = name;
        this.url = url;
        this.id = uuidv4();
   }
}

module.exports = Token;