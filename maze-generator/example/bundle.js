(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var mazeGenerator = require('./../index.js');
var canvas = buildCanvas(window.innerWidth - 1, window.innerHeight - 1);

var colors = ["", "#42dc8e", "#2e43eb", "#ffe359", "#96bfed", "#f5ead6", "#f1f3f7", "#e2e6ef"];

var maze = void 0,
    solver = void 0;

var RESOLUTION = 50;
var GENERATOR_ITERATION_BY_FRAME = 50;
var SOLVER_ITERATION_BY_FRAME = 1;

function init() {
  var ratio = window.innerWidth / window.innerHeight;
  var cols = ratio > 1 ? Math.floor(RESOLUTION * ratio) : RESOLUTION;
  var rows = ratio < 1 ? Math.floor(RESOLUTION / ratio) : RESOLUTION;

  maze = new mazeGenerator.Maze(cols, rows);
  solver = null; // solver is set once the maze is solved, see update();
}

init();
loop();
canvas.addEventListener('click', init);

// -------------------------------------------------------------------------

function buildCanvas(width) {
  var height = arguments.length <= 1 || arguments[1] === undefined ? width : arguments[1];

  var canvas = window.document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  window.document.body.style.margin = '0';
  window.document.body.style.padding = '0';
  window.document.body.style.background = 'black';
  window.document.body.appendChild(canvas);

  return canvas;
}

function loop() {
  requestAnimationFrame(loop);
  update(canvas);
}

function update(canvas) {
  if (!maze.end) {
    for (var i = 0; i < GENERATOR_ITERATION_BY_FRAME; i++) {
      maze.step();
    }display(maze, canvas);
  } else {
    solver = solver || new mazeGenerator.Solver(maze);
    if (!solver.done) {
      for (var _i = 0; _i < SOLVER_ITERATION_BY_FRAME; _i++) {
        if (solver.step()) {
          solver.done = true;
          break;
        }
      }
      display(maze, canvas);
    }
  }
}

function display(maze, canvas) {
  var ctx = canvas.getContext('2d');
  var margin = 10;
  var w = (canvas.width - margin * 2) / maze.cols;
  var h = (canvas.height - margin * 2) / maze.rows;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  for (var i = 0; i < maze.cells.length; i++) {
    var cell = maze.cells[i];
    if (cell === maze.currentCell) {
      ctx.fillStyle = '#ffe359';
      ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
    } else if (cell.visited) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
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
    if (cell === maze.start || cell == maze.end) {
      ctx.fillStyle = '#ff2d5d';
      ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
    } else if (solver) {
      if (solver.solution && solver.solution.indexOf(cell) > 0) {
        ctx.fillStyle = 'rgba(66, 220, 142, 0.5)';
        ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
      } else if (cell.flooded) {
        ctx.fillStyle = 'rgba(46, 67, 235, 0.5)';
        ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
      }
    }
  }
  ctx.stroke();
}

},{"./../index.js":2}],2:[function(require,module,exports){
'use strict';

module.exports.Maze = require('./src/maze.js');
module.exports.Solver = require('./src/solver.js');

},{"./src/maze.js":4,"./src/solver.js":5}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// this class must stay agnostic
var Cell = function Cell(x, y) {
  _classCallCheck(this, Cell);

  this.x = x;
  this.y = y;
  this.visited = false;
  this.flooded = false;
  this.walls = [true, true, true, true];
};

module.exports = Cell;

},{}],4:[function(require,module,exports){
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
    } else {
      this.start = this.random(this.cells);
    }
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

    // walk through the maze until completely generated

  }, {
    key: 'generate',
    value: function generate() {
      var solved = false;
      while (!solved) {
        solved = this.step();
      }
      return this;
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
            console.log('maze created !');
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
    // if a bias must be implemented, do it here

  }, {
    key: 'random',
    value: function random(cells) {
      // this.i = this.i + .1 || 1;
      // return cells[Math.sin(this.i) > 0 ? 0 : cells.length-1];
      // return cells[Math.floor(Math.abs(Math.sin(Math.cos(this.i))) * cells.length)];
      return cells[Math.floor(Math.random() * cells.length)];
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

},{"./cell.js":3}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Maze = require('./maze.js');
var Cell = require('./cell.js');

/*
 * Maze solving using a breadth-first search algorithm
 * @see https://en.wikipedia.org/wiki/Breadth-first_search
 */

var TOP = 0,
    RIGHT = 1,
    BOTTOM = 2,
    LEFT = 3;

// this class must stay agnostic

var Solver = function () {
  function Solver(maze) {
    _classCallCheck(this, Solver);

    this.maze = maze;

    this.flood = [];
    this.flood.push(this.maze.start);
  }

  // -------------------------------------------------------------------------

  // walk through the maze until the solution is found


  _createClass(Solver, [{
    key: 'solve',
    value: function solve() {
      while (!this.done) {
        this.done = this.step();
      }
      return this;
    }

    // walk through the maze, and return true if the solution is found

  }, {
    key: 'step',
    value: function step() {
      var _this = this;

      // start by flooding the maze using a breadth-first search strategy
      if (!this.solution) {
        var newFlood = [];

        var _loop = function _loop(i) {
          var cell = _this.flood[i];
          cell.flooded = true;
          // if the flood reach the end of the maze, start the solution
          if (cell === _this.maze.end) {
            _this.solution = [];
            _this.solution.push(cell);
            return 'break';
          } else {
            // continue to flood
            var neighbors = _this.findDirectNeighbors(cell, true).map(function (c) {
              // a flooded cell now from which cell the flood came
              c.source = cell;
              return c;
            });
            newFlood = newFlood.concat(neighbors);
          }
        };

        for (var i = 0; i < this.flood.length; i++) {
          var _ret = _loop(i);

          if (_ret === 'break') break;
        }
        this.flood = newFlood;
      } else {
        // back-propagate from the last flooded cell to the first one
        var _cell = this.solution[this.solution.length - 1];
        // the prev flooded cell is the one from which the flood came
        if (_cell.source) this.solution.push(_cell.source);else if (_cell === this.maze.start) {
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

  }, {
    key: 'findDirectNeighbors',
    value: function findDirectNeighbors(cell) {
      var filterFlooded = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var neighbors = [];
      for (var i = 0; i < 4; i++) {
        var wall = cell.walls[i];
        if (wall === false) {
          switch (i) {
            case TOP:
              {
                var neighbor = this.maze.cells[this.maze.index(cell.x + 0, cell.y - 1)];
                if (neighbor && (!filterFlooded || filterFlooded && !neighbor.flooded)) neighbors.push(neighbor);
                break;
              }
            case RIGHT:
              {
                var _neighbor = this.maze.cells[this.maze.index(cell.x + 1, cell.y + 0)];
                if (_neighbor && (!filterFlooded || filterFlooded && !_neighbor.flooded)) neighbors.push(_neighbor);
                break;
              }
            case BOTTOM:
              {
                var _neighbor2 = this.maze.cells[this.maze.index(cell.x + 0, cell.y + 1)];
                if (_neighbor2 && (!filterFlooded || filterFlooded && !_neighbor2.flooded)) neighbors.push(_neighbor2);
                break;
              }
            case LEFT:
              {
                var _neighbor3 = this.maze.cells[this.maze.index(cell.x - 1, cell.y + 0)];
                if (_neighbor3 && (!filterFlooded || filterFlooded && !_neighbor3.flooded)) neighbors.push(_neighbor3);
                break;
              }
          }
        }
      }
      return neighbors;
    }
  }]);

  return Solver;
}();

module.exports = Solver;

},{"./cell.js":3,"./maze.js":4}]},{},[1]);
