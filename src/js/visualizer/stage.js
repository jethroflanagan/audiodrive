var VISU = require('visualizer/visu');
return function () {
VISU.Stage = function ( id ) {

	var canvas = document.getElementById(id);
	this.ctx = canvas.getContext("2d");

	this.scenes = [];
	this.layers = [];
	this.live = false;
	this.time = 0;
	this.timeAverage = 0;

	this.addScene( new VISU.scenes.ForestDay() );
	this.addScene( new VISU.scenes.ForestNight() );
	this.addScene( new VISU.scenes.ForestStorm() );
	this.addScene( new VISU.scenes.SeaDay() );
	this.addScene( new VISU.scenes.SeaNight() );
	this.addScene( new VISU.scenes.SeaStorm() );
	this.addScene( new VISU.scenes.CityDay() );
	this.addScene( new VISU.scenes.CityNight() );
	this.addScene( new VISU.scenes.CityStorm() );
	this.addScene( new VISU.scenes.Intro() );
	this.compile();

	this.ctx.rect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );
	this.ctx.fillStyle = "black";
	this.ctx.fill();

	this.start();

};


VISU.Stage.prototype = {

	constructor: VISU.Stage,

	addScene: function( scene ) {

		this.scenes.push( scene );

	}, 

	removeScene: function( scene ) {

		var index = this.scenes.indexOf( scene );

		if ( index > -1 ) {
		    this.scenes.splice( index, 1 );
		}

	},

	compile: function() {

		this.layers = [];

		for ( var i = this.scenes.length - 1; i >= 0; i-- ) {
			this.layers = this.layers.concat( this.scenes[i].layers );
		};

		this.layers = this.layers.sort( function( a, b ) { return a.z - b.z; } );

	},

	start: function() {

		this.live = true;
		this.time = new Date().getTime();
		this.render();

	},

	stop: function() {

		this.live = false;

	},

	render: function() {

		if ( !this.live ) {
			return;
		}

		var now = new Date().getTime();

		for ( var i = 0 ; i < this.layers.length ; i ++ ) {
			this.ctx.save();
			this.ctx.beginPath();
			this.timeAverage = (this.timeAverage + (now - this.time)) / 2
			this.layers[i].render( this.ctx, now - this.time, this.timeAverage );
			this.ctx.closePath();
			this.ctx.restore();
			this.ctx.globalCompositeOperation = "source-over";
		}

		this.time = now;

		requestFrame( this.render.bind( this ) );

	},

	switchTo: function ( index ) {
		
		for (var i = this.scenes.length - 1; i >= 0; i--) {
			this.scenes[i].stop();
		};

		this.scenes[index].start();
	},
	
}
}