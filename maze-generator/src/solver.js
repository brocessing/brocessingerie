const Maze = require('./maze.js');
const Cell = require('./cell.js');

/*
 * Maze solving using a breadth-first search algorithm
 * @see https://en.wikipedia.org/wiki/Breadth-first_search
 */

 const
 TOP = 0,
 RIGHT = 1,
 BOTTOM = 2,
 LEFT = 3;

// this class must stay agnostic
class Solver {
  constructor(maze) {
    this.maze = maze;

    this.flood = [];
    this.flood.push(this.maze.start);
  }

  // -------------------------------------------------------------------------

  // walk through the maze until the solution is found
  solve() {
    while (!this.done) {
      this.done = this.step();
    }
    return this;
  }

  // walk through the maze, and return true if the solution is found
  step() {
    // start by flooding the maze using a breadth-first search strategy
    if (!this.solution) {
      let newFlood = [];
      for (let i = 0; i < this.flood.length; i++) {
        let cell = this.flood[i];
        cell.flooded = true;
        // if the flood reach the end of the maze, start the solution
        if (cell === this.maze.end) {
          this.solution = [];
          this.solution.push(cell);
          break;
        } else {
          // continue to flood
          let neighbors = this.findDirectNeighbors(cell, true)
          .map(function(c) {
            // a flooded cell now from which cell the flood came
            c.source = cell;
            return c;
          });
          newFlood = newFlood.concat(neighbors);
        }
      }
      this.flood = newFlood;
    } else {
      // back-propagate from the last flooded cell to the first one
      let cell = this.solution[this.solution.length - 1];
      // the prev flooded cell is the one from which the flood came
      if (cell.source) this.solution.push(cell.source);
      else if (cell === this.maze.start) {
        // done !
        this.solution.reverse();
        console.log('solved !');
        return true;
      }
    }
    return false;
  }

  // -------------------------------------------------------------------------

  // return an array of all neighbors for a given cell
  findDirectNeighbors(cell, filterFlooded = false) {
    let neighbors = [];
    for (let i = 0 ; i < 4; i++ ) {
      let wall = cell.walls[i];
      if (wall === false) {
        switch (i) {
          case TOP : {
            let neighbor = this.maze.cells[this.maze.index(cell.x + 0, cell.y - 1)];
            if (neighbor && (!filterFlooded || (filterFlooded && !neighbor.flooded))) neighbors.push(neighbor);
            break;
          }
          case RIGHT : {
            let neighbor = this.maze.cells[this.maze.index(cell.x + 1, cell.y + 0)];
            if (neighbor && (!filterFlooded || (filterFlooded && !neighbor.flooded))) neighbors.push(neighbor);
            break;
          }
          case BOTTOM : {
            let neighbor = this.maze.cells[this.maze.index(cell.x + 0, cell.y + 1)];
            if (neighbor && (!filterFlooded || (filterFlooded && !neighbor.flooded))) neighbors.push(neighbor);
            break;
          }
          case LEFT : {
            let neighbor = this.maze.cells[this.maze.index(cell.x - 1, cell.y + 0)];
            if (neighbor && (!filterFlooded || (filterFlooded && !neighbor.flooded))) neighbors.push(neighbor);
            break;
          }
        }
      }
    }
    return neighbors;
  }

}

module.exports = Solver;