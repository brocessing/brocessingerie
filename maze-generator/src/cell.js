// this class must stay agnostic
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.visited = false;
    this.flooded = false;
    this.walls = [true, true, true, true];
  }
}

module.exports = Cell;