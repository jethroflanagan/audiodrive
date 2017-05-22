__DEFAULT_IMPORTS__

var SoundEngineTypes = require('model/sound/sound-engine-types');
var ObjectUtils = require('util/object-utils');

// actually namespaced to createjs.X (with multiple other classes, e.g. Sound)
require('SoundJS');
require('SoundJSFlash');
var createjs = window.createjs; // explicit for clarity

var Event = require('model/event');
var FilterTypes = require('model/sound/filter-types');
var StatusEvents = require('event/status-events');
var SoundApiEvents = require('event/sound-api-events');
var Tween = require('util/tween');

var TYPE_SOUND_JS_WEB_AUDIO = SoundEngineTypes.SOUND_JS_WEB_AUDIO;
var TYPE_SOUND_JS_FLASH = SoundEngineTypes.SOUND_JS_FLASH; // no support for filters
var TYPE_FLASH = SoundEngineTypes.FLASH;
var TYPE_WEB_AUDIO = SoundEngineTypes.WEB_AUDIO; // just used to mix with library support

// TODO preloading
// instanceContainer.isPlaying is inaccurate
// TODO switch to streamlined functions that remove switch/if statements for library types, rather generate functions that call code directly for speed/elegance

/**
 * Handle fading for filters and volume here so audio is more optimised (nicer to do in sound-engine, but more than
 * likely results in performance issues).
 *
 */
var SoundApi = Backbone.Model.extend({

	support: null, // TYPE_SOUND_JS_WEB_AUDIO, etc. Only one type of support can be used, so if multiple are available, the best is used.

	/* 
	file loading is tracked here
	shares `id`s with SoundJS manifest
	array of 
	```
	{ 
		file: <String>, 
		instances: { 
			<instanceId>: {

			}
		}
	}
	```
	*/
	files: null, 

	audioContext: null,
	filesToLoad: null,

	initialize: function () {
		Binder.all(this);
		// this.setupEngine();
		this.files = {};

		// Event.dispatch(StatusEvents.SET, { 
		// 	message: 'Support:' + this.support
		// });
	},

	// choose the best sound to be supported
	setupEngine: function () {
		var isSupported = false;

		// web audio
		if (window.AudioContext) {
			this.audioContext = window.AudioContext;
			this.support = TYPE_WEB_AUDIO;
			isSupported = true;
		}
		else if (window.webkitAudioContext) {
			this.audioContext = window.webkitAudioContext;
			this.support = TYPE_WEB_AUDIO;
			isSupported = true;
			window.AudioContext = window.webkitAudioContext;
		}

		// test if SoundJS is supported
		if (createjs.Sound.initializeDefaultPlugins()) { 
			createjs.FlashAudioPlugin.swfPath = "../assets/flashaudio/";
			createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.FlashAudioPlugin]);
			if (this.support == TYPE_WEB_AUDIO) {
				this.support = TYPE_SOUND_JS_WEB_AUDIO;
			}
			else {
				console.error('use Flash fallback');
				this.support = TYPE_SOUND_JS_FLASH;
				// Event.dispatch(SoundApiEvents.NOT_SUPPORTED);
			}
			Event.dispatch(SoundApiEvents.SUPPORTED);
			isSupported = true;
		}
		else {
			Event.dispatch(SoundApiEvents.NOT_SUPPORTED);
			isSupported = false;
		}
	},

	/**
	 * [load description]
	 * @param  {array} sounds	{id: '', path: ''}
	 */
	load: function (sounds) {
		var files = sounds;
		var path = '';
		this.filesToLoad = {
			files: ObjectUtils.deepCopy(files), // gonna get removed per load so don't mess with the original
			total: ObjectUtils.getNumObjectProperties(files),
		};
		// console.log(this.filesToLoad);
		// SoundJS loading
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO:
				var manifest = [];
				for (var prop in files) {
					manifest.push({
						id: prop,
						src: files[prop] + '.ogg',
					});
				}
				
				// load mp3 extension if ogg isn't supported
				createjs.Sound.alternateExtensions = ['mp3'];
				
				createjs.Sound.addEventListener('fileload', function (e) {
					this.onLoaded(e.id, e.src);
				}.bind(this));

				// TODO not working, needs preloadjs
				createjs.Sound.addEventListener('progress', function (e) {
					this.onProgress(e.id, e.src);
				}.bind(this));

				createjs.Sound.registerSounds(manifest, path);
				break;
		}
	},

	onProgress: function (id, file, e) {
		// file is the path. Instances are sounds that are playing/paused/live. They can be of any necessary type per library
		//var sound = { file: file, instances: {} };
		// console.log('loading', id, file, e);
	},	

	onLoaded: function (id, file) {
		// file is the path. Instances are sounds that are playing/paused/live. They can be of any necessary type per library
		var sound = { file: file, instances: {} };
		
		// add in placeholder object for custom library-specific metadata and functions
		sound[this.support] = {};

		this.files[id] = sound;
		delete this.filesToLoad.files[id];

		var remaining = ObjectUtils.getNumObjectProperties(this.filesToLoad.files);
		var percent = (100 - Math.round(remaining / this.filesToLoad.total * 100)) / 100;
		
		Event.dispatch(StatusEvents.SET, { 
			message: 'loaded ' + Math.round(percent * 100) + ' (' + id + ')'
		});
		Event.dispatch(SoundApiEvents.LOADING, { percent: percent, soundId: id, });

		if (remaining == 0) {
			// console.log('files',this.files);
			Event.dispatch(StatusEvents.SET, { message: 'loaded all sounds' });
			Event.dispatch(SoundApiEvents.LOAD_COMPLETE, { percent: percent });
		}
		// TODO remove
		// this.checkDuration(id, file);
	},

	// TODO remove dirty duration test, only for setting up library initially
	checkDuration: function (id, file) {
		this.create(id, 'loaded');
		if (!file) {
			file = id;
		}
		console.log('DURATION MISSING:', file +': ' + (this.getInstance(id, 'loaded').getDuration() / 1000));
	},

	/**
	 * plays a file, adds an instance to the list of instances if one doesn't exist.
	 * @param  {string} soundId   	File id
	 * @param  {string} instanceId	Name of the instance
	 * @param  {float}  [fromTime]	In seconds. Start playing from a specific time
	 */
	play: function (soundId, instanceId, fromTime) {
		var sound = this.getSound(soundId);
		var isExisting = true;
		//create new
		if (!this.getInstance(soundId, instanceId)) {
			this.create(soundId, instanceId);
			isExisting = false;
		}
		var instance = this.getInstance(soundId, instanceId);
		var instanceContainer = this.getInstanceContainer(soundId, instanceId);
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO: 
				// if (instanceContainer.isPlaying) {
				// 	if (!fromTime) {
				// 		fromTime = 0;
				// 	}
				// 	instance.setPosition(fromTime);

				// 	// add filters, etc. again as they get removed by SoundJS (vendor bug)
				// 	// looks weird because it needs to reapply filters to the same sound.
				// 	this.copyFilters(soundId, instanceId, soundId, instanceId);
				// }
				// else {
				// 	if (fromTime) {
				// 		instance.play({ offset: fromTime * 1000 });
				// 	}
				// 	else {
				// 		instance.play();
				// 	}
				// }
				// instanceContainer.isPlaying = true;

				// explicitly not null otherwise 0 will also register as false
				if (fromTime != null) {
					instance.play({ offset: fromTime * 1000 });
					// instance.setPosition(fromTime * 1000 / instance.getDuration());
				}
				else {
					instance.play();
				}
				if (isExisting) {
					// add filters, etc. again as they get removed by SoundJS (vendor bug)
					// looks weird because it needs to reapply filters to the same sound.
					this.copyFilters(soundId, instanceId, soundId, instanceId);
				}
				break;
		}
		// console.log('PLAY:', instanceContainer, fromTime);
		this.addListeners(soundId, instanceId);
	},

	// TODO setup constants for listener types, better setup of remembering listeners
	addListeners: function (soundId, instanceId) {
		var instance = this.getInstance(soundId, instanceId);
		var container = this.getInstanceContainer(soundId, instanceId);
		if (container.listeners['progress'] || container.listeners['complete']) {
			// already added, so ignore
			return;
		}
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO: 
				// notify when complete
				var _this = this;
				var onComplete = function onComplete (e) {
					container.isPlaying = false;
				  	_this.sendSoundComplete(soundId, instanceId);
				};		
				instance.addEventListener('complete', onComplete);

				var progressTracking = {
					type: 'animation frame',
					target: null,
					kill: false,
				};
				var timeoutId = Math.round(Math.random() * 1000);
				var onPlaybackProgress = function () {
					// console.log(timeoutId, '|', progressTracking.kill ? '* ' : '', 'progress', soundId, instanceId);
					if (progressTracking.kill) {
						clearTimeout(timeoutId);
						delete container.listeners['progress'];
						return;
					}
					var progress = instance.getPosition();
					var duration = instance.getDuration();
					Event.dispatch(SoundApiEvents.PLAYBACK_PROGRESS, { 
						soundId: soundId, 
						instanceId: instanceId, 
						progress: progress / duration,
						progressSeconds: progress / 1000, // ms to seconds
					});
					// requestAnimationFrame(onPlaybackProgress);
					setTimeout(onPlaybackProgress, 50); // reduced feedback polling (~20fps)

				};
				onPlaybackProgress();

				// save callbacks for removal
				container.listeners['complete'] = {
					callback: onComplete,
					type: 'js listener',
					target: instance,
				};
				container.listeners['progress'] = progressTracking;

				break;
		}

	},

	// setupPlaybackProgressListener: function (soundId, instanceId) {
	//	var instance = this.getInstance(soundId, instanceId);
	//	switch (this.support) {
	//		case TYPE_SOUND_JS_WEB_AUDIO: 
	//		break;
	//	}
	// },

	removeListeners: function (soundId, instanceId) {
		// console.log('removed', soundId, instanceId);
		var container = this.getInstanceContainer(soundId, instanceId);
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO: 
				delete container.listeners['complete'];
				// clearTimeout(container.listeners['progress'].timeoutId);
				if (container.listeners['progress'] && container.listeners['progress'].hasOwnProperty('kill')) { // sanity check
					container.listeners['progress'].kill = true;
				}
				break;
		}
	},

	/**
	 * sets up a file, adds an instance to the list of instances.
	 * @param  {string} soundId         file id
	 * @param  {string} instanceId name of the instance
	 */
	create: function (soundId, instanceId) {
		var sound = this.getSound(soundId);
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO: 
				if (!this.getInstance(soundId, instanceId)) {
					//create new
					this.setInstance(soundId, instanceId, createjs.Sound.createInstance(sound.file));
				}
				break;
		}
	},

	stop: function (soundId, instanceId) {
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO: 
				this.getInstance(soundId, instanceId).stop();
				this.getInstanceContainer(soundId, instanceId).isPlaying = false;
				this.removeListeners(soundId, instanceId);
				break;
		}
	},

	/**
	 * Get current playback time
	 * @param  {[type]} soundId    [description]
	 * @param  {[type]} instanceId [description]
	 * @return {[type]}            [description]
	 */
	getCurrentTime: function (soundId, instanceId) {
		return this.getInstance(soundId, instanceId).getPosition();
	},

	/**
	 * Stops all sound
	 * @return {[type]} [description]
	 */
	stopMaster: function () {
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO: 
				createjs.Sound.stop(id);
				// @todo isPlaying
				break;
		}
	},

	setMasterVolume: function (volume) {
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO: 
				createjs.Sound.setVolume(volume);
				break;
		}
	},

	setVolume: function (soundId, instanceId, volume, fadeTime, onCompletedFade) {
		if (!instanceId) {
			console.error('No instance supplied');
		}

		var fadeCallback = null; // the function that runs per fade
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO: 
				var instance = this.getInstance(soundId, instanceId);
				if (!fadeTime) {
					instance.setVolume(volume);
				}
				else { 
					fadeCallback = function (params) {
						// console.log('fading', instance, params.volume, volumeFader);
						instance.setVolume(params.volume);
					}
				}
				break;
		}

		// Run the fadeCallback over time
		if (fadeTime) {
			var volumeFader = { 
				volume: this.getVolume(soundId, instanceId) 
			};
			Tween.to(volumeFader, { 
				volume: volume, 
				onUpdate: fadeCallback, 
				onUpdateParams: [volumeFader], 
				onComplete: onCompletedFade,
			}, fadeTime);
		}
	},

	getVolume: function (soundId, instanceId) {
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO: 
				return this.getInstance(soundId, instanceId).getVolume();
		}
		console.error('Cannot find sound');
		return null;
	},
	// addMasterFilter: function (filterId) {
	//	console.log('adding filter');
	//	switch (this.support) {
	//		case TYPE_SOUND_JS_WEB_AUDIO:
	//			var context = createjs.Sound.activePlugin.context;
	//			var filterNode = context.createBiquadFilter();
	//			filterNode.type = filterNode.LOWPASS;
	//			filterNode.frequency.value = 120;
	//			// filterNode.Q.value = 0;
	//			// filterNode.gain.value = 0;
	//			console.log(instance);

	//			// var source1 = context.createBufferSource();
	//			// source1.buffer = instance.sourceNode.buffer
	//			//source1 = bufferList[0];
	//			instance.gainNode.disconnect();
	//			instance.gainNode.connect(filterNode);
	//			filterNode.connect(context.destination);
	//			break;
	//	}
	// },

	addFilter: function (soundId, instanceId, filterId) {
		// Filters removed since we have removed the button. This will stop any calls
		// to filters without rewriting logic elsewhere. Remove the return to add
		// back functionality
		return;
		// console.log('adding filter');
		var instance = this.getInstance(soundId, instanceId);

		// get filter by id and support type
		var filterMeta = FilterTypes[filterId][this.support];
		
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO:
				var context = createjs.Sound.activePlugin.context;
				var filterNode = context.createBiquadFilter();
				filterNode.type = filterMeta.type;
				filterNode.frequency.value = filterMeta.frequency.value;
				filterNode.Q.value = filterMeta.Q.value;
				filterNode.gain.value = filterMeta.gain.value;
				// remove gainNode from destination, and slot in the filterNode, then attach filterNode to destination
				instance.gainNode.disconnect();
				instance.gainNode.connect(filterNode);
				filterNode.connect(context.destination);

				this.addInstanceFilter(soundId, instanceId, filterId, {
					filterNode: filterNode,
					connectedTo: context.destination,
					connectedFrom: instance.gainNode,
					// filterId: filterId,
				});
				break;
		}
	},

	removeFilter: function (soundId, instanceId, filterId) {
		// Filters removed since we have removed the button. This will stop any calls
		// to filters without rewriting logic elsewhere. Remove the return to add
		// back functionality
		return; 
		var filter = this.getInstanceFilter(soundId, instanceId, filterId);
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO:
				// remove the filter from the chain and re-attach the original node
				filter.filterNode.disconnect();
				filter.connectedFrom.connect(filter.connectedTo);
				this.removeInstanceFilter(soundId, instanceId, filterId);
				break;
		}
	},

	/**
	 * Change the name of the instanceId. Used to replace old instanceIds.
	 * @param  {[type]} soundId      [description]
	 * @param  {[type]} instanceId   [description]
	 * @param  {[type]} toInstanceId [description]
	 * @return {[type]}              [description]
	 */
	changeInstanceId: function (soundId, instanceId, toInstanceId) {
		if (this.getInstanceContainer(soundId, instanceId)) {
			console.error('Instance already exists, deleting previous');
			this.deleteInstanceId(soundId, toInstanceId);
		}
		this.getSound(soundId).instances[toInstanceId] = this.getSound(soundId).instances[instanceId];
		// remove old version
		delete this.getSound(soundId).instances[instanceId];
	},

	deleteInstanceId: function (soundId, instanceId) {
		var instance = this.getInstanceContainer(soundId, instanceId);
		if (!instance) {
			console.error('Instance doesn\'t exist');
		}
		// safety measure
		this.stop(soundId, instanceId);
		delete this.getSound(soundId).instances[instanceId];
	},

	copyFilters: function (fromSoundId, fromInstanceId, toSoundId, toInstanceId) {
		var fromInstance = this.getInstanceContainer(fromSoundId, fromInstanceId);

		for (var filterId in fromInstance.filters) {
			this.addFilter(toSoundId, toInstanceId, filterId);
		}
	},

	// Sound container
	getSound: function (soundId) {
		if (this.files[soundId]) {
			return this.files[soundId];
		}
		console.log('Invalid SoundId', soundId);
		return null;
	},

	// TODO clean these helpers up - this is chunky syntax
	getInstance: function (soundId, instanceId) {
		var sound = this.getSound(soundId);
		if (!sound)
			return false;
		var instance = this.getSound(soundId).instances[instanceId];
		if (instance) {
			return instance.libraryInstance;
		}
		return false;

	},

	getInstanceContainer: function (soundId, instanceId) {
		return this.getSound(soundId).instances[instanceId];
	},
	
	setInstance: function (soundId, instanceId, libraryInstance) {
		var instance = this.getInstanceContainer(soundId, instanceId);
		if (instance) {
			console.error('Sound instance already exists');
			return;
		}
		this.getSound(soundId).instances[instanceId] = {
			libraryInstance: libraryInstance,
			filters: {},
			listeners: {}, 
			isPlaying: false,
		};
	},
	
	removeInstance: function (soundId, instanceId) {
	  	delete this.getSound(soundId).instances[instanceId];
	},	

	getInstanceFilter: function (soundId, instanceId, filterId, filter) {
		return this.getInstanceContainer(soundId, instanceId).filters[filterId];
	},

	addInstanceFilter: function (soundId, instanceId, filterId, filter) {
		this.getInstanceContainer(soundId, instanceId).filters[filterId] = filter;
	},

	removeInstanceFilter: function (soundId, instanceId, filterId) {
		delete this.getInstanceContainer(soundId, instanceId).filters[filterId];
	},

	// // for pass by reference
	// getAllInstances: function (id) {
	//	return this.getSound(id).instances;
	// },


	sendSoundComplete: function (soundId, instanceId) {
		Event.dispatch(SoundApiEvents.PLAYBACK_COMPLETE, { soundId: soundId, instanceId: instanceId });
	},

	/**
	 * @param {string} soundId
	 * @param {string} instanceId
	 * @param {float}  time        	in seconds
	 */
	setCurrentTime: function (soundId, instanceId, time) {
		var instance = this.getInstance(soundId, instanceId);

		switch (this.support) {
			case TYPE_SOUND_JS_WEB_AUDIO:
				instance.setPosition(time / instance.getDuration());			
				break;
		}
	},

	getDuration: function (soundId, instanceId) {
		if (!instanceId) {
			// create a temp sound and test duration
			var id = 'testDuration' + new Date().getTime();
			this.create(soundId, id);
			this.getDuration(soundId, id);
			// TODO clean up instance
		}
		var instance = this.getInstance(soundId, instanceId);
		switch (this.support) {
			case TYPE_SOUND_JS_FLASH:
			case TYPE_SOUND_JS_WEB_AUDIO:
				return instance.getDuration();
		}
		return null;
	},
});

return SoundApi;