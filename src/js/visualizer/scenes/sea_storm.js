var VISU = require('visualizer/visu');
return function () {
VISU.scenes.SeaStorm = function () {

	VISU.Scene.call( this );

	//BACKGROUND LAYER
	var background = new VISU.Layer( this );
	background.loadImage( "sea", "/sea/storm/background.jpg" );
	background.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.3 * this.presence;
		this.x -= 10;
		this.fill( ctx, this.images["sea"], this.x, 0, 1 );
	};

	//GLIMMER LAYER
	var glimmer = new VISU.Layer( this );
	glimmer.loadImage( "bokeh", "/sea/storm/bokeh.jpg" );
	glimmer.z = 2;
	glimmer.particles = [];
	for (var i = 30; i >= 0; i--) {
		var p = new VISU.Particle( glimmer );
		p.image = glimmer.images["bokeh"];
		p.lifetime = -1;

		p.spawn = function( ctx ) {
			this.x = (Math.random() * 700) - 80;
			this.y = this.x - (ctx.canvas.width / 2) - 100;
			this.y = Math.pow(this.y, 2) * 0.001;
			this.y += (Math.random() - 0.5) * 150;
			//this.y -= 50;
			if(Math.random() > 0.8) {
				this.y = ctx.canvas.height - this.y;
				//this.y += 100;
			}
			this.direction = Math.random() - 0.5;
			this.scale = (5 + Math.random()) * 0.22;
			this.opacity = (0.05 + Math.random()) * ((Math.abs(this.x) + 700) * 0.00008);
			this.lifetime = Math.random() * 30;
		};

		p.draw = function( ctx, t ) {
			if ( this.lifetime-- < 0 ) {
				this.spawn( ctx );
			}

			this.x -= Math.random() * 20;
			this.y += this.direction * 10;
			this.opacity *= 0.99;
			
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha = this.opacity * this.layer.presence * ( 0.7 + (Math.random() * 0.3));
			ctx.drawImage(this.image, this.x, this.y, this.image.width * this.scale, this.image.height * this.scale);
		};
		glimmer.particles.push(p);
	}
	glimmer.draw = function( ctx, t, avg ) {
		
		for( var i = 0 ; i < this.particles.length * this.presence * this._clamp(17/avg); i++ ) {
			var p = this.particles[i];
			p.draw( ctx, t );
		}
	};

	//GRADIENT LAYER
	var gradient = new VISU.Layer( this );
	gradient.loadImage( "gradient", "/sea/storm/gradient.jpg" );
	gradient.z = 3;
	gradient.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.2 * this.presence;
		ctx.globalCompositeOperation = "lighter";
		this.fill( ctx, this.images["gradient"], -Math.random() * 10, -Math.random() * 10, 1 );
	};

	//BLUR LAYER
	var blur = new VISU.Layer( this );
	blur.z = 4;
	blur.draw = function( ctx, t, avg ) {
		if (avg > 25) return;
		ctx.globalAlpha = 0.25 * this.presence;
		for (var i = 2; i >= 0; i--) {
			ctx.drawImage( ctx.canvas, -Math.random() * 3, -Math.random() * 3, ctx.canvas.width + 8, ctx.canvas.height + 8 );
		};
	};


	this.addLayer( background );
	this.addLayer( glimmer );
	this.addLayer( gradient );
	this.addLayer( blur );
	
};

VISU.scenes.SeaStorm.prototype = Object.create( VISU.Scene.prototype );
VISU.scenes.SeaStorm.prototype.constructor = VISU.scenes.SeaStorm;
}