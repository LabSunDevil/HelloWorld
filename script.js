document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const restartBtn = document.getElementById('restart-btn');

    const game = new RenjuGame();
    let lastFocusedCoords = null;

    function renderBoard() {
        // Capture currently focused cell coordinates before clearing board
        const activeEl = document.activeElement;
        if (activeEl && activeEl.classList.contains('cell')) {
            lastFocusedCoords = { x: activeEl.dataset.x, y: activeEl.dataset.y };
        }

        boardElement.innerHTML = '';
        // Set board role for accessibility
        boardElement.setAttribute('role', 'grid');
        boardElement.setAttribute('aria-label', 'Game Board');

        for (let y = 0; y < game.size; y++) {
            for (let x = 0; x < game.size; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;

                // Accessibility attributes
                cell.setAttribute('tabindex', '0');
                cell.setAttribute('role', 'gridcell');

                const cellState = game.board[y][x] ? `${game.board[y][x]} stone` : 'empty';
                cell.setAttribute('aria-label', `Row ${y + 1}, Column ${x + 1}, ${cellState}`);

                // Add visual star points (15x15 board usually has star points at 3, 7, 11)
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

                // Keyboard support
                cell.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault(); // Prevent scrolling for space
                        handleCellClick(x, y);
                    }
                });

                boardElement.appendChild(cell);
            }
        }

        // Restore focus if we had it
        if (lastFocusedCoords) {
            const cellToFocus = boardElement.querySelector(`.cell[data-x="${lastFocusedCoords.x}"][data-y="${lastFocusedCoords.y}"]`);
            if (cellToFocus) {
                cellToFocus.focus();
            }
        }
    }

    function handleCellClick(x, y) {
        if (game.gameOver) return;

        const result = game.play(x, y);
        if (result.success) {
            // Update stored focus to the cell that was just played on (or keep it if it was the one clicked/keyed)
            // Actually, renderBoard captures focus at the start, but if we just clicked, focus might be on body or the cell.
            // If we used keyboard, focus is on the cell.
            // If we clicked with mouse, the cell gets focus.
            // So relying on renderBoard's capture is generally correct,
            // BUT if we click, the cell might lose focus during the re-render if we don't ensure it was focused first?
            // Browsers usually focus on click.

            // Explicitly setting lastFocusedCoords here ensures that if the user clicked,
            // and the re-render happens, focus returns to that cell.
            lastFocusedCoords = { x, y };

            renderBoard();
            if (result.win) {
                statusElement.textContent = `Game Over! ${game.winner === 'black' ? 'Black' : 'White'} wins!`;
                // Add role="alert" to status for screen readers to announce game over immediately
                statusElement.setAttribute('role', 'alert');
            } else {
                statusElement.textContent = `Current Turn: ${game.currentPlayer === 'black' ? 'Black' : 'White'}`;
                statusElement.removeAttribute('role');
            }
        } else {
            if (result.message) {
                alert(result.message);
            }
        }
    }

    restartBtn.addEventListener('click', () => {
        game.reset();
        lastFocusedCoords = null; // Reset focus memory
        renderBoard();
        statusElement.textContent = `Current Turn: Black`;
        statusElement.removeAttribute('role');
    });

    renderBoard();
});
