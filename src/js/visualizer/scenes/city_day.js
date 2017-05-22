var VISU = require('visualizer/visu');
return function () {
VISU.scenes.CityDay = function () {

	VISU.Scene.call( this );

	//BACKGROUND LAYER
	var background = new VISU.Layer( this );
	background.loadImage( "sea", "/city/day/background.jpg" );
	background.draw = function( ctx, t, avg ) {
		ctx.globalAlpha = 0.35 * this.presence;
		this.x -= 10;
		this.fill( ctx, this.images["sea"], this.x, -Math.random() * 10, 1 );
	};

	//LIGHTS LAYER
	var lights = new VISU.Layer( this );
	lights.loadImage( "bokeh_blue", "/city/day/bokeh_blue.jpg" );
	lights.loadImage( "bokeh_cream", "/city/day/bokeh_cream.jpg" );
	lights.loadImage( "bokeh_cream2", "/city/day/bokeh_cream.jpg" );
	lights.loadImage( "bokeh_green", "/city/day/bokeh_green.jpg" );
	lights.loadImage( "bokeh_light_blue", "/city/day/bokeh_light_blue.jpg" );
	lights.loadImage( "bokeh_red", "/city/day/bokeh_red.jpg" );
	lights.randomImage = function() {
		var ret;
	    var c = 0;
	    for (var key in this.images)
	        if (Math.random() < 1/++c)
	           ret = this.images[key];
	    return ret;
	};
	lights.z = 2;
	lights.particles = [];
	for (var i = 40; i >= 0; i--) {
		var p = new VISU.Particle( lights );
		p.x = -1000;

		p.spawn = function( ctx ) {
			this.image = lights.randomImage();
			this.x = (ctx.canvas.width * 0.75) + (Math.random() * (ctx.canvas.width * 0.25));
			this.y = (ctx.canvas.height / 2) + ((Math.random() - 0.5) * 150);
			this.opacity = (0.05 + Math.random()) * 0.05;
			this.scale = (5 + Math.random()) * 0.06;
			this.vX = 0.1;
			this.step = (this.y - (ctx.canvas.height / 2)) * 0.002;
		};

		p.draw = function( ctx, t ) {
			if ( this.x < -100 ) {
				this.spawn( ctx );
			}

			this.vX *= 1.03;
			this.x -= this.vX;
			this.y += this.step;
			this.step *= 1.02;
			this.scale *= 1.0045;
			this.opacity *= 1.02;
			this.opacity = this.opacity > 1 ? 1 : this.opacity;
			
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha = this.opacity * this.layer.presence * ( 0.1 + (Math.random() * 0.9));
			ctx.drawImage(this.image, this.x + Math.random() * 5, this.y + Math.random() * 5, this.image.width * this.scale, this.image.height * this.scale);
		};
		lights.particles.push(p);
	}
	lights.draw = function( ctx, t, avg ) {
		for( var i = 0 ; i < this.particles.length * this.presence * this._clamp(17/avg); i++ ) {
			var p = this.particles[i];
			p.draw( ctx, t );
		}
	};

	//FOREGROUND LAYER
	var foreground = new VISU.Layer( this );
	foreground.loadImage( "foreground", "/city/day/foreground.jpg" );
	foreground.z = 3;
	foreground.draw = function( ctx, t, avg ) {
		ctx.globalAlpha = 0.6 * this.presence;
		ctx.globalCompositeOperation = "lighter";
		this.fill( ctx, this.images["foreground"], -Math.random() * 10, -Math.random() * 10, 1 );
	};

	//BLUR LAYER
	var blur = new VISU.Layer( this );
	blur.z = 4;
	blur.draw = function( ctx, t, avg ) {
		ctx.globalAlpha = 0.5 * this.presence;
		//ctx.globalCompositeOperation = "lighter";
		for (var i = 2; i >= 0; i--) {
			//ctx.drawImage( ctx.canvas, -3, -1, ctx.canvas.width + 3, ctx.canvas.height + 2 );
		};
	};


	this.addLayer( background );
	this.addLayer( lights );
	this.addLayer( foreground );
	//this.addLayer( blur );
	
};

VISU.scenes.CityDay.prototype = Object.create( VISU.Scene.prototype );
VISU.scenes.CityDay.prototype.constructor = VISU.scenes.CityDay;
}