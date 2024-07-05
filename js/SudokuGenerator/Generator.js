import { Board } from "./Board.js";
import { Utils } from "./Utils.js";
import { Solver } from "./Solver.js";

export class Generator {
    constructor() {
        this.board = new Board();
        this.board.initBoard();
        console.log('Generator constructor', this.board)
    }
    
    randomize (iterations) {
        // function randomizes an existing complete puzzle
        if (this.board.getUsedCells().length == 81) {
            for (let i = 0; i < iterations; ++i) {
                let swapType = Math.floor(Math.random() * 4);
                let block = Math.floor(Math.random() * 2) * 3;
                let piece1 = Math.floor(Math.random() * 3);
                let piece2 = Math.floor(Math.random() * 3);
                while(piece1 === piece2) {
                    piece2 = Math.floor(Math.random() * 3);
                }
                if (swapType == 0) {
                    this.board.swapRows(block + piece1, block + piece2)
                } else if (swapType == 1) {
                    this.board.swapCols(block + piece1, block + piece2)
                } else if (swapType == 2) {
                    this.board.swapStacks(piece1, piece2)
                } else if (swapType == 3) {
                    this.board.swapBands(piece1, piece2)
                }
            }
        }
    }

    reduceByLogical (cutoff = 81) {
        // method gets all possible values for a particular cell, 
        // if there is only one then we can remove that cell
        let cells = this.board.getUsedCells();
        Utils.shuffleArray(cells);
        for (let i = 0; i < cells.length; ++i) {
            if (this.board.getPossibles(cells[i]).length == 1) {
                cells[i].value = 0;
                --cutoff;
                if (cutoff == 0) {
                    break;
                }
            }

        }
    }

    reduceRandom (cutoff = 81) {
        // method attempts to remove a cell and checks that solution is still unique
        let tempBoard = this.board.copy();
        let usedCells = tempBoard.getUsedCells();
        let densitySet = [];
        for (let i = 0; i < usedCells.length; ++i) {
            densitySet.push(this.board.getDensity(usedCells[i]));
        }
        for (let i = 0; i < usedCells.length; ++i) {
            for (let j = 0; j < usedCells.length - 1; ++j) {
                if (densitySet[i] < densitySet[j]) {
                    let tmp = densitySet[i];
                    densitySet[i] = densitySet[j];
                    densitySet[j] = tmp;
                    tmp = usedCells[i];
                    usedCells[i] = usedCells[j];
                    usedCells[j] = tmp;
                }
            }
        }
        for (let i = 0; i < usedCells.length; ++i) {
            let original = usedCells[i].value;
            let complement = [];
            for (let x = 1; x < 10; ++x) {
                if (x != original) {
                    complement.push(x);
                }
            }
            let ambiguous = false;
            for (let j = 0; j < complement.length; ++j) {
                usedCells[i].value = j;
                let s = new Solver(tempBoard);
                if (s.solve() && s.isValid()) {
                    usedCells[i].value = original;
                    ambiguous = true;
                    break;
                }
            }
            if (!ambiguous) {
                usedCells[i].value = 0
                --cutoff;
            }
            if (cutoff == 0) {
                break;
            }
        }
    }
}