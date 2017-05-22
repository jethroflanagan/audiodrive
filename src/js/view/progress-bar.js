__DEFAULT_IMPORTS__

var Tween = require('util/tween');
// var ButtonEvents = require('event/button-events');

var ProgressBarView = Backbone.View.extend({
	width: 100,
	height: 100,
	radius: 50,
	lineWidth: 4,
	circ: Math.PI * 2,
	quart: Math.PI / 2,
	ctx: null,
	canvas: null,
	percent: 0,
	offset: 0,
	isCanceled: false,
	$canvas: null,

	initialize: function ($target, dimension) {
		Binder.all(this);

		var $canvas = this.$canvas = $('<canvas></canvas>');
		$canvas.addClass('loader');
		$target.append($canvas);

		$canvas.attr('width', dimension);
		$canvas.attr('height', dimension);
		
		this.width = dimension;
		this.height = dimension;
		this.radius = (this.width - this.lineWidth) / 2;

		this.canvas = $canvas[0];
		var ctx = this.ctx = this.canvas.getContext('2d');
		ctx.lineWidth = this.lineWidth;
		ctx.strokeStyle = '#FFF';
		// this.draw(0.5, 0);

		this.draw();
		this.showLoading();
	},

	draw: function() {
		if (this.isCanceled) {
			return;
		}
		var percent = this.percent;
		var offset = this.offset;
		var ctx = this.ctx;
		var canvas = this.canvas;
		ctx.clearRect ( 0 , 0 , this.width, this.height );
		ctx.beginPath();
		ctx.arc(this.width / 2, this.height / 2, this.radius, -(this.quart) + offset * this.circ, ((this.circ) * percent) - this.quart, false);
		ctx.stroke();
	},

	showLoading: function () {
		if (this.isCanceled) {
			return;
		}
		var offset = this.offset + Math.random() * 0.5 + 0.4;
		var percent = offset + Math.random() * 0.5 + 0.3;
		var time = 1.5;
		Tween.to(this, { 
			percent: percent, 
			offset: offset, 
			onUpdate: this.draw, 
			onComplete: this.showLoading,
			ease: Linear.easeNone,
		}, time);
	},

	cancel: function () {
		this.isCanceled = true;
		// this.$canvas.remove();
		this.ctx.clearRect ( 0 , 0 , this.width, this.height );
	},
});
return ProgressBarView;