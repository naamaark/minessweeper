function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomPos() {
    var size = gLevel.SIZE * gLevel.SIZE;
    var rand = getRandomInt(0, gGame.minesPos.length);
    var pos = gGame.minesPos.splice(rand, 1);
    return pos;
}

function changeSize(size, mines) {
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    gScores[gLevel.SIZE].push(gGame.score);
    clearInterval(timerIntrval);
    initGame();
}

function renderTimer() {
    var elDiv = document.querySelector(".timer")
    elDiv.innerText = 's:' + gTimer.s + ' m:' + gTimer.m + ' h:' + gTimer.h;
}

function renderScore() {
    var elDiv = document.querySelector(".score")
    size = gLevel.SIZE.toString();
    var currScore = gScores[size] ? gGame.score : 'no score';
    var bestScore = gScores[size] ? Math.min.apply(null, gScores[size]) : 'no score';
    elDiv.innerText = 'current score: ' + currScore + ' best score: ' + bestScore;
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
function renderLives() {
    var strHTML = '';
    for (var i = 0; i < gGame.lives; i++) {
        strHTML += LIVE;
    }
    var elDiv = document.querySelector(".lives");
    elDiv.innerHTML = strHTML;
}

function renderSmiley(symbol) {
    var elDiv = document.querySelector(".smiley");
    elDiv.innerHTML = '<span onclick="initGame()">' + symbol + '</span>';
}

function renderHint() {
    var strHTML = '';
    for (var i = 1; i <= gGame.hints; i++) {
        strHTML += '<span class="hint' + i + '" onclick="hintClicked()">' + HINT + '</span>';
    }
    var elDiv = document.querySelector(".hint");
    elDiv.innerHTML = strHTML;
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

function getMinesOptionalPos() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            gGame.minesPos.push({ i, j });
        }
    }
}

function showModal(isVictory) {
    var elModal = document.querySelector(".modal");
    if (isVictory) {
        elModal.innerHTML = '<h3>you won!</h3>';
    } else {
        elModal.innerHTML = '<h3>you lost!</h3>';
    }
    elModal.style.display = 'block';
}