var VISU = require('visualizer/visu');
return function () {
VISU.scenes.CityStorm = function () {

	VISU.Scene.call( this );

	//BACKGROUND LAYER
	var background = new VISU.Layer( this );
	background.loadImage( "rain", "/city/storm/background.jpg" );
	background.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.35 * this.presence;
		ctx.drawImage( this.images["rain"], -Math.random() * 10, -Math.random() * 10 );
	};

	//SHADOWS LAYER
	var shadows = new VISU.Layer( this );
	shadows.loadImage( "shadows", "/common/shadows.png" );
	shadows.z = 1;
	shadows.draw = function( ctx, t ) {
		ctx.globalAlpha = 0.8 * this.presence;
		this.x += 3;
		this.y -= 0.5;
		this.fill( ctx, this.images["shadows"], this.x, this.y, 3.5 );
	};

	//FRONT LIGHTS LAYER
	var frontLights = new VISU.Layer( this );
	frontLights.loadImage( "white_light", "/city/night/white_light.jpg" );
	frontLights.loadImage( "white_trail", "/city/night/white_trail.jpg" );
	frontLights.z = 2;
	frontLights.particles = [];
	for (var i = 7; i >= 0; i--) {
		var p = new VISU.Particle( frontLights );
		p.light = frontLights.images["white_light"];
		p.trail = frontLights.images["white_trail"];
		p.x = -10000;

		p.spawn = function( ctx ) {
			this.x = ctx.canvas.width - 2 + (Math.random() * 20);
			this.y = (ctx.canvas.height * 0.05) + (Math.random() * ctx.canvas.height * 0.15);
			this.vX = -0.1 + (Math.random() * 0.05);
			this.vY = Math.random() > 0.5 ? 0.001 : -0.001;
			this.scale = (3 + Math.random()) * 0.06;
			this.opacity = (1 + Math.random()) * 0.5;
			this.speed = 1.004 + (Math.random() * 0.01);
		};

		p.draw = function( ctx, t, avg, second ) {
			if (second && avg > 25) return;

			if ( this.x < - this.light.width * this.scale ) {
				this.spawn( ctx );
			}
			
			if(!second){
				var add = ctx.canvas.width * 0.9 - this.x;
				this.vX *= this.speed + (add * 0.00004);
				this.vY *= this.speed;
				this.x += this.vX;
				this.y += this.vY;
			}

			var calcX = this.x;
			var calcScale = this.scale;
			var offset = (ctx.canvas.width - calcX) / ctx.canvas.width;

			if(second) {
				calcX = this.x + (100 + (this.vX));
				calcScale *= this.speed + 0.05;
				offset += 0.07 + (this.speed * 0.01);
			}
			
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha = this.opacity * this.layer.presence * this.layer.presence * (0.5 + (Math.random() * 0.5));
			if (avg < 25)
				ctx.drawImage(this.trail, calcX, this.y, this.trail.width * calcScale, ctx.canvas.height * 2);
			ctx.drawImage(this.light, calcX, this.y, this.light.width * calcScale, this.light.height * calcScale);
			
			if (avg < 25) {
				offset = offset > 0 && offset < 1 ? offset : 0;
				ctx.globalAlpha = this.opacity * (1 - offset) * 0.5 * this.layer.presence * this.layer.presence;
				ctx.drawImage(this.light, calcX, this.y + (offset * 200), this.light.width * calcScale, this.light.height * calcScale);
			}

			if(!second){
				this.draw(ctx, t, avg, true);
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
	backLights.loadImage( "red_light", "/city/night/red_light.jpg" );
	backLights.loadImage( "red_trail", "/city/night/red_trail.jpg" );
	backLights.loadImage( "blue_light", "/city/night/blue_light.jpg" );
	backLights.loadImage( "blue_trail", "/city/night/blue_trail.jpg" );
	backLights.z = 2;
	backLights.particles = [];
	for (var i = 8; i >= 0; i--) {
		var p = new VISU.Particle( backLights );
		
		p.x = 10000;

		p.spawn = function( ctx ) {
			if ( Math.random() > 0.1 ) {
				this.light = backLights.images["red_light"];
				this.trail = backLights.images["red_trail"];
			} else {
				this.light = backLights.images["blue_light"];
				this.trail = backLights.images["blue_trail"];
			}
			this.vX = 1;
			this.vY = Math.random() > 0.5 ? 0.1 : -0.1;
			this.scale = (2 + Math.random()) * 0.06;
			this.opacity = (1 + Math.random()) * 0.1;
			this.x = -this.light.width * this.scale;
			this.y = (-this.light.height * this.scale * 0.1) + (Math.random() * ctx.canvas.height * 0.3);
		};

		p.draw = function( ctx, t, avg ) {
			if ( this.x > ctx.canvas.width ) {
				this.spawn( ctx );
			}

			this.vX *= 1.01;
			this.vY *= 1.005;
			this.x += this.vX;
			this.y += this.vY;
			
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha = this.opacity * Math.random() * this.layer.presence;
			if(avg < 25)
				ctx.drawImage(this.trail, this.x, this.y, this.trail.width * this.scale, ctx.canvas.height * 2);
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
	gradient.loadImage( "gradient", "/city/storm/gradient.jpg" );
	gradient.z = 4;
	gradient.draw = function( ctx, t ) {
		ctx.globalAlpha = 1 * this.presence;
		ctx.globalCompositeOperation = "lighter";
		this.fill( ctx, this.images["gradient"], -Math.random() * 3, -Math.random() * 3, 1 );
	};


	//BLUR LAYER
	var blur = new VISU.Layer( this );
	blur.z = 5;
	blur.draw = function( ctx, t, avg ) {
		if (avg > 25) return;
		ctx.globalAlpha = 0.5 * this.presence;
		for (var i = 3; i >= 0; i--) {
			ctx.drawImage( ctx.canvas, -6, -0, ctx.canvas.width + 6, ctx.canvas.height + 6 );
		};
	};


	this.addLayer( background );
	this.addLayer( shadows );
	this.addLayer( frontLights );
	this.addLayer( backLights );
	this.addLayer( gradient );
	this.addLayer( blur );
	
};

VISU.scenes.CityStorm.prototype = Object.create( VISU.Scene.prototype );
VISU.scenes.CityStorm.prototype.constructor = VISU.scenes.CityStorm;
}