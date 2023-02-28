const { json } = require("express");

//this is the current sid and gid that is being used
var sid;
var curGameid;

//This function creates the sid using the getSid() function and sets it to the current sid variable
async function createSid(){
    if(sid == null){
        sid = await getSid();
    }
}

/*
 * This is a function that populates the selectors with the token names from the metadata object
 * computer's token list is reverse order in relation to players
*/
async function populateSelector(){
    var meta = await getMeta();
    var playerSelect = $('#playerSelect');
    var computerSelect = $('#computerSelect');
    for(var i = 0; i < meta.tokens.length; i++){
        var curPlayer = $('<option>');
        curPlayer.attr('id', meta.tokens[i].name);
        curPlayer.text(meta.tokens[i].name);
        curPlayer.attr('value', meta.tokens[i].name);
        playerSelect.append(curPlayer);
    }
    for(var i = meta.tokens.length-1; i >= 0; i--){
        var curComputer = $('<option>');
        curComputer.attr('id', meta.tokens[i].name + 'C');
        curComputer.text(meta.tokens[i].name);
        curComputer.attr('value', meta.tokens[i].name);
        computerSelect.append(curComputer);
    }
    disableComputer();
    disablePlayer();
}

/*
* returnMain() is a function that is envoked when the user clicks the return button in the gameboard container
* It will return the user to the main page
*/
function returnMain(){
    $("#gameboard").css("visibility", "hidden"); 
    $("#main").css("visibility", "visible");
    $("#lose").css("visibility", "hidden"); 
    $("#win").css("visibility", "hidden");
    $('.top').css('visibility', 'hidden'); 
}

/*
 * returnGameboard() is a function that is envoked when the user clicks the create button in the main container
 * It will return the user to the gameboard container
*/
function returnGameboard(){
    $("#main").css("visibility", "hidden"); 
    $("#gameboard").css("visibility", "visible");
    $('.top').css('visibility', 'visible');
}

/*
 * This is a function that sends a POST request to the API that will create and return the SID 
 * The function returns a promise that will return the SID
*/
function getSid(){
    var promise = new Promise((resolve, reject) => {
        fetch('/connectfour/api/v1/sids', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {'Content-Type' : 'application/json'}
        }).then(response => {
            if(!response.ok){
                throw new Error('Error in the server');
            }
            const sid = response.headers.get("X-sid");
            resolve(sid);
        }).catch(error => {
            reject(error);
        });
    });
    return promise;
}

/*
 * This is a function that sends a GET request to the API to get the metadata. Returns the promise
*/
function getMeta(){
    var promise = new Promise((resolve, reject) => {
        fetch('/connectfour/api/v1/meta', {
        method: 'GET',
        headers: {'Content-Type' : 'application/json'}
        }).then(response => {
            if(!response.ok){
                throw new Error('Error in the server');
            }
            resolve(response.json());
        }).catch(error => {
            reject(error);
        });
    });
    return promise;
}

/*
 * This is a functions that sends a GET request to the API to get the specified gid game associated with the specified sid
 * Returns the promise
*/
function getGame(sid, gid){
    var promise = new Promise((resolve,reject) => {
        fetch('/connectfour/api/v1/sids/' + sid + '/gid' + gid, {
            method: 'GET',
            headers: {'Content-Type' : 'application/json'}
        }).then(response => {
            if(!response.ok){
                throw new Error('Error in the server');
            }else{
                resolve(response.json());
            }
        }).catch(error => {
            reject(error);
        });
    });
    return promise;
}

/*
 * This is a function that uses the metadata object with the tokenName to get the tokenId
*/
async function getTokenId(tokenName){
    var meta = await getMeta();
    var tokenId = false;
    for(var i = 0; i < meta.tokens.length; i++){
        if(meta.tokens[i].name == tokenName){
            tokenId = meta.tokens[i].id;
            break;
        }
    }
    return tokenId;
}

/*
* These are functions that get the currently selected player token name and computer token name from the html file
*/
function getPlayerName(){
    return $("#playerSelect").val();
}
function getComputerName(){
    return $("#computerSelect").val();
}

/*
* Select the currently selected color value from the html file
*/
function getColor(){
    return $("#head").val();
}

/* 
* When creating a new game you will be taken to the gameboard container and a new game will be created
* using the POST /connectfour/api/v1/sids/:sid endpoint
*/
async function createGame(){
    var color = getColor();
    var playerTokenId = $("#playerTokenId").val();
    var computerTokenId = $("#computerTokenId").val();
    var playerTokenId = await getTokenId(getPlayerName());
    var computerTokenId = await getTokenId(getComputerName());
    fetch('/connectfour/api/v1/sids/'+sid+'?color='+encodeURIComponent(color), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            playerTokenId: playerTokenId,
            computerTokenId: computerTokenId
        })
    })
    .then(response => {return response.json();})
    .then(data => {
        setupGame(data);
        addGame(data);
        let gameId = data.id;
    })
    .catch(error => console.error(error));
}

/*
 * This is a function that sets up the html for the gameboard container that is taken to when the user clicks the create button
 * It will take in a parameter game 
*/
function setupGame(game){
    var theme = game.theme;
    let gameboardColor = theme.color;
    let playerToken = theme.playerToken;
    let computerToken = theme.computerToken;
    $('.token').attr('src', playerToken.url);
    $('#coloredBoard').css('background-color', gameboardColor);
}

/*
 * These are functions to make sure the player and computer can't select the same token
*/
function disablePlayer(){
    let player = $("#playerSelect").val();
    $('#'+'computerSelect'+' option').attr('disabled', false);
    $('#'+player+'C').attr('disabled', true);
}
function disableComputer(){
    let computer = $("#computerSelect").val();
    $('#'+'playerSelect'+' option').attr('disabled', false);
    $('#'+computer).attr('disabled', true);
}

/*
 * This is the function that will add to the table to view the game(s)
*/
function addGame(game){
    clearBoard();
    let newRow = $('<tr>');
    newRow.attr('id', game.id);
    let statusCol = $('<td>').text(game.status);
    let playerImg = $('<img>', {
        width: 50,
        height: 50
    }).attr('src', game.theme.playerToken.url);
    let computerImg = $('<img>', {
        width: 50,
        height: 50
    }).attr('src', game.theme.computerToken.url);
    $(playerImg).css('border-radius', '100%');
    $(computerImg).css('border-radius', '100%');
    let playerTokenCol = $('<td>').append(playerImg);
    let computerTokenCol = $('<td>').append(computerImg);
    let date = new Date(game.start);
    let timeStart = $('<td>').text(date.toLocaleString());
    let timeFinished = $('<td>').text('-');
    let buttonContainer = $('<td>');
    let button = getButton(game.id);
    curGameid = game.id;
    button.on('click', viewClick);
    button.css('background-color', getColor());
    buttonContainer.append(button);
    newRow.append(statusCol, playerTokenCol, computerTokenCol, timeStart, timeFinished, buttonContainer);
    $('#tablebody').append(newRow);
    $('#status').text('UNFINISHED');
}

/*
 * This function returns the button that will be used to view or start up a previously started game
 * stores game id in the button data
*/
function getButton(id){
    let button = $('<button>', {
        class: 'btn btn-info',
        type: 'button',
        id: 'viewButton'
    }).text('View');
    button.data('id', id);
    return button;
}

/*
 * If the view button is click we bring the user to the gameboard displaying the corresponding gameborad container
*/
async function viewClick(){
    let gid = $(this).data('id');
    curGameid = gid;
    let currentGame = await getGame(sid, gid);
    loadGame(currentGame);
    $('#status').text(currentGame.status);
    $('#gameboard').css('visibility', 'visible');
    $('#main').css('visibility', 'hidden');
}

/*
 * This function uses the /connectfour/api/v1/sids/:sid/gids/:gid to make a git request to the API
 * to get the specified game associated with the specified sid
*/
function getGame(sid, gid){
    var promise = new Promise((resolve,reject) => {
        fetch('/connectfour/api/v1/sids/' + sid + '/gids/' + gid, {
            method: 'GET',
            headers: {'Content-Type' : 'application/json'}
        }).then(response => {
            if(!response.ok){
                throw new Error('Error in the server');
            }else{
                resolve(response.json());
            }
        }).catch(error => {
            reject(error);
        });
    });
    return promise;
}

/*
 * This function is used to make a post request to the API to make a move
 * It uses the /connectfour/api/v1/sids/:sid/gids/:gid endpoint
 * This endpoint includes the query parameter move which is a number from 0-6 that represents the column the player wants to make a move in
 * The response from the API is a game object or an error object
*/
function makeMovePromise(gid, move){
    var promise = new Promise((resolve,reject) => {
        fetch('/connectfour/api/v1/sids/' + sid + '/gids/' + gid + '?move=' + move, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'}
        }).then(response => {
            if(!response.ok){
                throw new Error('Error in the server');
            }else{
                resolve(response.json());
            }
        }).catch(error => {
            reject(error);
        });
    });
    return promise;
}

async function makeMove(move){
    var thisGame = await getGame(sid, curGameid);
    if(thisGame.status != 'UNFINISHED') {
        alert('Game is over');
        return;
    }
    var gameAfterMove = await makeMovePromise(curGameid, move);
    loadGame(gameAfterMove);
}

/*
 * This is a function that is used to load the game onto the board after a move is made
 * it uses the game object as a parameter that is returned from the API
*/
function loadGame(game){
    var grid = game.grid;
    var playerToken = game.theme.playerToken;
    var computerToken = game.theme.computerToken;
    $('#coloredBoard').css('background-color', game.theme.color);
    clearBoard();
    for(let i = 0; i<grid.length; i++){
        for(let j = 0; j<grid[i].length; j++){
            if(grid[i][j] == 'x'){
                var divP = $('#'+i.toString()+j.toString());
                var tokenP = $('<img>').attr('src', playerToken.url);
                tokenP.addClass('token');
                divP.append(tokenP);
            }
            if(grid[i][j] == 'o'){
                var divC = $('#'+i.toString()+j.toString());
                var tokenC = $('<img>').attr('src', computerToken.url);
                tokenC.addClass('token');
                divC.append(tokenC);
            }
        }
    }
    let row = $('#'+game.id);
    let statusData = row.children().eq(0);
    let finishedData = row.children().eq(4);
    let finishDate = new Date(game.finish);
    if(game.status == 'UNFINISHED'){
        $('#win').css('visibility', 'hidden');
        $('#lose').css('visibility', 'hidden');
        $('.top').css('visibility', 'visible');
        $('.top').children('img').attr('src', playerToken.url);
        $('status').text('UNFINISHED');
    }
    if(game.status == 'LOSS') {
        $('#lose').css('visibility', 'visible');
        $('.top').css('visibility', 'hidden');
        statusData.text('LOSS');
        finishedData.text(finishDate.toLocaleString());
        $('#status').text('LOSS');
    }else if(game.status == 'VICTORY') {
        $('#win').css('visibility', 'visible');
        $('.top').css('visibility', 'hidden');
        statusData.text('VICTORY');
        finishedData.text(finishDate.toLocaleString());
        $('#status').text('VICTORY');
    }else if(game.status == 'TIE') {
        $('.top').css('visibility', 'hidden');
        alert('Wow! You made a tied with a random number generator!'); 
        statusData.text('TIE');
        finishedData.text(finishDate.toLocaleString());
        $('#status').text('TIE');
    }
}

//This is a function that clears the board
function clearBoard(){
    for(let i = 0; i<5; i++){
        for(let j = 0; j<7; j++){
            var divA = $('#'+i.toString()+j.toString());
            divA.empty();
        }
    }
    for(let i = 0; i<5; i++){
        for(let j = 0; j<7; j++){
            var divA = $('#'+i.toString()+j.toString());
            divA.empty();
        }
    }
}

