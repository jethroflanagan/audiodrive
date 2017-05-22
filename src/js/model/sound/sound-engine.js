__DEFAULT_IMPORTS__

var SoundApi = require('model/sound/sound-api');
var SoundLibrary = require('model/sound/sound-library');
var SoundEngineEvents = require('event/sound-engine-events');
var SoundApiEvents = require('event/sound-api-events');


// TODO distortions
var SoundEngine = Backbone.Model.extend({
	// sounds: null,
	// distortions: null,
	api: null,

	initialize: function () {
		Binder.all(this);
		Event.listen(SoundEngineEvents.PLAY, this.onPlay);
		Event.listen(SoundEngineEvents.STOP, this.onStop);
		Event.listen(SoundEngineEvents.SET_VOLUME, this.onSetVolume);
		Event.listen(SoundEngineEvents.SET_MASTER_VOLUME, this.onSetMasterVolume);
		Event.listen(SoundEngineEvents.PREPARE, this.onPrepareSound);
		Event.listen(SoundEngineEvents.ADD_FILTER, this.onAddFilter);
		Event.listen(SoundEngineEvents.REMOVE_FILTER, this.onRemoveFilter);
		Event.listen(SoundEngineEvents.LOAD_MANIFEST, this.onLoadManifest);
		Event.listen(SoundEngineEvents.GET_DURATION, this.onGetDuration);
		Event.listen(SoundEngineEvents.CHECK_DURATION, this.onCheckDuration); // for hack version of get (creates file instance)

		Event.listen(SoundApiEvents.PLAYBACK_PROGRESS, this.onPlaybackProgress);
		Event.listen(SoundApiEvents.PLAYBACK_COMPLETE, this.onPlaybackComplete);
		Event.listen(SoundApiEvents.LOADING, this.onLoading);
		Event.listen(SoundApiEvents.LOAD_COMPLETE, this.onLoadComplete);
		
		this.api = new SoundApi();
		this.api.setupEngine();
	},

	setup: function() {
	},

	loadManifest: function (files) {
		this.api.load(files);
	},

	onLoadManifest: function (e) {
		this.loadManifest(e.data.files);
	},

	onGetDuration: function (e) {
		this.api.getDuration(e.data.soundId, e.data.instanceId);
	},

	onCheckDuration: function (e) {
		this.api.checkDuration(e.data.soundId);
	},

	onLoading: function (e) {
		Event.dispatch(SoundEngineEvents.LOADING, { percent: e.data.percent, soundId: e.data.soundId });
	},

	onLoadComplete: function (e) {
		Event.dispatch(SoundEngineEvents.LOAD_COMPLETE);
	},

	onPlay: function (e) {
		this.play(e.data.soundId, e.data.instanceId, e.data.fromTime);
	},
		
	onStop: function (e) {
		this.stop(e.data.soundId, e.data.instanceId);
	},
	
	play: function (soundId, instanceId, fromTime) {
		this.api.play(soundId, instanceId, fromTime);
	},

	stop: function (soundId, instanceId) {
		this.api.stop(soundId, instanceId);
	},

	stopMaster: function () {
		this.api.stopMaster();
	},

	onPlaybackProgress: function (e) {
		Event.dispatch(SoundEngineEvents.PLAYBACK_PROGRESS, { 
			soundId: e.data.soundId, 
			instanceId: e.data.instanceId, 
			progress: e.data.progress,
			progressSeconds: e.data.progressSeconds,
		});
	},

	onPlaybackComplete: function (e) {
		Event.dispatch(SoundEngineEvents.PLAYBACK_COMPLETE, { 
			soundId: e.data.soundId, 
			instanceId: e.data.instanceId 
		});
	},

	/**
	 * Gets a sound ready for playback, without playing it. You can add filters, set the volume, etc.
	 *
	 * @param  {Event} e
	 */
	onPrepareSound: function (e) {
		var soundId = e.data.soundId;
		var instanceId = e.data.instanceId;
		var volume = e.data.volume;
		var fadeTime = e.data.fadeTime;
		var fromTime = e.data.fromTime;

		if (volume === undefined) {
			volume = 1;
		}	
		this.api.create(soundId, instanceId);

		if (fadeTime) {
			this.setVolume(soundId, instanceId, 0);
			this.setVolume(soundId, instanceId, volume, fadeTime);
		}
		else { 
			this.setVolume(soundId, instanceId, volume);
		}

		this.play(soundId, instanceId, fromTime);
	},

	onSetVolume: function (e) {
		this.setVolume(e.data.soundId, e.data.instanceId, e.data.volume, e.data.fadeTime, e.data.onCompletedFade);
	},

	/**
	 * [setVolume description]
	 * @param {string} soundId    
	 * @param {string} instanceId 
	 * @param {float} volume    	0 to 1
	 * @param {float} [fadeTime]	In seconds
	 */
	setVolume: function (soundId, instanceId, volume, fadeTime, onCompletedFade) {
		this.api.setVolume(soundId, instanceId, volume, fadeTime, function () {
			// Event.dispatch(SoundEngineEvents.HAS_SET_VOLUME, { soundId: soundId, instanceId: instanceId, volume: volume });
			if (onCompletedFade && typeof(onCompletedFade) == 'function') {
				onCompletedFade({ soundId: soundId, instanceId: instanceId, volume: volume });
			}
		});
	},

	onSetMasterVolume: function (e) {
		this.setMasterVolume(e.data.volume);
	},

	setMasterVolume: function (volume) {
		this.api.setMasterVolume(volume);
	},

	onAddFilter: function (e) {
		this.addFilter(e.data.soundId, e.data.instanceId, e.data.filterId);
	},

	onRemoveFilter: function (e) {
		this.removeFilter(e.data.soundId, e.data.instanceId, e.data.filterId);
	},

	/**
	 * Filters the target sound instance from FilterTypes.
	 * @param {string} soundId    Sound file id
	 * @param {string} instanceId Instance id in the sound file
	 * @param {string} filterId   Id from FilterTypes
	 * @param {float}  [fadeTime] If included, will fade the filter in
	 */
	addFilter: function (soundId, instanceId, filterId) {
		//this.api.play(soundId, instanceId);
		this.api.addFilter(soundId, instanceId, filterId);
	},

	/**
	 * Simple helper to create a sound for crossfading. Sets volume to zero. Filters can be applied as per normal
	 * @param  {string} soundId   	
	 * @param  {string} instanceId	
	 */
	setupCrossfade: function (soundId, instanceId) {
		this.api.create(soundId, instanceId);
		this.api.setVolume(soundId, instanceId, 0);
	},

	/**
	 * Duplicate a current instance 
	 * @param  {string} soundId    
	 * @param  {string} instanceId   	 
	 * @param  {string} [crossfadeId]	 Will be generated if not included
	 * @return {string} id of the new crossfade
	 */
	setupSyncedCrossFade: function (soundId, instanceId, crossfadeId) {
		if (!crossfadeId)
			crossfadeId = this.createCrossfadeId(instanceId);
		this.api.create(soundId, crossfadeId);
		this.api.setVolume(soundId, crossfadeId, 0);
		var currentTime = this.api.getCurrentTime(soundId, instanceId);

		// duplicate filters onto new instance
		this.api.copyFilters(soundId, instanceId, soundId, crossfadeId);

		// start playback to match current sound time
		this.api.play(soundId, crossfadeId, currentTime);
		return crossfadeId; // needs to be manually deleted/changed later
	},

	createCrossfadeId: function (instanceId) {
		return instanceId + '-cross-' + new Date().getTime();
	},

	// TODO crossfade with proper curves
	crossfade: function(fromSoundId, fromInstanceId, toSoundId, toInstanceId, fadeTime) {
		this.setVolume(fromSoundId, fromInstanceId, 0, fadeTime);
		this.setVolume(toSoundId, toInstanceId, 1, fadeTime);
	},

	/**
	 * fades into the new instance and can replace the original sound with the crossfaded version
	 * @param  {string}  soundId             	
	 * @param  {string}  instanceId          	
	 * @param  {string}  crossfadeId         	
	 * @param  {float}   fadeTime            	In seconds
	 * @param  {boolean} [replaceAfter=false]	Replace original id with crossfaded version (Need to keep number of audio clips in memory limited for mobile)
	 */
	syncCrossfade: function(soundId, instanceId, crossfadeId, fadeTime, replaceAfter) {
		this.crossfade(soundId, instanceId, soundId, crossfadeId, fadeTime);
		if (replaceAfter) {
			var _this = this;
			// TODO add safety to this
			var  timeout = setTimeout(function () {
				_this.api.changeInstanceId(soundId, crossfadeId, instanceId);
				console.log('sound swapped');
			}, Math.ceil(fadeTime * 1000));
		}
	},

	/**
	 * Filters the target sound instance from FilterTypes. If 
	 * @param {string} soundId     		Sound file id
	 * @param {string} instanceId  		Instance id in the sound file
	 * @param {string} filterId    		Id from FilterTypes
	 * @param {float}  [fadeTime=0]		If included, will fade the filter out before removing it
	 */
	removeFilter: function (soundId, instanceId, filterId) {
		this.api.removeFilter(soundId, instanceId, filterId);
	},

});

return SoundEngine;