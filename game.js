// Placeholder for game logic
class RenjuGame {
    constructor() {
        this.size = 15;
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.currentPlayer = 'black'; // Black plays first
        this.gameOver = false;
        this.winner = null;
    }

    reset() {
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.winner = null;
    }

    play(x, y) {
        if (this.gameOver) return { success: false, message: "Game over" };
        if (this.board[y][x]) return { success: false, message: "Occupied" };

        // Check for forbidden moves if current player is Black
        if (this.currentPlayer === 'black') {
            // Temporarily place the stone to check for forbidden moves
            this.board[y][x] = 'black';

            // Check for immediate win (Exactly 5)
            const winStatus = this.checkWinCondition(x, y, 'black');
            if (winStatus === 'win') {
                // It is a win, so we keep the stone and end game
                this.gameOver = true;
                this.winner = 'black';
                return { success: true, win: true };
            } else if (winStatus === 'overline') {
                this.board[y][x] = null;
                return { success: false, message: "Forbidden move: Overline" };
            }

            // Not a win, check other forbidden moves
            const forbidden = this.checkForbiddenPatterns(x, y);
            if (forbidden) {
                this.board[y][x] = null;
                return { success: false, message: `Forbidden move: ${forbidden}` };
            }
        } else {
            this.board[y][x] = 'white';
             // Check for win for White
            const winStatus = this.checkWinCondition(x, y, 'white');
            if (winStatus === 'win') {
                this.gameOver = true;
                this.winner = 'white';
                return { success: true, win: true };
            }
        }

        // Toggle player
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        return { success: true, win: false };
    }

    checkWinCondition(x, y, color) {
        // Check all directions
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        let maxCount = 0;

        for (let [dx, dy] of directions) {
            const count = this.countConsecutive(x, y, dx, dy, color);
            if (count > maxCount) maxCount = count;
        }

        if (color === 'black') {
            if (maxCount === 5) return 'win';
            if (maxCount > 5) return 'overline';
            return 'none';
        } else {
            if (maxCount >= 5) return 'win';
            return 'none';
        }
    }

    countConsecutive(x, y, dx, dy, color) {
        let count = 1;
        // Forward
        let i = 1;
        while (true) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) break;
            if (this.board[ny][nx] === color) count++;
            else break;
            i++;
        }
        // Backward
        i = 1;
        while (true) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) break;
            if (this.board[ny][nx] === color) count++;
            else break;
            i++;
        }
        return count;
    }

    checkForbiddenPatterns(x, y) {
        // This is called with the stone temporarily placed at x,y
        let fourCount = 0;
        let threeCount = 0;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        for (let [dx, dy] of directions) {
            // Optimization: Get line pattern once per direction
            const line = this.getLinePattern(x, y, dx, dy);

            if (this.isFour(line)) {
                fourCount++;
            }
            else if (this.isOpenThree(line)) {
                threeCount++;
            }
        }

        if (fourCount >= 2) return "Double Four";
        if (threeCount >= 2) return "Double Three";
        return null;
    }

    // Check if the line creates a "Four" (can become 5)
    isFour(line) {
        // We simulate adding a stone at every empty spot.
        for (let i = 0; i < line.length; i++) {
            if (line[i] === null) { // Empty
                // Temporarily fill
                line[i] = 'black';
                if (this.checkPatternHasFive(line)) {
                    line[i] = null; // Restore before returning
                    return true;
                }
                line[i] = null; // Revert
            }
        }
        return false;
    }

    // Check if the line creates an "Open Three" (can become Straight Four)
    isOpenThree(line) {
        for (let i = 0; i < line.length; i++) {
            if (line[i] === null) {
                line[i] = 'black';
                if (this.checkPatternHasStraightFour(line)) {
                    line[i] = null; // Restore (good practice even if false returned later)
                    return true;
                }
                line[i] = null;
            }
        }
        return false;
    }

    getLinePattern(x, y, dx, dy) {
        const range = 6;
        const line = [];

        for (let i = -range; i <= range; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                line.push(this.board[ny][nx]);
            } else {
                line.push('edge'); // Treat boundary as edge
            }
        }
        return line;
    }

    checkPatternHasFive(line) {
        let consecutive = 0;
        // Center index is 6 (since range is 6)
        const centerIndex = 6;

        for (let i = 0; i < line.length; i++) {
            if (line[i] === 'black') {
                consecutive++;
            } else {
                if (consecutive === 5) {
                    // Check if this group included the center
                    // Group range: [i-5, i-1]
                    if (i - 5 <= centerIndex && i - 1 >= centerIndex) return true;
                }
                consecutive = 0;
            }
        }
        // End of line check
        if (consecutive === 5) {
            if (line.length - 5 <= centerIndex && line.length - 1 >= centerIndex) return true;
        }

        return false;
    }

    checkPatternHasStraightFour(line) {
        // Straight Four: Empty, Black, Black, Black, Black, Empty
        // Pattern: E B B B B E
        const centerIndex = 6;

        if (line.length < 6) return false;

        for (let i = 0; i <= line.length - 6; i++) {
            if (line[i] === null &&
                line[i+1] === 'black' &&
                line[i+2] === 'black' &&
                line[i+3] === 'black' &&
                line[i+4] === 'black' &&
                line[i+5] === null) {

                // Check center inclusion. Stones are at [i+1, i+4]
                if (i + 1 <= centerIndex && i + 4 >= centerIndex) return true;
            }
        }
        return false;
    }
}
