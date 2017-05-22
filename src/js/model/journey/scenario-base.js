__DEFAULT_IMPORTS__

var Journey = require('model/journey/journey');
var JourneyEvents = require('event/journey-events');
var SoundEngineEvents = require('event/sound-engine-events');
var SoundLibrary = require('model/sound/sound-library');

var ScenarioBase = Journey.extend({
	joyLayer: null,

	initialize: function () {
		Binder.all(this);
		this._super = ScenarioBase.__super__;
		this._super.initialize.apply(this, arguments);
		this.loadPriorityFiles();

	},

	start: function () {
		this.startEnvironment();
		this.addListeners();
	},

	removeListeners: function () {
		this._super.removeListeners.apply(this);
		Event.ignore(JourneyEvents.GET_LOAD_STATUS, this.onGetLoadStatus);
	},

	addListeners: function () {
		this._super.addListeners.apply(this);
		Event.listen(JourneyEvents.GET_LOAD_STATUS, this.onGetLoadStatus);
	},

	startEnvironment: function () {
		var mods = this.activeEnvironmentMods;
		var isNight = mods.isNight;
		var isStormy = (mods.isStormy);
		var isEngineOff = (mods.isEngineOff);
		var layerId = '';
		if (isStormy) {
			if (isNight) {
				layerId = 'nightStorm';
			}
			else {
				layerId = 'dayStorm';
			}
		}
		else {
			if (isNight) {
				layerId = 'night';
			}
			else {
				layerId = 'day';
			}
		}
		if (isEngineOff) {
			layerId += 'NoCar';
		}
		// if (this.isJoyous) {
		// 	console.log('joy');
		// }
		// console.log(mods, 'layer to add', layerId);
		this.addToActiveLayers(layerId);
	},
	
	// todo	neater so not just a dupe of startEnvironment
	playJoy: function () {
		var mods = this.activeEnvironmentMods;
		var isNight = mods.isNight;
		var isStormy = (mods.isStormy);

		var layerId = '';
		if (isStormy) {
			if (isNight) {
				layerId = 'NightStorm';
			}
			else {
				layerId = 'DayStorm';
			}
		}
		else {
			if (isNight) {
				layerId = 'Night';
			}
			else {
				layerId = 'Day';
			}
		}
		// if (this.isJoyous) {
		// 	console.log('joy');
		// }
		layerId = 'joy' + layerId;
		this.joyLayer = this.getLayerById(layerId);
		this.addToActiveLayers(layerId);
		Event.listen(JourneyEvents.STOPPED_LAYER, this.onJoyComplete);
	},
	
	onJoyComplete: function (e) {
		console.log('onJoyComplete', e.data);
		if (e.data.layerId == this.joyLayer.layerId) {
			Event.ignore(JourneyEvents.STOPPED_LAYER, this.onJoyComplete);
			this.joyLayer = null;
			Event.dispatch(JourneyEvents.JOY_COMPLETE);
		}
	},

	isLoading: function (soundId) {
		return SoundLibrary.getInstance().isLoading(soundId);
	},

	isLoaded: function (soundId) {
		return SoundLibrary.getInstance().isLoaded(soundId);
	},

	onLoading: function (e) {
		// console.log('loading', e.data.environmentMods);
		// console.log(this.getLayersWithEnvironment(e.data.environmentMods));
	},

	onGetLoadStatus: function (e) {
		// console.log('CHECK LOAD', e.data);
		console.log('loading', e.data.environmentMods);
		var layers = this.getLayersWithEnvironment(e.data.environmentMods, true);
		for (var i = 0; i < layers.length; i++) {
			console.log('\t',layers[i].layerId);
		}
	},

	loadPriorityFiles: function () {
		for (var i = 0, len = this.sequence.length; i < len; i++) {
			var layer = this.sequence[i];
			var soundId = layer.soundId;
			if (!this.isLoaded(soundId) && this.isLoading(soundId)) {
				SoundLibrary.prepareManifest(soundId);
			}
		}
	},
});

return ScenarioBase;