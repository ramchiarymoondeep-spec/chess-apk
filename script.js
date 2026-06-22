const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
let game = new Chess();
let selectedSquare = null;

const pieceUnicode = {
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
};

function drawBoard() {
    boardElement.innerHTML = '';
    const board = game.board();
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            const isLight = (r + c) % 2 === 0;
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            
            const col = String.fromCharCode(97 + c);
            const row = 8 - r;
            const squareId = `${col}${row}`;
            
            if (selectedSquare === squareId) square.classList.add('selected');

            const piece = board[r][c];
            if (piece) {
                const pType = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
                square.innerText = pieceUnicode[pType];
            }

            square.onclick = () => handleSquareClick(squareId);
            boardElement.appendChild(square);
        }
    }
    updateStatus();
}

function handleSquareClick(squareId) {
    if (game.game_over() || game.turn() === 'b') return; 

    if (selectedSquare) {
        const move = game.move({ from: selectedSquare, to: squareId, promotion: 'q' });
        if (move) {
            selectedSquare = null;
            drawBoard();
            window.setTimeout(makeAIMove, 500); 
        } else {
            const piece = game.get(squareId);
            selectedSquare = (piece && piece.color === 'w') ? squareId : null;
            drawBoard();
        }
    } else {
        const piece = game.get(squareId);
        if (piece && piece.color === 'w') {
            selectedSquare = squareId;
            drawBoard();
        }
    }
}

function makeAIMove() {
    if (game.game_over()) return;
    const moves = game.moves();
    if (moves.length === 0) return;

    const randomIdx = Math.floor(Math.random() * moves.length);
    game.move(moves[randomIdx]);
    drawBoard();
}

function updateStatus() {
    let status = game.turn() === 'w' ? 'Your Turn (White)' : 'AI is thinking...';
    if (game.in_checkmate()) status = `Checkmate! ${game.turn() === 'w' ? 'AI' : 'You'} Won!`;
    else if (game.in_draw()) status = 'Game Drawn!';
    else if (game.in_check()) status += ' (Check!)';
    statusElement.innerText = status;
}

function resetGame() {
    game.reset();
    selectedSquare = null;
    drawBoard();
}

drawBoard();
