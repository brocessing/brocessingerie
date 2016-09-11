const Cell = require('./cell.js');

/*
 * Maze generation using depth first search hunt & kill algorithm
 * inspired by Daniel Shiffman
 * @see http://weblog.jamisbuck.org/2011/1/24/maze-generation-hunt-and-kill-algorithm
 * @see http://www.astrolog.org/labyrnth/algrithm.htm
 */

const
  TOP = 0,
  RIGHT = 1,
  BOTTOM = 2,
  LEFT = 3;

// this class must stay agnostic
class Maze {
  constructor(cols, rows, i = -1, j = -1) {
    this.cols = cols;
    this.rows = rows;
    this.cells = this.populate();

    i = (i === undefined) ? Math.floor(Math.random() * cols) : Math.max(0, Math.min(i, cols - 1));
    j = (j === undefined) ? Math.floor(Math.random() * rows) : Math.max(0, Math.min(j, rows - 1));
    this.start = this.cells[this.index(i, j)]

    this.currentCell = this.start;
    this.currentCell.visited = true;
  }

  // create a 1-dimensionnal array of position-aware cells
  populate() {
    let cells = [];
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        cells.push(new Cell(i, j));
      }
    }
    return cells;
  }

  // -------------------------------------------------------------------------

  // walk through the maze until completely generated
  generate() {
    let solved = false;
    while (!solved) {
      solved = this.step();
    }
    return this;
  }

  // walk through the maze, and return true if solved
  step() {
    if (this.currentCell) {
      // mark the current cell as visited
      this.currentCell.visited = true;
      // find the unvisited neighbors around the current cell
      let neighbors = this.findNeighbors(this.currentCell, true);
      if (neighbors.length > 0) {
        // dig through the wall to a random unvisited neighbor
        let neighbor = this.random(neighbors);
        this.currentCell = this.dig(this.currentCell, neighbor);
      } else {
        // if all neighbors are visited, go hunt a new cell
        let hunted = this.hunt(this.cells);
        // if the hunt is a success, dig between the cell and its visited neighbor
        if (hunted) {
          this.currentCell = this.dig(hunted.neighbor, hunted.cell);
        } else {
          // if the hunt isn't a success, then the maze is done
          this.end = this.currentCell;
          this.currentCell = null;
          console.log('maze created !');
        }
      }
      return false;
    } else {
      return true;
    }
  }

  // find the first unvisited cell with a visited neihgbor
  hunt(cells) {
    if (cells.length > 0) {
      for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        if (!cell.visited) {
          let neighbors = this.findNeighbors(cell);
          for (let j = 0; j < neighbors.length; j++) {
            let neighbor = neighbors[j];
            if (neighbor.visited) return { cell: cell, neighbor: neighbor };
          }
        }
      }
    } else {
      return null;
    }
  }

  // -------------------------------------------------------------------------

  // return a random cell from an array of cells
  // if a bias must be implemented, do it here
  random(cells) {
    // this.i = this.i + .1 || 1;
    // return cells[Math.sin(this.i) > 0 ? 0 : cells.length-1];
    // return cells[Math.floor(Math.abs(Math.sin(Math.cos(this.i))) * cells.length)];
    return cells[Math.floor(Math.random() * cells.length)];
  }

  // convert a (i,j) position to a 1-dimensionnal array index
  index(i, j) {
    if (i < 0 || i > this.cols - 1 || j < 0 || j > this.rows - 1) return -1;
    else return i + j * this.cols;
  }

  // -------------------------------------------------------------------------

  // move from source and return target, while carving walls
  dig(source, target) {
    if (source && target) {
      let dx = target.x - source.x;
      let dy = target.y - source.y;
      if (dx > 0) {
        source.walls[RIGHT] = false;
        target.walls[LEFT] = false;
      } else if (dx < 0) {
        source.walls[LEFT] = false;
        target.walls[RIGHT] = false;
      }

      if (dy > 0) {
        source.walls[BOTTOM] = false;
        target.walls[TOP] = false;
      } else if (dy < 0) {
        source.walls[TOP] = false;
        target.walls[BOTTOM] = false;
      }

    }
    return target;
  }

  // return an array of all neighbors for a given cell
  findNeighbors(cell, filterVisited = false) {
    let neighbors = [];
    for (let i = 0; i < 4; i++) {
      switch (i) {
        case TOP : {
          let neighbor = this.cells[this.index(cell.x + 0, cell.y - 1)];
          if (neighbor && (!filterVisited || (filterVisited && !neighbor.visited))) neighbors.push(neighbor);
          break;
        }
        case RIGHT : {
          let neighbor = this.cells[this.index(cell.x + 1, cell.y + 0)];
          if (neighbor && (!filterVisited || (filterVisited && !neighbor.visited))) neighbors.push(neighbor);
          break;
        }
        case BOTTOM : {
          let neighbor = this.cells[this.index(cell.x + 0, cell.y + 1)];
          if (neighbor && (!filterVisited || (filterVisited && !neighbor.visited))) neighbors.push(neighbor);
          break;
        }
        case LEFT : {
          let neighbor = this.cells[this.index(cell.x - 1, cell.y + 0)];
          if (neighbor && (!filterVisited || (filterVisited && !neighbor.visited))) neighbors.push(neighbor);
          break;
        }
      }
    }
    return neighbors;
  }

}

module.exports = Maze;