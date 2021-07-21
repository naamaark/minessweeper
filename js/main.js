'use strict'
var isFirstClick = true;
var gTimer = { s: 0, m: 0, h: 0 };
var timerIntrval;
var gBoard = [];
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, minesPos: [] }

const MINE = '&#128163';
const EMPTY = ' ';
const FLAG = '&#128681';


function initGame() {
    gBoard = [];
    var elModal = document.querySelector(".modal");
    elModal.style.display = 'none';
    getMinesOptionalPos();
    buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    gGame.isOn = true;
}

function buildBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false }
        }
    }
    for (i = 0; i < gLevel.MINES; i++) {
        var minePos = getRandomPos()[0];
        gBoard[minePos.i][minePos.j].isMine = true;
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            console.log(countMines(i, j, board));
            board[i][j].minesAroundCount = countMines(i, j, board);
        }
    }
}

function renderBoard(board) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var symbol = EMPTY;
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '"><button  onclick="cellClicked(this,' + i + ',' + j + ')" oncontextmenu="cellMarked(this,' + i + ',' + j + '); return false">' + symbol + '</button> </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(".board-container");
    elContainer.innerHTML = strHTML;
}

function cellClicked(elButton, i, j) {
    if (!gGame.isOn) return;
    var elCell = elButton.parentElement;
    var cell = gBoard[i][j];

    if (isFirstClick) {
        timerIntrval = setInterval(updateTimer, 1000);
        isFirstClick = false;
    }
    if (!cell.isMine) {
        cell.isShown = true;
        renderCell(cell, elCell)
    } else if (cell.isMine) {
        mineClicked();
    }
    checkGameOver();
}


function renderCell(cell, elCell) {
    // Select the elCell and set the value
    if (cell.isMine) {
        var symbol = MINE;
    } else {
        var symbol = cell.minesAroundCount;
    }
    elCell.innerHTML = '<button class="disabled"> ' + symbol + '</button>';
}

function cellMarked(elButton, i, j) {
    var elCell = elButton.parentElement;
    var cell = gBoard[i][j];
    if (cell.isMarked) {
        elCell.innerHTML = '<button  onclick="cellClicked(event, this,' + i + ',' + j + ')" oncontextmenu="cellMarked(this,' + i + ',' + j + '); return false">' + EMPTY + '</button>'
        cell.isMarked = false;
    } else {
        cell.isMarked = true;
        elCell.innerHTML = '<button  onclick="cellClicked(event, this,' + i + ',' + j + ')" oncontextmenu="cellMarked(this,' + i + ',' + j + '); return false">' + FLAG + '</button>'
    }
    checkGameOver();
}

function countMines(cellI, cellJ, board) {

    var minesCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) minesCount++;
        }
    }
    return minesCount;
}

function checkGameOver() {
    var allMarked = isAllMarked();
    var allShown = isAllShown();
    if (allShown && allMarked) {
        clearInterval(timerIntrval);
        showModal(true);
    }
}

function isAllShown() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isMine && !cell.isShown) {
                return false;
            }
        }
    }
    return true;
}
function isAllMarked() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine && !cell.isMarked) {
                return false;
            }
        }
    }
    return true;
}


function expandShown(board, elCell, i, j) {
    var cell = board[i][j];

}

function getMinesOptionalPos() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            gGame.minesPos.push({ i, j });
        }
    }
}

function updateTimer() {
    gTimer.s++;
    if (gTimer.s === 60) {
        gTimer.s = 0;
        gTimer.m++;
    }
    if (gTimer.m === 60) {
        gTimer.m = 0;
        gTimer.h++;
    }
    renderTimer();

}
function renderTimer() {
    var elDiv = document.querySelector(".timer")
    elDiv.innerText = 's:' + gTimer.s + ' m:' + gTimer.m + ' h:' + gTimer.h;
}

function mineClicked() {

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine) {
                var className = '.cell' + i + '-' + j;
                var elCell = document.querySelector(className);
                renderCell(cell, elCell);
            }
        }
    }
    clearInterval(timerIntrval);
    showModal(false);

}

function showModal(isVictory) {
    var elModal = document.querySelector(".modal");
    if (isVictory) {
        elModal.innerText = 'you won!';
    } else {
        elModal.innerText = 'you lost!';
    }
    elModal.style.display = 'block';
}

function changeSize(size, mines) {
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    initGame();
}
