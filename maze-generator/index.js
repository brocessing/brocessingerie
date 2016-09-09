// EXAMPLE
const maze = require('./../index.js');


let canvas = window.document.createElement('canvas');
canvas.width = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) - 50;
canvas.height = canvas.width;
canvas.style.width = canvas.width + 'px';
canvas.style.height = canvas.height + 'px';
window.document.body.appendChild(canvas);

maze.generate(50, 50);
maze.update(canvas);

window.addEventListener('click', function() {
  maze.generate(50, 50);
  maze.update(canvas);
});

// -------------------------------------------------------------------------

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

window.loop = function(){
  if(maze !== undefined){
    requestAnimFrame(loop);
    maze.update(canvas);
  }
};

window.loop();
window.noLoop = function(){ loop = null; }