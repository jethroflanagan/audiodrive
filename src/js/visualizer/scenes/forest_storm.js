var VISU = require('visualizer/visu');
return function () {
VISU.scenes.ForestStorm = function () {

	VISU.Scene.call( this );

	//BACKGROUND LAYER
	var background = new VISU.Layer( this );
	background.loadImage( "trees", "/forest/storm/background.jpg" );
	background.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.7 * this.presence;
		ctx.drawImage( this.images["trees"], 0, 0 );
	};

	//SHADOWS LAYER
	var shadows = new VISU.Layer( this );
	shadows.loadImage( "shadows", "/common/shadows.png" );
	shadows.z = 1;
	shadows.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.9 * this.presence;
		this.x += -1.5;
		this.y += 1.5;
		this.fill( ctx, this.images["shadows"], this.x, this.y, 3 );
	};

	//GLIMMER LAYER
	var glimmer = new VISU.Layer( this );
	glimmer.loadImage( "bokeh", "/forest/storm/bokeh.jpg" );
	glimmer.z = 2;
	glimmer.particles = [];
	for (var i = 50; i >= 0; i--) {
		var p = new VISU.Particle( glimmer );
		p.image = glimmer.images["bokeh"];
		p.lifetime = 0;

		p.spawn = function( ctx ) {
			this.targetX = (Math.random() * ctx.canvas.width) - 40;
			this.targetY = (Math.random() * ctx.canvas.height) - 40;
			this.x = this.targetX;
			this.y = this.targetY;
			this.scale = (1.5 + Math.random()) * 0.25;
			this.opacity = (0.05 + Math.random()) * 0.1;
			this.lifetime =  200 + Math.random() * 2000;
		};

		p.draw = function( ctx, t ) {
			if ( this.lifetime <= 0 ) {
				this.spawn( ctx );
			}

			this.lifetime -= 1;
			this.vX += (this.targetX - this.x) * 0.01;
			this.vY += (this.targetY - this.y) * 0.01;
			this.vX *= 0.98;
			this.vY *= 0.98;
			this.x += this.vX;
			this.y += this.vY;
			
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha = this.opacity * this.layer.presence * ( 0.7 + (Math.random() * 0.3));
			ctx.drawImage(this.image, this.x, this.y, this.image.width * this.scale, this.image.height * this.scale);
		};
		glimmer.particles.push(p);
	}
	glimmer.draw = function( ctx, t, avg ) {
		
		for( var i = 0 ; i < this.particles.length * this.presence * this._clamp(17/avg) ; i++ ) {
			var p = this.particles[i];
			
			if (Math.random() > 0.3) {
				p.vX -= Math.random() * (0.07 + (p.x * 0.001));
			}
			if (Math.random() > 0.5) {
				p.vY -= Math.random() * (0.07 + (p.x * 0.001));
			}
			
			p.draw( ctx, t );
		}
	};

	//GRADIENT LAYER
	var gradient = new VISU.Layer( this );
	gradient.loadImage( "gradient", "/forest/storm/gradient.jpg" );
	gradient.z = 3;
	gradient.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.5 * this.presence;
		ctx.globalCompositeOperation = "lighter";
		this.fill( ctx, this.images["gradient"], -Math.random() * 10, -Math.random() * 10, 1 );
	};

	//BLUR LAYER
	var blur = new VISU.Layer( this );
	blur.z = 4;
	blur.draw = function( ctx, t, avg ) {
		if (avg > 25) return;
		ctx.globalAlpha = 0.25 * this.presence;
		for (var i = 2 ; i >= 0; i--) {
			ctx.drawImage( ctx.canvas, -Math.random() * 3, -Math.random() * 3, ctx.canvas.width + 8, ctx.canvas.height + 8 );
		};
	};


	this.addLayer( background );
	this.addLayer( shadows );
	this.addLayer( glimmer );
	this.addLayer( gradient );
	this.addLayer( blur );
	
};

VISU.scenes.ForestStorm.prototype = Object.create( VISU.Scene.prototype );
VISU.scenes.ForestStorm.prototype.constructor = VISU.scenes.ForestStorm;
}