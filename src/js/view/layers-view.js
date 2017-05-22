__DEFAULT_IMPORTS__

var JourneyEvents = require('event/journey-events');
var StatusEvents = require('event/status-events');
var AppMode = require('model/app-mode');


var LayersView = Backbone.View.extend({

	layers: null,
	template: null,

	events: {
	},

	initialize: function () {
		Binder.allExcept(this);
		// Event.listen('showSoundLayers', this.onSetup);
		if (AppMode.IS_DEV) {
			this.setup();
		}
	},

	setup: function () {
		this.layers = [];
		this.template = _.template(	$("script.layer-template").html() );
		$('.test-hider').css({ display: 'block' });
		Event.listen(JourneyEvents.STARTED_LAYER, this.onStarted);
		Event.listen(JourneyEvents.UPDATED_LAYER, this.onUpdated);
		Event.listen(JourneyEvents.STOPPED_LAYER, this.onStopped);
		Event.listen(StatusEvents.SET, this.onStatusEvent);
	},

	onStarted: function (e) {
		this.layers.push({
			journeyId: e.data.journeyId,
			layerId: e.data.layerId,
			duration: e.data.duration,
			progress: e.data.progress,
			startTime: e.data.startTime,
			// volume: e.data.volume,
			isActive: true,
		});
		this.render();
	},

	onUpdated: function (e) {
		var layer = this.getLayerById(e.data.layerId);
		if (!layer) {
			// console.log('x', e.data.layerId);
			return;
		}
		var totalProgress = e.data.progress.total;
		var progress = e.data.progress.current;
		var startTime = layer.startTime;

		layer.progress = Math.round(progress * 10) / 10;
		if (layer.progress % 1 == 0) {
			layer.progress += '.0';
		}
		layer.percent = 'left:' + Math.round(startTime / layer.duration * 100) + '%; \
			width:' + Math.round((progress - startTime) / layer.duration * 100) + '%';
		layer.durationRounded = Math.round(layer.duration * 10) / 10;
		// layer.volume = e.data.volume;
		this.render();
	},
	
	onStopped: function (e) {
		// var layer = this.getLayerById(e.data.layerId);
		// layer.isActive = false;

		for (var i = 0, len = this.layers.length; i < len; i++) {
			if (e.data.layerId == this.layers[i].layerId) {
				this.layers.splice(i, 1);
				break;
			}
		}
		this.render();
	},

	getLayerById: function (layerId) {
		for (var i = 0, len = this.layers.length; i < len; i++) {
			if (layerId == this.layers[i].layerId) {
				return this.layers[i];
			}
		}
		return null;
	},

	render: function() {
		var output = this.template({
			layers: this.layers,
		});
		this.$el.html(output);
	},

	onStatusEvent: function (e) {
		this.setStatus(e.data.message);
	},

	setStatus: function (message) {
		var $log = $('[data-js="status"]');
		$log.text(message + '\n' + $log.text());
	},

});

return LayersView; 