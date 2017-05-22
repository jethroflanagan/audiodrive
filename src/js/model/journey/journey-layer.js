__DEFAULT_IMPORTS__
var SoundLibrary = require('model/sound/sound-library');

var JourneyLayer = Backbone.Model.extend({
	layerId: null,
	soundId: null,
	libraryGroup: null,
	samples: null,
	fadeIn: null,
	fadeOut: null,
	startAfter: null,
	startWith: null,
	delay: null,
	volume: null,
	stop: null,
	keepProgress: false,

	initialize: function (journeyName, config) {
		Binder.all(this);
		_.extend(this, config);
		this.journeyName = journeyName;

		if (config.soundId) {
			this.soundId = this.getLibraryId(config.soundId, config.libraryGroup);
			if (SoundLibrary.getInstance().getSound(this.soundId) == null) {
				console.error('SoundId doesn\'t exist for layer ', i, ':', this.soundId);
			}
		}

		// skip control layers
		if (config.stop) {
			return;
		}

		// works normally for layers without samples or loops. Modified for layers with samples, based on loops, etc.
		this.playbackProgress = 0;
		this.currentPlaybackProgress = 0;
		this.repeatCount = 0;
		this.volume = 1;
		this.duration = SoundLibrary.getInstance().getDuration(this.soundId);
		this.isPlaying = false;

		if (!this.layerId) { 
			this.layerId = this.soundId + '::' + i;
		}
		
		this.instanceId = journeyName + '::' + this.layerId + '::' + new Date().getTime();

		if (this.samples) {
			this.sampleIndex = 0;
			// reset sample counter
			for (var k = 0, numSamples = this.samples.length; k < numSamples; k++) {
				var sample = this.samples[k];
				sample.repeatCount = 0;

				// add in repeat in case
				if (!sample.repeat) {
					sample.repeat = 0;
				}
			}
		}

		// fixes environment to always be a nested array
		if (this.environment) {
			if (!Array.isArray(this.environment)) {
				console.error(this.journeyName + ':' + this.layerId + ' environment must be array');
			} else if (!Array.isArray(this.environment[0])) {
				console.error(this.journeyName + ':' + this.layerId + ' environment must be a nested array');
			}
		}
	},

	getLibraryId: function (fileId, group) {
		return SoundLibrary.getInstance().getSoundId(this.journeyName, group, fileId);
	},


	reset: function () {
		this.playbackProgress = 0;
		if (this.resetNext)
			this.next = ObjectUtils.deepCopy(this.resetNext);
		this.playbackProgress = 0;
		this.currentPlaybackProgress = 0;
		this.repeatCount = 0;
		this.sampleIndex = 0;

		if (!this.samples) {
			return;
		}

		for (var i = 0, len = this.samples.length; i < len; i++) {
			var sample = this.samples[i];
			sample.playbackProgress = 0;
			sample.repeatCount = 0;
		}
	},
});

return JourneyLayer;