var VISU = {};
VISU.scenes = {};
VISU.assetsFolder = "./img/VISU";

window.requestFrame = (function(){
		  return  window.requestAnimationFrame       ||
		          window.webkitRequestAnimationFrame ||
		          window.mozRequestAnimationFrame    ||
		          function( callback ){
		            window.setTimeout(callback, 1000 / 60); // reduced for optimisation - if browsers don't support it, canvas speed is probably low
		          };
		})();
return VISU;