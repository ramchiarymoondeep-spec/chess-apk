const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
let game = new Chess();
let selectedSquare = null;

const pieceUnicode = {
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
};

// AI Piece Values
const pieceValues = { 'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900 };

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
            // Give AI a tiny delay so it feels like it is "thinking"
            window.setTimeout(makeAIMove, 250); 
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

// AI Brain: Evaluates who is winning based on pieces left on the board
function evaluateBoard(gameInstance) {
    let total = 0;
    const board = gameInstance.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const val = pieceValues[piece.type];
                total += piece.color === 'w' ? val : -val;
            }
        }
    }
    return total;
}

// AI Brain: Looks ahead into the future to predict the best outcome
function minimax(gameInstance, depth, isMax) {
    if (depth === 0 || gameInstance.game_over()) return evaluateBoard(gameInstance);
    const moves = gameInstance.moves();
    
    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            gameInstance.move(moves[i]);
            best = Math.max(best, minimax(gameInstance, depth - 1, !isMax));
            gameInstance.undo();
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < moves.length; i++) {
            gameInstance.move(moves[i]);
            best = Math.min(best, minimax(gameInstance, depth - 1, !isMax));
            gameInstance.undo();
        }
        return best;
    }
}

function makeAIMove() {
    if (game.game_over()) return;
    let moves = game.moves();
    if (moves.length === 0) return;

    let bestMove = null;
    let bestValue = Infinity;

    // Shuffle moves slightly so the AI doesn't play the exact same game every time
    moves.sort(() => Math.random() - 0.5);

    for (let i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        // Depth 2: Looks 2 half-moves ahead. High enough to be smart, low enough to not freeze your phone!
        const boardValue = minimax(game, 2, true);
        game.undo();
        
        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = moves[i];
        }
    }

    if (!bestMove) bestMove = moves[0];
    game.move(bestMove);
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
