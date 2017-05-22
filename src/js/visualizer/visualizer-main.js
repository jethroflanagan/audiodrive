__DEFAULT_IMPORTS__
/**
 * Backbone wrapper for the Visualiser (built using prototype chains)
 */

var VISU = require('visualizer/visu');
var stage = require('visualizer/stage');
var scene = require('visualizer/scene');
var layer = require('visualizer/layer');
var particle = require('visualizer/particle');
var forest_day = require('visualizer/scenes/forest_day');
var forest_night = require('visualizer/scenes/forest_night');
var forest_storm = require('visualizer/scenes/forest_storm');
var sea_day = require('visualizer/scenes/sea_day');
var sea_night = require('visualizer/scenes/sea_night');
var sea_storm = require('visualizer/scenes/sea_storm');
var city_day = require('visualizer/scenes/city_day');
var city_night = require('visualizer/scenes/city_night');
var city_storm = require('visualizer/scenes/city_storm');
var intro = require('visualizer/scenes/intro');

var VisualizerEvents = require('event/visualizer-events');

var VisualizerView = Backbone.View.extend({
	stage: null, 

	initialize: function () {
		Binder.all(this);
		
		// run code (only creates on init)
		stage();
		scene();
		layer();
		particle();
		forest_day();
		forest_night();
		forest_storm();
		sea_day();
		sea_night();
		sea_storm();
		city_day();
		city_night();
		city_storm();
		intro();

		Event.listen(VisualizerEvents.START, this.onStart);
	},

	onStart: function (e) {
		this.stage = new VISU.Stage( "canvas" );
		// this.resize($(window).width(), $(window).height());

		Event.listen(VisualizerEvents.CHANGE, this.onChange);
	},

	onChange: function (e) {
		// return;
		this.stage.switchTo(e.data.scene);
	},

	// onResize: function (e) {
	// 	// TODO do this with debounce and also via height/width params
	// 	this.resize(e.data.width, e.data.height);
	// },

	resize: function (width, height) {
		var $canvas = $('#canvas');


		// fill area
		var canvasAspect = 350 / 700;
		var wd = width;
		var ht = width * canvasAspect;

		// use height instead when aspect ratio of browser requires it
		if (height / width > canvasAspect) {
			var wd = height / canvasAspect;
			var ht = height;
		}

		// center it in the window
		var offsetX = (width - wd) / 2;
		var offsetY = (height - ht) / 2;

		$canvas.width(wd);
		$canvas.height(ht);
		$canvas.css({ left: offsetX, top: offsetY });
	},
});

return VisualizerView;