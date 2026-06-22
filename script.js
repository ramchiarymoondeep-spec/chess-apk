const game = new Chess();
let selectedSquare = null;

const pieces = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
};

const pieceValues = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000 };

function evaluateBoard() {
    let score = 0;
    game.board().forEach(row => {
        row.forEach(sq => {
            if (sq) {
                let val = pieceValues[sq.type];
                score += (sq.color === 'b') ? val : -val;
            }
        });
    });
    return score;
}

function minimax(depth, isMaximizing) {
    if (depth === 0 || game.game_over()) return evaluateBoard();
    const moves = game.moves();
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let m of moves) {
            game.move(m);
            bestScore = Math.max(bestScore, minimax(depth - 1, false));
            game.undo();
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let m of moves) {
            game.move(m);
            bestScore = Math.min(bestScore, minimax(depth - 1, true));
            game.undo();
        }
        return bestScore;
    }
}

function makeAIMove() {
    if (game.game_over()) return;
    document.getElementById('status').innerText = "AI is thinking...";
    
    setTimeout(() => {
        const moves = game.moves();
        let bestMove = moves[Math.floor(Math.random() * moves.length)];
        let bestScore = -Infinity;

        for (let m of moves) {
            game.move(m);
            let score = minimax(1, false); // Depth 1 for performance on phone
            game.undo();
            if (score > bestScore) {
                bestScore = score;
                bestMove = m;
            }
        }
        game.move(bestMove);
        drawBoard();
        updateStatus();
    }, 200);
}

function squareClicked(square) {
    if (game.turn() === 'b' || game.game_over()) return;

    if (selectedSquare === square) {
        selectedSquare = null;
    } else if (selectedSquare) {
        const move = game.move({ from: selectedSquare, to: square, promotion: 'q' });
        selectedSquare = null;
        if (move) {
            drawBoard();
            if (!game.game_over()) makeAIMove();
        }
    } else {
        const piece = game.get(square);
        if (piece && piece.color === 'w') selectedSquare = square;
    }
    drawBoard();
    updateStatus();
}

function drawBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    
    for (let r = 8; r >= 1; r--) {
        for (let c = 0; c < 8; c++) {
            const squareName = cols[c] + r;
            const sq = document.createElement('div');
            sq.className = `square ${(r + c) % 2 === 0 ? 'dark' : 'light'}`;
            if (selectedSquare === squareName) sq.classList.add('selected');
            
            const piece = game.get(squareName);
            if (piece) {
                sq.innerText = pieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type];
            }
            sq.onclick = () => squareClicked(squareName);
            boardDiv.appendChild(sq);
        }
    }
}

function updateStatus() {
    let status = "Your Turn (White)";
    if (game.in_checkmate()) status = "Checkmate! Game Over.";
    else if (game.in_draw()) status = "Draw Game!";
    else if (game.in_check()) status = "Check!";
    document.getElementById('status').innerText = status;
}

function resetGame() {
    game.reset();
    selectedSquare = null;
    drawBoard();
    updateStatus();
}

drawBoard();
