var VISU = require('visualizer/visu');
return function () {
VISU.Scene = function () {

	this.layers = [];

};


VISU.Scene.prototype = {

	constructor: VISU.Scene,

	addLayer: function( layer ) {

		this.layers.push( layer );

	}, 

	removeLayer: function( layer ) {

		var index = this.layers.indexOf( layer );

		if ( index > -1 ) {
		    this.layers.splice( index, 1 );
		}

	},

	start: function( fade ) {
		fade = fade || 3000;
		for ( var i = this.layers.length - 1; i >= 0; i-- ) {
			this.layers[i].fadeTo( 1, fade );
		};

	},

	stop: function( fade ) {
		fade = fade || 3000;
		for ( var i = this.layers.length - 1; i >= 0; i-- ) {
			this.layers[i].fadeTo( 0, fade );
		};

	},
	
}
}