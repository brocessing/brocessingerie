(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// EXAMPLE
var maze = require('./../index.js');

var canvas = window.document.createElement('canvas');
canvas.width = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) - 50;
canvas.height = canvas.width;
canvas.style.width = canvas.width + 'px';
canvas.style.height = canvas.height + 'px';
window.document.body.appendChild(canvas);

maze.generate(50, 50);
maze.update(canvas);

window.addEventListener('click', function () {
  maze.generate(50, 50);
  maze.update(canvas);
});

// -------------------------------------------------------------------------

window.requestAnimFrame = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
}();

window.loop = function () {
  if (maze !== undefined) {
    requestAnimFrame(loop);
    maze.update(canvas);
  }
};

window.loop();
window.noLoop = function () {
  loop = null;
};

},{"./../index.js":2}],2:[function(require,module,exports){
'use strict';

var maze = require('./src/index.js');
module.exports = maze;

},{"./src/index.js":4}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// this class must stay agnostic
var Cell = function Cell(x, y) {
  _classCallCheck(this, Cell);

  this.x = x;
  this.y = y;
  this.visited = false;
  this.walls = [true, true, true, true];
};

module.exports = Cell;

},{}],4:[function(require,module,exports){
'use strict';

var Maze = require('./maze.js');
var Cell = require('./cell.js');

var maze = void 0;
function generate(c, r) {
  var i = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];
  var j = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];

  maze = new Maze(c, r, i, j);
}

function update(canvas) {
  // maze
  for (var i = 0; i < 2; i++) {
    maze.step();
  }display(canvas);
}

function display(canvas) {
  var ctx = canvas.getContext('2d');
  var margin = 10;
  var w = (canvas.width - margin * 2) / maze.cols;
  var h = (canvas.height - margin * 2) / maze.rows;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  for (var i = 0; i < maze.cells.length; i++) {
    var cell = maze.cells[i];

    // fill cells
    if (cell === maze.start || cell == maze.end) {
      ctx.fillStyle = 'red';
      ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
    } else if (cell === maze.currentCell) {
      ctx.fillStyle = 'yellow';
      ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
    } else if (!cell.visited) {
      ctx.fillStyle = 'black';
      ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
    }

    // draw walls
    for (var j = 0; j < cell.walls.length; j++) {
      if (cell.walls[j]) {
        switch (j) {
          case 0:
            ctx.moveTo(margin + (cell.x + 0) * w, margin + (cell.y + 0) * h);
            ctx.lineTo(margin + (cell.x + 1) * w, margin + (cell.y + 0) * h);
            break;
          case 1:
            ctx.moveTo(margin + (cell.x + 1) * w, margin + (cell.y + 0) * h);
            ctx.lineTo(margin + (cell.x + 1) * w, margin + (cell.y + 1) * h);
            break;
          case 2:
            ctx.moveTo(margin + (cell.x + 1) * w, margin + (cell.y + 1) * h);
            ctx.lineTo(margin + (cell.x + 0) * w, margin + (cell.y + 1) * h);
            break;
          case 3:
            ctx.moveTo(margin + (cell.x + 0) * w, margin + (cell.y + 1) * h);
            ctx.lineTo(margin + (cell.x + 0) * w, margin + (cell.y + 0) * h);
            break;
        }
      }
    }
  }
  ctx.stroke();
}

module.exports = {
  update: update,
  generate: generate
};

},{"./cell.js":3,"./maze.js":5}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cell = require('./cell.js');

/*
 * Maze generation using depth first search hunt & kill algorithm
 * inspired by Daniel Shiffman
 * @see http://weblog.jamisbuck.org/2011/1/24/maze-generation-hunt-and-kill-algorithm
 * @see http://www.astrolog.org/labyrnth/algrithm.htm
 */

var TOP = 0,
    RIGHT = 1,
    BOTTOM = 2,
    LEFT = 3;

// this class must stay agnostic

var Maze = function () {
  function Maze(cols, rows) {
    var i = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];
    var j = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];

    _classCallCheck(this, Maze);

    this.cols = cols;
    this.rows = rows;
    this.cells = this.populate();
    if (i !== undefined && j !== undefined) {
      i = Math.max(0, Math.min(i, this.cols - 1));
      j = Math.max(0, Math.min(i, this.rows - 1));
      this.start = this.cells[this.index(i, j)];
    } else this.start = this.random(this.cells);
    this.currentCell = this.start;
    this.currentCell.visited = true;
  }

  // create a 1-dimensionnal array of position-aware cells


  _createClass(Maze, [{
    key: 'populate',
    value: function populate() {
      var cells = [];
      for (var j = 0; j < this.rows; j++) {
        for (var i = 0; i < this.cols; i++) {
          cells.push(new Cell(i, j));
        }
      }
      return cells;
    }

    // -------------------------------------------------------------------------

    // walk through the maze until solved

  }, {
    key: 'solve',
    value: function solve() {
      var solved = false;
      while (!solved) {
        solved = this.step();
      }
    }

    // walk through the maze, and return true if solved

  }, {
    key: 'step',
    value: function step() {
      if (this.currentCell) {
        // mark the current cell as visited
        this.currentCell.visited = true;
        // find the unvisited neighbors around the current cell
        var neighbors = this.findNeighbors(this.currentCell, true);
        if (neighbors.length > 0) {
          // dig through the wall to a random unvisited neighbor
          var neighbor = this.random(neighbors);
          this.currentCell = this.dig(this.currentCell, neighbor);
        } else {
          // if all neighbors are visited, go hunt a new cell
          var hunted = this.hunt(this.cells);
          // if the hunt is a success, dig between the cell and its visited neighbor
          if (hunted) {
            this.currentCell = this.dig(hunted.neighbor, hunted.cell);
          } else {
            // if the hunt isn't a success, then the maze is done
            this.end = this.currentCell;
            this.currentCell = null;
            console.log('done !');
          }
        }
        return false;
      } else {
        return true;
      }
    }

    // find the first unvisited cell with a visited neihgbor

  }, {
    key: 'hunt',
    value: function hunt(cells) {
      if (cells.length > 0) {
        for (var i = 0; i < cells.length; i++) {
          var cell = cells[i];
          if (!cell.visited) {
            var neighbors = this.findNeighbors(cell);
            for (var j = 0; j < neighbors.length; j++) {
              var neighbor = neighbors[j];
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

  }, {
    key: 'random',
    value: function random(cells) {
      this.i = this.i + .7 || 1;
      // return cells[Math.floor(Math.abs(Math.sin(Math.cos(this.i))) * cells.length)];
      // return cells[Math.floor(Math.random() * cells.length)];
      return cells[Math.sin(this.i) > 0 ? 0 : cells.length - 1];
    }

    // convert a (i,j) position to a 1-dimensionnal array index

  }, {
    key: 'index',
    value: function index(i, j) {
      if (i < 0 || i > this.cols - 1 || j < 0 || j > this.rows - 1) return -1;else return i + j * this.cols;
    }

    // -------------------------------------------------------------------------

    // move from source and return target, while carving walls

  }, {
    key: 'dig',
    value: function dig(source, target) {
      if (source && target) {
        var dx = target.x - source.x;
        var dy = target.y - source.y;
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

  }, {
    key: 'findNeighbors',
    value: function findNeighbors(cell) {
      var filterVisited = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var neighbors = [];
      for (var i = 0; i < 4; i++) {
        switch (i) {
          case TOP:
            {
              var neighbor = this.cells[this.index(cell.x + 0, cell.y - 1)];
              if (neighbor && (!filterVisited || filterVisited && !neighbor.visited)) neighbors.push(neighbor);
              break;
            }
          case RIGHT:
            {
              var _neighbor = this.cells[this.index(cell.x + 1, cell.y + 0)];
              if (_neighbor && (!filterVisited || filterVisited && !_neighbor.visited)) neighbors.push(_neighbor);
              break;
            }
          case BOTTOM:
            {
              var _neighbor2 = this.cells[this.index(cell.x + 0, cell.y + 1)];
              if (_neighbor2 && (!filterVisited || filterVisited && !_neighbor2.visited)) neighbors.push(_neighbor2);
              break;
            }
          case LEFT:
            {
              var _neighbor3 = this.cells[this.index(cell.x - 1, cell.y + 0)];
              if (_neighbor3 && (!filterVisited || filterVisited && !_neighbor3.visited)) neighbors.push(_neighbor3);
              break;
            }
        }
      }
      return neighbors;
    }
  }]);

  return Maze;
}();

module.exports = Maze;

},{"./cell.js":3}]},{},[1]);
