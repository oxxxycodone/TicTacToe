const startScreen = document.querySelector("#startScreen");
const gameContainer = document.querySelector("#gameContainer");
const twoPlayerButton = document.querySelector("#twoPlayerButton");
const botButton = document.querySelector("#botButton");
const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#statusText");
const restartButton = document.querySelector("#restartButton");
const winLine = document.querySelector("#winLine");
const scoreXText = document.querySelector("#scoreX");
const scoreOText = document.querySelector("#scoreO");
const scoreDrawText = document.querySelector("#scoreDraw");

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
];

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = false;
let againstBot = false;
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

twoPlayerButton.addEventListener("click", () => {
    againstBot = false;
    startGame();
});

botButton.addEventListener("click", () => {
    againstBot = true;
    startGame();
});

function startGame() {
    startScreen.style.display = "none";
    gameContainer.style.display = "block";
    initializeGame();
}

function initializeGame() {
    cells.forEach((cell, index) => {
        cell.setAttribute("cellIndex", index);
        cell.addEventListener("click", cellClicked);
    });
    restartButton.addEventListener("click", restartGame);
    statusText.textContent = `${currentPlayer}'s turn`;
    running = true;
}

function cellClicked() {
    if (!running) return;

    const cellIndex = this.getAttribute("cellIndex");
    if (options[cellIndex] !== "") return;

    updateCell(this, cellIndex);
    checkWinner();

    if (againstBot && running) {
        setTimeout(botMove, 300);
    }
}

function updateCell(cell, index) {
    options[index] = currentPlayer;
    cell.textContent = currentPlayer;
}

function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${currentPlayer}'s turn`;
}

function checkWinner() {
    let roundWon = false;
    let winningCondition = null;

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (options[a] && options[a] === options[b] && options[a] === options[c]) {
            roundWon = true;
            winningCondition = condition;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `${currentPlayer} wins!`;
        running = false;
        drawWinLine(winningCondition);
        updateScore(currentPlayer);
    } else if (!options.includes("")) {
        statusText.textContent = "It's a draw!";
        running = false;
        updateScore("draw");
    } else {
        changePlayer();
    }
}

function drawWinLine(condition) {
    const [start, , end] = condition;
    const startCell = cells[start].getBoundingClientRect();
    const endCell = cells[end].getBoundingClientRect();
    const container = document.querySelector("#cellContainer").getBoundingClientRect();

    const startX = startCell.left + startCell.width / 2 - container.left;
    const startY = startCell.top + startCell.height / 2 - container.top;
    const endX = endCell.left + endCell.width / 2 - container.left;
    const endY = endCell.top + endCell.height / 2 - container.top;

    const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) + 40;
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

    winLine.style.width = `${length}px`;
    winLine.style.transform = `rotate(${angle}deg)`;
    winLine.style.left = `${startX}px`;
    winLine.style.top = `${startY - 2.5}px`;
    winLine.style.display = "block";
}

function restartGame() {
    options = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    running = true;
    cells.forEach(cell => cell.textContent = "");
    statusText.textContent = `${currentPlayer}'s turn`;
    winLine.style.display = "none";
}

function updateScore(winner) {
    if (winner === "X") {
        scoreX++;
        scoreXText.textContent = scoreX;
    } else if (winner === "O") {
        scoreO++;
        scoreOText.textContent = scoreO;
    } else {
        scoreDraw++;
        scoreDrawText.textContent = scoreDraw;
    }
}

function botMove() {
    if (!running) return; 

    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < options.length; i++) {
        if (options[i] === "") {
            options[i] = "O";
            let score = minimax(options, 0, false);
            options[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    if (move !== null) {
        updateCell(cells[move], move);
        checkWinner();
    }
}

function minimax(board, depth, isMaximizing) {
    const result = checkWinForAI(board);
    if (result !== null) return result === "X" ? -1 : result === "O" ? 1 : 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinForAI(board) {
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes("") ? null : "draw";
}