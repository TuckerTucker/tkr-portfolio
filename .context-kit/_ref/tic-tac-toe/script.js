// Game State
const gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameActive: true,
    winner: null
};

// Winning combinations
const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6]  // Diagonal top-right to bottom-left
];

// DOM elements
const gameBoard = document.getElementById('gameBoard');
const gameMessage = document.getElementById('gameMessage');
const playAgainBtn = document.getElementById('playAgainBtn');

// Initialize and render the board
function initializeBoard() {
    gameBoard.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.dataset.index = i;
        square.addEventListener('click', handleSquareClick);
        gameBoard.appendChild(square);
    }
}

// Handle square click
function handleSquareClick(event) {
    const index = parseInt(event.target.dataset.index);

    if (!gameState.gameActive || gameState.board[index] !== null) {
        return;
    }

    makeMove(index);
}

// Make a move
function makeMove(index) {
    gameState.board[index] = gameState.currentPlayer;
    updateSquare(index);

    if (checkWinner()) {
        gameState.winner = gameState.currentPlayer;
        gameState.gameActive = false;
        showMessage(`Player ${gameState.currentPlayer} Wins!`);
        showPlayAgainButton();
        return;
    }

    if (checkDraw()) {
        gameState.winner = 'draw';
        gameState.gameActive = false;
        showMessage("It's a Draw!");
        showPlayAgainButton();
        return;
    }

    switchPlayer();
    showMessage(`Player ${gameState.currentPlayer}'s Turn`);
}

// Update square display
function updateSquare(index) {
    const squares = document.querySelectorAll('.square');
    const square = squares[index];
    square.textContent = gameState.currentPlayer;
    square.classList.add('filled');
    square.classList.add(gameState.currentPlayer.toLowerCase());
}

// Check for winner
function checkWinner() {
    return winningCombinations.some(combination => {
        const [a, b, c] = combination;
        return gameState.board[a] !== null &&
               gameState.board[a] === gameState.board[b] &&
               gameState.board[a] === gameState.board[c];
    });
}

// Check for draw
function checkDraw() {
    return gameState.board.every(cell => cell !== null) && !checkWinner();
}

// Switch player
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
}

// Show message
function showMessage(message) {
    gameMessage.textContent = message;
}

// Show Play Again button
function showPlayAgainButton() {
    playAgainBtn.style.display = 'block';
}

// Reset game
function resetGame() {
    gameState.board = Array(9).fill(null);
    gameState.currentPlayer = 'X';
    gameState.gameActive = true;
    gameState.winner = null;

    showMessage(`Player ${gameState.currentPlayer}'s Turn`);
    playAgainBtn.style.display = 'none';

    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.textContent = '';
        square.classList.remove('filled', 'x', 'o');
    });
}

// Event listeners
playAgainBtn.addEventListener('click', resetGame);

// Initialize the game on page load
initializeBoard();
showMessage(`Player ${gameState.currentPlayer}'s Turn`);