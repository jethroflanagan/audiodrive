var VISU = require('visualizer/visu');
return function () {
VISU.scenes.SeaNight = function () {

	VISU.Scene.call( this );

	//FILL LAYER
	var fill = new VISU.Layer( this );
	fill.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.2 * this.presence;
		ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle="black";
		ctx.fill();
	};

	//BACKGROUND LAYER
	var background = new VISU.Layer( this );
	background.loadImage( "night", "/sea/night/background.jpg" );
	background.draw = function( ctx, t ) {
		this.x -= 8;
		ctx.globalCompositeOperation = "lighter";
		ctx.globalAlpha = 0.1 * this.presence;
		this.fill( ctx, this.images["night"], this.x, -Math.random() * 3, 3 );
	};

	//BACKGROUND 2 LAYER
	var background2 = new VISU.Layer( this );
	background2.loadImage( "night", "/sea/night/background.jpg" );
	background2.draw = function( ctx, t ) {
		this.x += 4;
		ctx.globalCompositeOperation = "lighter";
		ctx.globalAlpha = 0.05 * this.presence;
		this.fill( ctx, this.images["night"], this.x, -Math.random() * 3, 1.5 );
	};

	//GLIMMER LAYER
	var glimmer = new VISU.Layer( this );
	glimmer.loadImage( "bokeh", "/sea/night/bokeh.png" );
	glimmer.z = 3;
	glimmer.particles = [];
	for (var i = 30; i >= 0; i--) {
		var p = new VISU.Particle( glimmer );
		p.image = glimmer.images["bokeh"];
		p.lifetime = 0;

		p.spawn = function( ctx ) {
			this.targetX = (ctx.canvas.width / 2) + ((Math.random() - 0.5) * (ctx.canvas.width * 0.5));
			this.targetY = -50 + ((Math.random() * ctx.canvas.height) * 0.9);
			this.x = this.targetX;
			this.y = this.targetY;
			this.scale = (3 + Math.random()) * 0.35;
			this.opacity = 0.1 + ((Math.random() - 0.5) * 0.1);
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
			p.draw( ctx, t );
		}
	};

	//FOREGROUND LAYER
	var foreground = new VISU.Layer( this );
	foreground.loadImage( "foreground", "/sea/night/foreground.jpg" );
	foreground.z = 4;
	foreground.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.31 * this.presence;
		ctx.globalCompositeOperation = "lighter";
		this.fill( ctx, this.images["foreground"], -Math.random() * 10, -Math.random() * 10, 1 );
	};

	//BLUR LAYER
	var blur = new VISU.Layer( this );
	blur.z = 5;
	blur.draw = function( ctx, t, avg ) {
		if (avg > 25) return;
		ctx.globalAlpha = 0.3 * this.presence;
		for (var i = 2; i >= 0; i--) {
			ctx.drawImage( ctx.canvas, -Math.random() * 2, 0, ctx.canvas.width + 2, ctx.canvas.height + 3 );
		};
	};
	

	this.addLayer( fill );
	this.addLayer( background );
	this.addLayer( background2 );
	this.addLayer( blur );
	this.addLayer( glimmer );
	this.addLayer( foreground );
	
	
};

VISU.scenes.SeaNight.prototype = Object.create( VISU.Scene.prototype );
VISU.scenes.SeaNight.prototype.constructor = VISU.scenes.SeaNight;
}