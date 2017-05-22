var VISU = require('visualizer/visu');
return function () {
VISU.Particle = function ( layer ) {

	this.layer = layer;
	this.x = 0;
	this.y = 0;
	this.vX = 0;
	this.vY = 0;
	this.rotation = 0;
	this.scale = 1;

};


VISU.Particle.prototype = {

	constructor: VISU.Particle,

}
}