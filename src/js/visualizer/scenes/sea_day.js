var VISU = require('visualizer/visu');
return function () {
VISU.scenes.SeaDay = function () {

	VISU.Scene.call( this );

	//SKY LAYER
	var sky = new VISU.Layer( this );
	sky.loadImage( "sky", "/sea/day/sky.jpg" );
	sky.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.5 * this.presence;
		this.x -= 1;
		this.y -= 0.5;
		this.fill( ctx, this.images["sky"], this.x, this.y, 0.8 );
	};

	//CLOUDS LAYER
	var clouds = new VISU.Layer( this );
	clouds.loadImage( "clouds", "/sea/day/clouds.jpg" );
	clouds.z = 1;
	clouds.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.1 * this.presence;
		ctx.globalCompositeOperation = "lighter";
		this.x += 1;
		this.y += 3;
		this.fill( ctx, this.images["clouds"], this.x, this.y, 1 );
	};

	//GLIMMER LAYER
	var glimmer = new VISU.Layer( this );
	glimmer.loadImage( "bokeh", "/sea/day/bokeh.png" );
	glimmer.z = 2;
	glimmer.particles = [];
	for (var i = 15; i >= 0; i--) {
		var p = new VISU.Particle( glimmer );
		p.image = glimmer.images["bokeh"];
		p.lifetime = 0;

		p.spawn = function( ctx ) {
			this.targetX = Math.random() * ctx.canvas.width;
			this.targetY = (ctx.canvas.height * 0.2) + ((Math.random() * ctx.canvas.height) * 0.8);
			this.x = this.targetX;
			this.y = this.targetY;
			this.scale = (3 + Math.random()) * 0.5;
			this.opacity = 0.1 + ((Math.random() - 0.5) * 0.25);
			this.lifetime =  Math.random() * 200;
		};

		p.draw = function( ctx, t ) {
			if ( this.lifetime <= 0 ) {
				this.spawn( ctx );
			}

			this.lifetime -= 1;
			this.vX += (this.targetX - this.x) * 0.005;
			this.vY += (this.targetY - this.y) * 0.005;
			this.vX *= 0.96;
			this.vY *= 0.96;
			this.x += this.vX;
			this.y += this.vY;
			if (Math.random() > 0.1) {
				ctx.globalAlpha = this.opacity * 0.4 * this.layer.presence;
				ctx.drawImage(this.image, this.x, this.y, this.image.width * this.scale, this.image.height * this.scale);
				for (var i=0; i < 1; i++) {
					ctx.drawImage(this.image, this.x + (Math.random() * 15), this.y + (Math.random() * 15), this.image.width * this.scale, this.image.height * this.scale);
				}
				
			}
		};
		glimmer.particles.push(p);
	}
	glimmer.draw = function( ctx, t, avg ) {
		ctx.globalCompositeOperation = "lighter";
		for( var i = 0 ; i < this.particles.length * this.presence * this._clamp(17/avg) ; i++ ) {
			var p = this.particles[i];
			
			if (Math.random() > 0.9) {
				p.vX -= Math.random() * 1;
			}
			if (Math.random() > 0.9) {
				p.vY -= Math.random() * 0.5;
			}
			
			p.draw( ctx, t );
		}
	};

	//FLARE LAYER
	var flare = new VISU.Layer( this );
	flare.loadImage( "flare", "/sea/day/flare.jpg" );
	flare.z = 3;
	flare.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.4 * this.presence;
		ctx.globalCompositeOperation = "lighter";
		this.fill( ctx, this.images["flare"], -Math.random() * 3, -Math.random() * 3, 1 );
	};
	

	this.addLayer( sky );
	this.addLayer( clouds );
	this.addLayer( glimmer );
	this.addLayer( flare );
	
};

VISU.scenes.SeaDay.prototype = Object.create( VISU.Scene.prototype );
VISU.scenes.SeaDay.prototype.constructor = VISU.scenes.SeaDay;
}