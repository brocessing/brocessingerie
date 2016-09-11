const mazeGenerator = require('./../index.js');
const canvas = buildCanvas(window.innerWidth - 1, window.innerHeight - 1);

const colors = ["", "#42dc8e", "#2e43eb", "#ffe359", "#96bfed", "#f5ead6", "#f1f3f7", "#e2e6ef"];

let maze, solver;

const RESOLUTION = 50;
const GENERATOR_ITERATION_BY_FRAME = 50;
const SOLVER_ITERATION_BY_FRAME = 10;

function init() {
  let ratio = window.innerWidth / window.innerHeight;
  let cols = (ratio > 1) ? Math.floor(RESOLUTION*ratio) : RESOLUTION;
  let rows = (ratio < 1) ? Math.floor(RESOLUTION/ratio) : RESOLUTION;

  maze = new mazeGenerator.Maze(cols, rows, Math.floor(cols / 2), 0);
  solver = null; // solver is set once the maze is solved, see update();
}

init();
loop();
canvas.addEventListener('click', init);


// -------------------------------------------------------------------------

function buildCanvas(width, height = width){
  let canvas = window.document.createElement('canvas');
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

function loop(){
  requestAnimationFrame(loop);
  update(canvas);
}

function update(canvas) {
  if (!maze.end) {
    for (let i = 0; i < GENERATOR_ITERATION_BY_FRAME; i++) maze.step();
      display(maze, canvas);
  } else {
    solver = solver || new mazeGenerator.Solver(maze);
    if (!solver.done) {
      for (let i = 0; i < SOLVER_ITERATION_BY_FRAME; i++) {
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
  let ctx = canvas.getContext('2d');
  let margin = 10;
  let w = (canvas.width - margin * 2) / maze.cols;
  let h = (canvas.height - margin * 2) / maze.rows;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  for (let i = 0; i < maze.cells.length; i++) {
    let cell = maze.cells[i];
    if (cell === maze.currentCell) {
      ctx.fillStyle = '#ffe359';
      ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
    } else if (cell.visited) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(margin + cell.x * w, margin + cell.y * h, w, h);
      for (let j = 0; j < cell.walls.length; j++) {
        if (cell.walls[j]) {
          switch(j) {
            case 0 :
            ctx.moveTo(margin + (cell.x + 0) * w, margin + (cell.y + 0) * h );
            ctx.lineTo(margin + (cell.x + 1) * w, margin + (cell.y + 0) * h );
            break;
            case 1 :
            ctx.moveTo(margin + (cell.x + 1) * w, margin + (cell.y + 0) * h );
            ctx.lineTo(margin + (cell.x + 1) * w, margin + (cell.y + 1) * h );
            break;
            case 2 :
            ctx.moveTo(margin + (cell.x + 1) * w, margin + (cell.y + 1) * h );
            ctx.lineTo(margin + (cell.x + 0) * w, margin + (cell.y + 1) * h );
            break;
            case 3 :
            ctx.moveTo(margin + (cell.x + 0) * w, margin + (cell.y + 1) * h );
            ctx.lineTo(margin + (cell.x + 0) * w, margin + (cell.y + 0) * h );
            break;
          }
        }
      }
    }
    if (cell === maze.start || cell == maze.end) {
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