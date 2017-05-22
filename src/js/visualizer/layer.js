var VISU = require('visualizer/visu');
return function () {
VISU.Layer = function ( scene ) {

	this.scene = scene;
	this.presence = 0;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.presenceTarget = 0;
	this.fadeDuration = 0;
	this.fadeElapsed = 0;
	this.images = {};

};


VISU.Layer.prototype = {

	constructor: VISU.Layer,

	render: function( ctx, t, avg ) {

		this._fade( t );

		if ( this.presence < 0.01 ) {
			return;
		}

		if ( this.draw ) {
			this.draw( ctx, t, avg );
		}
		
	},

	loadImage: function( name, src ) {
		if ( VISU.assetsFolder ) {
			src = VISU.assetsFolder + src;
		}

		var img = new Image();
		this.images[name] = img;
		var self = this;
		img.onload = function() {
	        if( self._assetsReady() ) {
	        	self.ready();
	        }
	    };
	    img.src = src;
	},

	fadeTo: function( val, t ) {

		this.presenceTarget = val;
		this.fadeDuration = t;
		this.fadeElapsed = 0;

	},

	fill: function( ctx, img, x, y, scale ) {

		var canvas = ctx.canvas;

		var tileWidth = img.width * scale;
		var tileHeight = img.height * scale;
		var tileX = ((x  % tileWidth) - tileWidth) % tileWidth;
		var tileY = ((y % tileHeight) - tileHeight) % tileHeight;

		for ( var i = tileX ; i < canvas.width ; i += tileWidth ) {
			for ( var j = tileY ; j < canvas.height ; j += tileHeight ) {
				ctx.drawImage(img, i, j, tileWidth, tileHeight);
			}
		}

	},

	ready: function() {
		
	},

	_assetsReady: function() {
		for ( var key in this.images ) {
			if ( !this.images[key].complete ) {
				return false;
			}
		};
		return true;
	},

	_fade: function( t ) {

		if ( this.fadeElapsed >= this.fadeDuration || this.presence == this.presenceTarget ) {
			return;
		}

		var diff = this.presenceTarget - this.presence;
		var timeLeft = this.fadeDuration - this.fadeElapsed;
		this.presence = this._clamp(this.presence + (diff * (t / timeLeft)), false);
		this.fadeElapsed += t;

	},

	_clamp: function( val, circular ) {

		if ( val < 0 ) {
			if ( circular ) {
				val = 1 + (val % 1);
			} else {
				val = 0;
			}
		} else if ( val > 1 ) {
			if ( circular ) {
				val = val % 1;
			} else {
				val = 1;
			}
		}

		return val;

	},
}
}