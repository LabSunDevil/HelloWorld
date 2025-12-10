document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const restartBtn = document.getElementById('restart-btn');

    const game = new RenjuGame();

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let y = 0; y < game.size; y++) {
            for (let x = 0; x < game.size; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;

                // Add visual star points (15x15 board usually has star points at 3, 7, 11)
                // Coordinates are 0-indexed, so 3, 7, 11 become 3, 7, 11 (4th, 8th, 12th)
                if ((x === 3 || x === 11 || x === 7) && (y === 3 || y === 11 || y === 7)) {
                    const starPoint = document.createElement('div');
                    starPoint.style.width = '6px';
                    starPoint.style.height = '6px';
                    starPoint.style.backgroundColor = 'black';
                    starPoint.style.borderRadius = '50%';
                    starPoint.style.position = 'absolute';
                    starPoint.style.top = '12px';
                    starPoint.style.left = '12px';
                    cell.appendChild(starPoint);
                }

                if (game.board[y][x]) {
                    const stone = document.createElement('div');
                    stone.classList.add('stone', game.board[y][x]);
                    cell.appendChild(stone);
                }

                cell.addEventListener('click', () => handleCellClick(x, y));
                boardElement.appendChild(cell);
            }
        }
    }

    function handleCellClick(x, y) {
        if (game.gameOver) return;

        const result = game.play(x, y);
        if (result.success) {
            renderBoard();
            if (result.win) {
                statusElement.textContent = `Game Over! ${game.winner === 'black' ? 'Black' : 'White'} wins!`;
            } else {
                statusElement.textContent = `Current Turn: ${game.currentPlayer === 'black' ? 'Black' : 'White'}`;
            }
        } else {
            if (result.message) {
                alert(result.message);
            }
        }
    }

    restartBtn.addEventListener('click', () => {
        game.reset();
        renderBoard();
        statusElement.textContent = `Current Turn: Black`;
    });

    renderBoard();
});
