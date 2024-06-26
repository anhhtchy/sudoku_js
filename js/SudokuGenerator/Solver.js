export class Solver {
    constructor (board) {
        this.board = board.copy();
        this.vacants = this.board.getUsedCells();
    }
    
    isValid() {
        for (let i = 0; i < this.board.boxes.length; ++i) {
            let boxSet = new Set(this.board.boxes[i].map(c => c.value));
            if (boxSet.size != 9) {
                return false;
            }
        }
        
        for (let i = 0; i < this.board.rows.length; ++i) {
            let rowSet = new Set(this.board.rows[i].map(c => c.value));
            if (rowSet.size != 9) {
                return false;
            }
        }

        for (let i = 0; i < this.board.cols.length; ++i) {
            let colSet = new Set(this.board.cols[i].map(c => c.value));
            if (colSet.size != 9) {
                return false;
            }
        }
        return true;
    }
    
    solve() {
        let index = 0;
        while (-1 < index && index < this.vacants.length) {
            let current = this.vacants[index];
            let flag = false;
            for (let x = current.value + 1; x < 10; ++x) {
                if (this.board.getPossibles(current).findIndex(e => e == x) > -1) {
                    current.value = x;
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                current.value = 0;
                --index;
            } else {
                ++index;
            }
        }
        if (this.vacants.length == 0) {
            return false;
        } else {
            return index == this.vacants.length;
        }
    }
}    
