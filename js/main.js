'use strict'
var isFirstClick = true;
var gTimer = { s: 0, m: 0, h: 0 };
var timerIntrval;
var gBoard = [];
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, minesPos: [], lives: 3, hints: 3, isHintMode: false, score: 0 }
var gScores = { 4: [Infinity], 8: [Infinity], 12: [Infinity] };

const MINE = '&#128163';
const EMPTY = ' ';
const FLAG = '&#128681';
const NORMAL = '&#128512';
const DEAD = '&#129327';
const WIN = '&#128526';
const HINT = '&#128161';
const HINTMODE = '&#128294';
const LIVE = '&#128151;'


function initGame() {
    gBoard = [];
    gGame.minesPos = [];
    isFirstClick = true;
    gGame.isHintMode = false;
    gGame.lives = 3;
    gGame.hints = 3;
    gGame.score = 0;
    gTimer.s = 0;
    gTimer.m = 0;
    gTimer.h = 0;
    renderScore();
    renderLives();
    renderTimer();
    renderSmiley(NORMAL);
    renderHint();
    clearInterval(timerIntrval);
    var elModal = document.querySelector(".modal");
    elModal.style.display = 'none';
    getMinesOptionalPos();
    buildBoard();
    renderBoard();
    console.log(gScores);
    gGame.isOn = true;
}

function buildBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false, isChecked: false, i: i, j: j }
        }
    }
}

function setMines(cell) {
    var cellI = cell.i;
    var cellJ = cell.j;
    for (var i = 0; i < gLevel.MINES; i++) {
        var minePos = getRandomPos()[0];
        if (minePos.i === cellI && minePos.j === cellJ) {
            i--;
            continue;
        }
        gBoard[minePos.i][minePos.j].isMine = true;
    }
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            gBoard[i][j].minesAroundCount = countMines(i, j, gBoard);
        }
    }
}

function renderBoard() {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            var symbol = EMPTY;
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '"><button class="button-cell" onclick="cellClicked(this,' + i + ',' + j + ')" oncontextmenu="cellMarked(this,' + i + ',' + j + '); return false">' + symbol + '</button> </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(".board-container");
    elContainer.innerHTML = strHTML;
}

function cellClicked(elButton, cellI, cellJ) {
    if (!gGame.isOn) return;
    var elCell = elButton.parentElement;
    var cell = gBoard[cellI][cellJ];
    if (gGame.isHintMode) {
        toggleNegsReaveal(cell, elCell, false);
        setTimeout(toggleNegsReaveal, 1000, cell, elCell, true)
        setTimeout(function () { gGame.isHintMode = false }, 1001);
        renderHint();
        return;
    }
    if (isFirstClick) {
        timerIntrval = setInterval(updateTimer, 1000);
        setMines(cell);
        setMinesNegsCount();
        expandShown(elCell, cell);
        isFirstClick = false;
    }
    if (!cell.isMine) {
        cell.isShown = true;
        expandShown(elCell, cell)
    } else if (cell.isMine) {
        mineClicked(cell, elCell);
    }
    checkGameOver();
}

function cellMarked(elButton, cellI, cellJ) {
    var elCell = elButton.parentElement;
    var cell = gBoard[cellI][cellJ];
    if (cell.isMarked) {
        elCell.innerHTML = '<button class="button-cell"  onclick="cellClicked(this,' + cellI + ',' + cellJ + ')" oncontextmenu="cellMarked(this,' + cellI + ',' + cellJ + '); return false">' + EMPTY + '</button>'
        cell.isMarked = false;
    } else {
        cell.isMarked = true;
        elCell.innerHTML = '<button class="button-cell" onclick="cellClicked(this,' + cellI + ',' + cellJ + ')" oncontextmenu="cellMarked(this,' + cellI + ',' + cellJ + '); return false">' + FLAG + '</button>'
    }
    checkGameOver();
}

function expandShown(elCell, cell) {
    var i = cell.i;
    var j = cell.j;
    if (cell.minesAroundCount === 0) {
        toggleNegsReaveal(cell, elCell);
    } else if (cell.minesAroundCount > 0) {
        toggleRevealCell(cell, elCell);
    }
}

function toggleRevealCell(cell, elCell, isHide = false) {
    // Select the elCell and set the value
    if (isHide) {
        var symbol = cell.isMarked ? FLAG : EMPTY;
        elCell.innerHTML = '<button class="button-cell" onclick="cellClicked(this,' + cell.i + ',' + cell.j + ')" oncontextmenu="cellMarked(this,' + cell.i + ',' + cell.j + '); return false">' + symbol + '</button>'
        return;
    } else if (cell.isMine) {
        var symbol = MINE;
    } else if (cell.minesAroundCount > 0) {
        var symbol = cell.minesAroundCount;
    } else if (cell.minesAroundCount === 0) {
        var symbol = EMPTY
    }
    elCell.innerHTML = '<button class="disabled button-cell"> ' + symbol + '</button>';
}

function toggleNegsReaveal(cell, elCell, isHide = false) {
    var cellI = cell.i;
    var cellJ = cell.j;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            cell = gBoard[i][j];
            var className = '.cell' + i + '-' + j;
            var elCell = document.querySelector(className);
            if (gGame.isHintMode) {
                if (cell.isShown) continue;
                else {
                    toggleRevealCell(cell, elCell, isHide);
                    continue;
                }
            }
            if (cell.i !== cellI && cell.j !== cellJ
                && cell.minesAroundCount === 0 && !cell.isChecked) {
                cell.isChecked = true;
                elCell = document.querySelector('.cell' + i + '-' + j);
                toggleNegsReaveal(cell, elCell)
            }
            cell.isShown = true;
            toggleRevealCell(cell, elCell, isHide);
        }
    }
}

function mineClicked(cell, elCell) {
    if (gGame.lives > 0) {
        gGame.lives--;
        toggleRevealCell(cell, elCell);
        renderLives();
    } else if (gGame.lives === 0) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                var cell = gBoard[i][j];
                if (cell.isMine) {
                    var className = '.cell' + i + '-' + j;
                    var elCell = document.querySelector(className);
                    toggleRevealCell(cell, elCell);
                }
            }
        }
        clearInterval(timerIntrval);
        renderSmiley(DEAD);
        showModal(false);
    }

}

function hintClicked() {
    gGame.isHintMode = true;
    var idx = gGame.hints;
    var elSpan = document.querySelector(".hint" + idx)
    elSpan.innerHTML = HINTMODE;
    gGame.hints--;
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

function checkGameOver() {
    var allMarked = isAllMarked();
    var allShown = isAllShown();
    if (allShown && allMarked) {
        clearInterval(timerIntrval);
        renderSmiley(WIN);
        showModal(true);
        gScores[gLevel.SIZE].push(gGame.score);
    } else if (allShown) {
        clearInterval(timerIntrval);
        renderSmiley(WIN);
        showModal(true);
        gScores[gLevel.SIZE].push(gGame.score);
    }

}




