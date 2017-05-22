var VISU = require('visualizer/visu');
return function () {
VISU.scenes.ForestNight = function () {

	VISU.Scene.call( this );

	//BACKGROUND LAYER
	var background = new VISU.Layer( this );
	background.loadImage( "trees", "/forest/night/background.jpg" );
	background.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.4 * this.presence;
		ctx.drawImage( this.images["trees"], 0, 0 );
	};

	//SHADOWS LAYER
	var shadows = new VISU.Layer( this );
	shadows.loadImage( "shadows", "/common/shadows.png" );
	shadows.z = 1;
	shadows.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.2 * this.presence;
		this.x += 1.5;
		this.y += 1.5;
		this.fill( ctx, this.images["shadows"], this.x, this.y, 2.53 );
	};

	//GLIMMER LAYER
	var glimmer = new VISU.Layer( this );
	glimmer.loadImage( "bokeh", "/forest/bokeh.png" );
	glimmer.z = 2;
	glimmer.particles = [];
	for (var i = 30; i >= 0; i--) {
		var p = new VISU.Particle( glimmer );
		p.image = glimmer.images["bokeh"];
		p.lifetime = 0;

		p.spawn = function( ctx ) {
			this.targetX = Math.random() * ctx.canvas.width;
			this.targetY = Math.random() * ctx.canvas.height;
			this.x = this.targetX;
			this.y = this.targetY;
			this.scale = (2 + Math.random()) * 0.1;
			this.opacity = (0.05 + Math.random()) * 0.5;
			this.lifetime =  Math.random() * 1000;
		};

		p.draw = function( ctx, t ) {
			if ( this.lifetime <= 0 ) {
				this.spawn( ctx );
			}

			this.lifetime -= 1;
			this.vX += (this.targetX - this.x) * 0.005;
			this.vY += (this.targetY - this.y) * 0.005;
			this.vX *= 0.99;
			this.vY *= 0.99;
			this.x += this.vX;
			this.y += this.vY;
			
			ctx.globalCompositeOperation = "lighter";
			for (var i=0; i < 2; i++) {
				ctx.globalAlpha = this.opacity * 0.3 * this.layer.presence * ( 0.1 + (Math.random() * 0.9));
				ctx.drawImage(this.image, this.x + (Math.random() * 5), this.y + (Math.random() * 5), this.image.width * this.scale, this.image.height * this.scale);
			}
			ctx.globalCompositeOperation = "source-over";
			ctx.globalAlpha = this.opacity * this.layer.presence * ( 0.1 + (Math.random() * 0.9));
			ctx.drawImage(this.image, this.x, this.y, this.image.width * this.scale, this.image.height * this.scale);
		};
		glimmer.particles.push(p);
	}
	glimmer.draw = function( ctx, t, avg ) {
		
		for( var i = 0 ; i < this.particles.length * this.presence * this._clamp(17/avg) ; i++ ) {
			var p = this.particles[i];
			
			if (Math.random() > 0.8) {
				p.vX -= Math.random() * p.y * 0.003;
			}
			if (Math.random() > 0.8) {
				p.vY -= Math.random() * p.x * 0.001;
			}
			
			p.draw( ctx, t );
		}
	};

	//GRADIENT LAYER
	var gradient = new VISU.Layer( this );
	gradient.loadImage( "gradient", "/forest/gradient.jpg" );
	gradient.z = 3;
	gradient.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.15 * this.presence;
		ctx.globalCompositeOperation = "lighter";
		this.fill( ctx, this.images["gradient"], -Math.random() * 3, -Math.random() * 3, 1 );
	};

	//BLUR LAYER
	var blur = new VISU.Layer( this );
	blur.z = 4;
	blur.draw = function( ctx, t, avg ) {
		if (avg > 25) return;
		ctx.globalAlpha = 0.25 * this.presence;
		for (var i = 3; i >= 0; i--) {
			ctx.drawImage( ctx.canvas, -Math.random() * 3, -Math.random() * 3, ctx.canvas.width + 6, ctx.canvas.height + 6 );
		};
	};


	this.addLayer( background );
	this.addLayer( shadows );
	this.addLayer( glimmer );
	this.addLayer( gradient );
	this.addLayer( blur );
	
};

VISU.scenes.ForestNight.prototype = Object.create( VISU.Scene.prototype );
VISU.scenes.ForestNight.prototype.constructor = VISU.scenes.ForestNight;
}