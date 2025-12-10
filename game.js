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
            // If the move creates 5 in a row, it is valid regardless of other forbidden patterns (except Overline which is not a win)
            // Wait, Overline is NOT a win for Black. Overline is forbidden.
            // But if I have 5 AND a Double Three, is it a win?
            // "If Black makes a forbidden move and attains five in a row at the same time, it will still be considered a win for Black."
            // So:
            // 1. Check if it makes exactly 5.
            // 2. Check if it makes Overline (>5). Overline supercedes 5?
            //    No, Overline means >5. Exactly 5 is NOT Overline.
            //    So if it makes exactly 5, it is a Win.
            //    If it makes >5, it is Overline (Forbidden).
            //    If it makes 5, we ignore Double Three/Four.

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

            // If valid and not win, keep the stone
            // But we already placed it. We need to check if game logic continues.
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
        // We only check Double Three and Double Four here.
        // Overline is checked in checkWinCondition logic (kind of).
        // Actually, we should check Overline here too if checkWinCondition didn't catch it?
        // But the play() method handles Overline via checkWinCondition return value.
        // So here we focus on 3-3 and 4-4.

        let fourCount = 0;
        let threeCount = 0;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        for (let [dx, dy] of directions) {
            if (this.isFour(x, y, dx, dy)) {
                fourCount++;
            }
            // A line cannot be both Four and Three (Four is "stronger", we usually count it as Four)
            // But we must be careful.
            // If isFour returns true, do we check isThree?
            // Usually if it's a Four, it's not a Three.
            else if (this.isOpenThree(x, y, dx, dy)) {
                threeCount++;
            }
        }

        if (fourCount >= 2) return "Double Four";
        if (threeCount >= 2) return "Double Three";
        return null;
    }

    // Check if the line creates a "Four" (can become 5)
    isFour(x, y, dx, dy) {
        // We need to check if we can add a black stone to make it exactly 5.
        // Get the line pattern centered at x,y
        const line = this.getLinePattern(x, y, dx, dy);
        // line is an array of chars: 'B', 'W', 'E' (Empty), 'S' (Self/Current Stone)
        // actually easier to just use 'B', 'W', ' ' and treat x,y as 'B'.

        // We simulate adding a stone at every empty spot.
        for (let i = 0; i < line.length; i++) {
            if (line[i].val === null) { // Empty
                // Temporarily fill
                line[i].val = 'black';
                if (this.checkPatternHasFive(line)) {
                    // Check if the Five involves our original stone?
                    // line[i] is the *added* stone.
                    // The original stone is at the center of the line array.
                    // We need to ensure the 5-in-a-row includes the original stone index.
                    // Implementation detail of checkPatternHasFive needs to verify this.
                    return true;
                }
                line[i].val = null;
            }
        }
        return false;
    }

    // Check if the line creates an "Open Three" (can become Straight Four)
    isOpenThree(x, y, dx, dy) {
        const line = this.getLinePattern(x, y, dx, dy);

        for (let i = 0; i < line.length; i++) {
            if (line[i].val === null) {
                line[i].val = 'black';
                if (this.checkPatternHasStraightFour(line)) {
                    return true;
                }
                line[i].val = null;
            }
        }
        return false;
    }

    getLinePattern(x, y, dx, dy) {
        // Get a range of stones. Range of +/- 5 is enough?
        // 5 stones + gap + 1 stone... maybe +/- 6.
        const range = 6;
        const line = [];

        for (let i = -range; i <= range; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                line.push({
                    val: this.board[ny][nx],
                    isCenter: i === 0
                });
            } else {
                line.push({ val: 'edge', isCenter: false }); // Treat boundary as edge
            }
        }
        return line;
    }

    checkPatternHasFive(line) {
        // Check for exactly 5 consecutive blacks.
        // MUST include the center stone (where isCenter is true).
        // MUST NOT be more than 5 (Overline).

        let consecutive = 0;
        let hasFive = false;

        // Since we want to ensure it is *exactly* 5, we scan.
        // And we must ensure the group of 5 includes the center.

        // Find all groups of black stones
        for (let i = 0; i < line.length; i++) {
            if (line[i].val === 'black') {
                consecutive++;
            } else {
                if (consecutive === 5) {
                    // Check if this group included the center
                    // The group ended at i-1. Started at i-5.
                    // Range: [i-5, i-1].
                    // Check if any node in this range has isCenter=true
                    if (this.groupHasCenter(line, i - 5, i - 1)) return true;
                }
                consecutive = 0;
            }
        }
        // End of line check
        if (consecutive === 5) {
            if (this.groupHasCenter(line, line.length - 5, line.length - 1)) return true;
        }

        return false;
    }

    groupHasCenter(line, start, end) {
        for (let k = start; k <= end; k++) {
            if (line[k].isCenter) return true;
        }
        return false;
    }

    checkPatternHasStraightFour(line) {
        // Straight Four: Empty, Black, Black, Black, Black, Empty
        // Pattern: E B B B B E
        // Must include center.

        if (line.length < 6) return false;

        for (let i = 0; i <= line.length - 6; i++) {
            // Check for pattern [null, black, black, black, black, null]
            // null or null-like? 'edge' blocks it.
            // So strictly null.
            if (line[i].val === null &&
                line[i+1].val === 'black' &&
                line[i+2].val === 'black' &&
                line[i+3].val === 'black' &&
                line[i+4].val === 'black' &&
                line[i+5].val === null) {

                // Check center inclusion
                if (this.groupHasCenter(line, i+1, i+4)) return true;
            }
        }
        return false;
    }
}
