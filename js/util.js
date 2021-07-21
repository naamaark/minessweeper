function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomPos() {
    var size = gLevel.SIZE * gLevel.SIZE;
    var rand = getRandomInt(0, size);
    return gGame.minesPos.splice(rand,1);
}