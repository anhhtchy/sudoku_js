import { Cell } from "./Cell.js";

export class Board {
    constructor() {
        this.rows = {};
        this.cols = {};
        this.boxes = {};
        this.cells = [];
        
        for (let row = 0; row < 9; ++row) {
            for (let col = 0; col < 9; ++col) {
                let box = 3 * Math.floor(row / 3) + Math.floor(col / 3);
                let number = col / 1 + 1 + (row * 3) + Math.floor(row / 3) % 3;
                if (number > 9) { 
                    number = number % 9;
                } else if (number == 0) {
                    number = 9;
                }
                let cell = new Cell(row, col, box, number);
                if (!(row in this.rows)) {
                    this.rows[row] = [];
                }
                if (!(col in this.cols)) {
                    this.cols[col] = [];
                }
                if (!(box in this.boxes)) {
                    this.boxes[box] = [];
                }
                this.rows[row].push(cell);
                this.cols[col].push(cell);
                this.boxes[box].push(cell);
                this.cells.push(cell);
            }
        }
        console.log('Board constructor', this.rows)
    }

    getUsedCells() {
        return this.cells.filter(c => c.value != 0);
    }

    getUnusedCells() {
        return this.cells.filter(c => c.value == 0);
    }

    swapRows(i1, i2, allow = false) {
        if (allow || Math.floor(i1 / 3) == Math.floor(i2 / 3)) {
            for (let i = 0; i < this.rows[i2].length; ++i) {
                let tmp = this.rows[i1][i].value;
                this.rows[i1][i].value = this.rows[i2][i].value;
                this.rows[i2][i].value = tmp;
            }
        }
    }

    swapCols(i1, i2, allow = false) {
        if (allow || Math.floor(i1 / 3) == Math.floor(i2 / 3)) {
            for (let i = 0; i < this.rows[i2].length; ++i) {
                let tmp = this.cols[i1][i].value;
                this.cols[i1][i].value = this.cols[i2][i].value;
                this.cols[i2][i].value = tmp;
            }
        }
    }

    swapStacks(i1, i2) {
        for (let i = 0; i < 3; ++i) {
            this.swapCols(i1 * 3 + i, i2 * 3 + i, true);
        }
    }

    swapBands(i1, i2) {
        for (let i = 0; i < 3; ++i) {
            this.swapRows(i1 * 3 + i, i2 * 3 + i, true);
        }
    }

    getPossibles(cell) {
        // returning all possible values that could be assigned to the cell provided as argument
        let possibilities = this.rows[cell.row].concat(this.cols[cell.col], this.boxes[cell.box]);
        possibilities = possibilities.filter(e => e.value != 0 && e.value != cell.value);
        let results = [];
        for (let i = 1; i < 10; ++i) {
            if (possibilities.findIndex(e => e.value == i) == -1) {
                results.push(i);
            }
        }
        return results;
    }

    getDensity(cell) {
        // calculates the density of a specific cell's context
        let possibilities = this.rows[cell.row].concat(this.cols[cell.col], this.boxes[cell.box]);
        possibilities = possibilities.filter(c => c.value != 0).map(c => c.value);
        if (cell.value != 0) {
            let cellIdx = possibilities.indexOf(cell.value);
            if (cellIdx > -1) {
                possibilities.splice(cellIdx, 1);
            }
        }
        let possibilitiesSet = new Set(possibilities);
        return possibilitiesSet.size / 20;
    }

    copy() {
        let board = new Board();
        for (let row = 0; row < 9; ++row) {
            for (let col = 0; col < 9; ++col) {
                let box = 3 * Math.floor(row / 3) + Math.floor(col / 3);
                let number = this.rows[row][col].value;
                let cell = new Cell(row, col, box, number);
                if (!(row in board.rows)) {
                    board.rows[row] = [];
                }
                if (!(col in board.cols)) {
                    board.cols[col] = [];
                }
                if (!(box in board.boxes)) {
                    board.boxes[box] = [];
                }
                board.rows[row].push(cell);
                board.cols[col].push(cell);
                board.boxes[box].push(cell);
                board.cells.push(cell);
            }
        }
        return board;
    }

    getMatrix() {
        let matrix = [];
        for (let row = 0; row < 9; ++row) {
            matrix.push([]);
            for (let col = 0; col < 9; ++col) {
                matrix[row].push(this.rows[row][col].value);
            }
        }
        return matrix;
    }
}