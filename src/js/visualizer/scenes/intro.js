var VISU = require('visualizer/visu');
return function () {
VISU.scenes.Intro = function () {

	VISU.Scene.call( this );

	//BACKGROUND LAYER
	var background = new VISU.Layer( this );
	background.loadImage( "night", "/intro/background.jpg" );
	background.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.25 * this.presence;
		ctx.drawImage( this.images["night"], 0, 0 );
	};

	//SHADOWS LAYER
	var shadows = new VISU.Layer( this );
	shadows.loadImage( "shadows", "/common/shadows.png" );
	shadows.z = 1;
	shadows.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.8 * this.presence;
		this.x += 0.3;
		this.y += 0.3;
		this.fill( ctx, this.images["shadows"], this.x, this.y, 2 );
	};

	//FRONT LIGHTS LAYER
	var frontLights = new VISU.Layer( this );
	frontLights.loadImage( "white_light", "/intro/white_light.jpg" );
	frontLights.loadImage( "white_trail", "/intro/white_trail.jpg" );
	frontLights.loadImage( "blue_light", "/intro/blue_light.jpg" );
	frontLights.loadImage( "blue_trail", "/intro/blue_trail.jpg" );
	frontLights.z = 2;
	frontLights.particles = [];
	for (var i = 7; i >= 0; i--) {
		var p = new VISU.Particle( frontLights );
		if(Math.random() > 0.5){
			p.light = frontLights.images["blue_light"];
			p.trail = frontLights.images["blue_trail"];
		}else{
			p.light = frontLights.images["white_light"];
			p.trail = frontLights.images["white_trail"];
		}
		
		p.x = -10000;

		p.spawn = function( ctx ) {
			this.x = ctx.canvas.width - 2 + (Math.random() * 20);
			this.y = (ctx.canvas.height * 0.05) + (Math.random() * ctx.canvas.height * 0.5);
			this.vX = -0.4 + (Math.random() * 0.1);
			this.vY = Math.random() > 0.5 ? 0.02 : -0.1;
			this.scale = (3 + Math.random()) * 0.1;
			this.opacity = (1 + Math.random()) * 0.15;
			this.speed = 1.0005 + (Math.random() * 0.005);
		};

		p.draw = function( ctx, t, avg ) {
			if ( this.x < - this.light.width * this.scale ) {
				this.spawn( ctx );
			}
			
			var add = ctx.canvas.width * 0.9 - this.x;
			this.vX *= this.speed + (add * 0.000002);
			this.vY *= 1.0004;
			this.x += this.vX;
			this.y += this.vY;
			
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha = this.opacity * this.layer.presence * this.layer.presence * (0.8 + (Math.random() * 0.2));
			if (avg < 25) 
				ctx.drawImage(this.trail, this.x, this.y, this.trail.width * this.scale, ctx.canvas.height * 4);
			ctx.drawImage(this.light, this.x, this.y, this.light.width * this.scale, this.light.height * this.scale);
			

			if (avg < 25) {
				var offset = (ctx.canvas.width - this.x) / ctx.canvas.width;
				offset = offset > 0 && offset < 1 ? offset : 0;
				ctx.globalAlpha = this.opacity * 0.5 * this.layer.presence * this.layer.presence;
				ctx.drawImage(this.light, this.x, this.y + (offset * 300), this.light.width * this.scale, this.light.height * this.scale);
			}
		};
		frontLights.particles.push(p);
	}
	frontLights.draw = function( ctx, t, avg ) {
		
		for( var i = 0 ; i < this.particles.length ; i++ ) {	
			this.particles[i].draw( ctx, t, avg );
		}
	};

	//BACK LIGHTS LAYER
	var backLights = new VISU.Layer( this );
	backLights.loadImage( "blue_light", "/intro/blue_light.jpg" );
	backLights.loadImage( "blue_trail", "/intro/blue_trail.jpg" );
	backLights.z = 2;
	backLights.particles = [];
	for (var i = 8; i >= 0; i--) {
		var p = new VISU.Particle( backLights );
		
		p.x = 10000;

		p.spawn = function( ctx ) {
			this.light = backLights.images["blue_light"];
			this.trail = backLights.images["blue_trail"];
			this.vX = 1 - (Math.random() * 0.4);
			this.vY = Math.random() > 0.5 ? 0.001 : -0.0001;
			this.scale = (2 + Math.random()) * 0.3;
			this.opacity = (1 + Math.random()) * 0.03;
			this.x = -(this.light.width + 30) * this.scale;
			this.y = (-this.light.height * this.scale * 0.5) + (Math.random() * ctx.canvas.height * 0.6);
		};

		p.draw = function( ctx, t, avg ) {
			if ( this.x > ctx.canvas.width ) {
				this.spawn( ctx );
			}

			this.vX *= 1.001;
			this.vY *= 1.01;
			this.x += this.vX;
			this.y += this.vY;
			
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha = this.opacity * ((Math.random() * 0.2) + 0.8) * this.layer.presence;

			if (avg < 25)
				ctx.drawImage(this.trail, this.x, this.y, this.trail.width * this.scale, ctx.canvas.height * 4);
			ctx.drawImage(this.light, this.x, this.y, this.light.width * this.scale, this.light.height * this.scale);
		};
		backLights.particles.push(p);
	}
	backLights.draw = function( ctx, t, avg ) {
		
		for( var i = 0 ; i < this.particles.length * this.presence ; i++ ) {	
			this.particles[i].draw( ctx, t, avg );
		}
	};

	//GRADIENT LAYER
	var gradient = new VISU.Layer( this );
	gradient.loadImage( "gradient", "/intro/gradient.jpg" );
	gradient.z = 3;
	gradient.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.3 * this.presence;
		ctx.globalCompositeOperation = "lighter";
		this.fill( ctx, this.images["gradient"], -Math.random() * 3, -Math.random() * 3, 1 );
	};


	//BLUR LAYER
	var blur = new VISU.Layer( this );
	blur.z = 4;
	blur.draw = function( ctx, t, avg ) {
		if (avg > 25) return;
		ctx.globalAlpha = 0.4 * this.presence;
		for (var i = 2; i >= 0; i--) {
			ctx.drawImage( ctx.canvas, -5, -5, ctx.canvas.width + 10, ctx.canvas.height + 10 );
		};
	};


	this.addLayer( background );
	this.addLayer( shadows );
	this.addLayer( frontLights );
	this.addLayer( backLights );
	this.addLayer( gradient );
	this.addLayer( blur );
	
};

VISU.scenes.Intro.prototype = Object.create( VISU.Scene.prototype );
VISU.scenes.Intro.prototype.constructor = VISU.scenes.Intro;
}