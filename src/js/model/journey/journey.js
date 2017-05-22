__DEFAULT_IMPORTS__

var SoundEngineEvents = require('event/sound-engine-events');
var JourneyEvents = require('event/journey-events');
var StatusEvents = require('event/status-events');
var SoundLibrary = require('model/sound/sound-library');
var JourneyLayer = require('model/journey/journey-layer');
var ArrayUtils = require('util/array-utils');
var EnvironmentMods = require('model/journey/environment-mods');

var FADE_TIME = 5; // in seconds

// @TODO refactor layers as their own class, add in more functions from journey into layers
var Journey = Backbone.Model.extend({
/**
 * Describe a sequence of audio files playback. 
 * A Journey doesn't work like a normal timeline, so it can't simply track
 * time as it progresses and fire off the next audio layer
 * 
 * 
 * A sequence is a list of layers (each audio track), which can contain 
 * samples (parts of an audio track).
 * ```
 *	{
 *		layerId: 'intro',		// {string}		(optional) Used for referring to
 *								//				a layer from other layers, for timing or
 *								//				stopping a layer
 *												
 *		soundId: 'engineOn',	// {string}  	(optional if using `stop`)
 *		                    	//             	Name of the id in sounds
 *		                    	
 *		libraryGroup: 'common', // {string}		(optional, defaults to 'common)'. The group
 *												for the library file
 *		                    	             	
 *		samples: [          // {object[]}		(optional) list of sections to play.
 *							//					If left out, it plays the full file.
 *							//					If multiple examples are available,
 *							//					the order of playback will always
 *							//					be random. If specific order is needed
 *							//					use multiple layers with the same soundId
 *							//					instead.
 *		    {       	        
 *		        from: 0,	// {float}		time in seconds
 *		        to: 10, 	// {float}		time in seconds
 *		        
 *		        repeat: 0	// {int=0}		(optional) -1 repeats indefinitely, 
 *		        			//				0 means no repeats. Any other number
 *		        			//				is how many times the sample plays for again
 *		        			//				e.g. 1 means it plays *twice* (repeats once)
 *		    },
 *		],
 *		fadeIn: 0          // [{int|object}]
 *						   // fade in time, in seconds
 *		                   // Can also use: {min: int, max: int} 
 *		                   // for variable numbers
 *		                                  		
 *		fadeOut: 0         // {int|object}		(optional) fade out time. If fadeIn
 *		                                  		time of following track is not the
 *		                                  		same, then:
 *		                                  			fadeOut is longer: 
 *		                                  				next clip starts fading in, this 
 *		                                  				fades out (next clip is fully faded 
 *		                                  				in while this is still fading out.
 * 
 *													fadeOut is shorter:
 *														next clip starts fading in, this
 *														clip only begins to fade when 
 *														time remaining for fade in is 
 *														equal to fade out time.
 *
 *		         		               		Goal is to have audio as
 *		         		               		much as possible (less silence)
 *		         		               		e.g 1:
 *		         		               			{id: 'a', fadeOut: 1},
 *		         		               			{id: 'b', fadeIn: 3}
 *		         		               			'b' starts fading in. After 2
 *		         		               			seconds 'a' starts fading out.
 *		         		               			'a' is faded out fully just as
 *		         		               			'b' is fully faded in.
 *		         		               		e.g 2:
 *		         		               			{id: 'a', fadeOut: 3},
 *		         		               			{id: 'b', fadeIn: 1}
 *		         		               			'a' starts fading out, and at
 *		         		               			the same time, 'b' starts fading 
 *		         		               			in. 'a' completes fade out 2
 *		         		               			seconds after 'b' is done.
 *		         		               			
 *		         		               		Can also use: {min: int, max: int} 
 *		         		               		for variable numbers
 *
 *		startTime: 0,	// {float|object}	(optional, in seconds) The time to 
 *		             	                 	start playback (in terms of the 
 *		             	                 	start of the whole sequence).
 *		             	                 	Can also use: {min: int, max: int} 
 *		             	                 	for variable numbers
 *
 *		endTime: 0,		// {float|object}	(optional, in seconds) The time to
 *		           		                 	stop playback, regardless of where
 *		           		                 	we are in the sections
 *		           		                 	Can also use: {min: int, max: int} 
 *		           		                 	for variable numbers
 * 
 *		startAfter: 'door',	// {string}		(optional) the id of another layer. 
 *											This layer will begin playback after
 *											the mentioned layer has finished.
 *											Any delay will add to the wait time.
 *											Cannot be used in conjuntion with
 *											`startWith`
 *
 *		startWith: 'door',	// {string}		(optional) the id of another layer. 
 *											This layer will begin playback at 
 *											the same time as the mentioned layer, 
 *											first waiting for the specified delay 
 *											to elapse.
 *											Cannot be used in conjuntion with
 *											`startAfter`
 *
 *		delay: 0,	// {float|object}		(optional, in seconds) Time to start 
 *											after the the previous layer starts (e.g.  
 *		              	                 	previous plays for 3 seconds, so using 1
 *		              	                 	means that this clips starts 1 second
 *		              	                 	after the previous clip, which continues
 *		              	                 	playing for another 2 seconds.
 *		              	                 	Can also use: {min: int, max: int} 
 *		              	                 	for variable numbers
 *		              	                 	
 *		repeat: 0,		// {int}			(optional) -1 repeats indefinitely, 
 *		        		//					0 means no repeats. Any other number
 *		        		//					is how many times the sample plays
 *      volume: 1, 		// {float}			(optional, default=1) 0 to 1. set the 
 *      									volume to the specified level.
 *
 *		stop: ['footsteps']	// {string[]}	(optional) ignored if false. Stops all
 *		                   	             	soundIds in the list. Uses fadeOut time
 *		                   	             	if specified.
 * 
 * 
 *	},
 *	```
 *
 *  You can listen to JourneyEvents.STARTED_LAYER and JourneyEvents.STOPPED_LAYER.
 *  
 */
	name: null, 		// the name of the journey (required for naming audio instances)
	sceneId: null,		// the scene for looking up files in the library (forest, urban, ocean)
	state: null,		// {day: Boolean, storm: Boolean}
	index: 0, 			// where we are in the sequence

	sequence: null,		// override this
	
	activeLayers: null, // currently playing layers
	activeFilters: null, // any filters in the system that need to be applied to new sounds, groupId=>filtersIds[]
	environmentMods: null,
	activeEnvironmentMods: null,

	initialize: function () {
		Binder.all(this);
		if (!this.name)
			console.error('Name not defined');
		if (!this.sequence)
			console.error('Sequence not defined');
		this.activeLayers = []; 
		this.activeFilters = {}; 
		this.environmentMods = {};
		this.activeEnvironmentMods = {};

		// setup all necessary extra data for the layers 
		for (var i = 0, len = this.sequence.length; i < len; i++) {
			var layer = new JourneyLayer(this.name, this.sequence[i]);
			this.sequence[i] = layer; // overwrite
			this.setupRelatedLayers(layer);

			// layerIds are required for tracking sound instances, so this will generate one if necessary

			// every sound needs a unique instance id. Double colons just so it's easier to read in the console
		}
		// TODO something tidier than this
		for (var i = 0; i < this.sequence.length; i++) {
			var layer = this.sequence[i];
			if (!layer.next) {
				continue;
			}
			layer.resetNext = ObjectUtils.deepCopy(layer.next);
		}

		this.addListeners();
	},

	addListeners: function () {
		Event.listen(JourneyEvents.ADD_FILTER, this.onAddFilterToGroup);
		Event.listen(JourneyEvents.REMOVE_FILTER, this.onRemoveFilterFromGroup);

		Event.listen(SoundEngineEvents.PLAYBACK_COMPLETE, this.onPlaybackComplete);
		Event.listen(SoundEngineEvents.PLAYBACK_PROGRESS, this.onPlaybackProgress);
	},

	removeListeners: function () {
		Event.ignore(JourneyEvents.ADD_FILTER, this.onAddFilterToGroup);
		Event.ignore(JourneyEvents.REMOVE_FILTER, this.onRemoveFilterFromGroup);
		Event.ignore(JourneyEvents.GET_LOAD_STATUS, this.onGetLoadStatus);

		Event.ignore(SoundEngineEvents.PLAYBACK_COMPLETE, this.onPlaybackComplete);
		Event.ignore(SoundEngineEvents.PLAYBACK_PROGRESS, this.onPlaybackProgress);
	},

	setupRelatedLayers: function (layer) {
		if (!layer.next) {
			layer.next = {
				startWith: [], // all layers that will start at the same time as this
				startAfter: [], // all layers that will start after this is complete
			};
		}
		// @TODO this is kinda cludgy
		// Setup related layers so that lookAheads and scheduling is optimised
		var relatedLayer = null;
		if (layer.startWith) {
			relatedLayer = this.getLayerById(layer.startWith);
		}
		if (layer.startAfter) {
			relatedLayer = this.getLayerById(layer.startAfter);
		}
		if (relatedLayer) {
			// console.log(layer.layerId, layer.startWith, relatedLayer.layerId);
			// need to do this in case the relatedLayer is out of sequence
			
			// @todo sort this lameness out
			if (!relatedLayer.next) {
				relatedLayer.next = {
					startWith: [], // all layers that will start at the same time as this
					startAfter: [], // all layers that will start after this is complete
				};
			}

			// Add layer to next of related layer
			// Layers can only startWith or startAfter another layer, but one layer may 
			// have multiple layers startingWith and startingAfter it
			if (layer.startWith) {
				relatedLayer.next.startWith.push(layer); 
			}
			else if (layer.startAfter) {
				relatedLayer.next.startAfter.push(layer);
			}
		}
	},

	/**
	 *
	 * @param  {string} fileId	file name ref in SoundLibraryFiles
	 * @param  {string} group	if left out, it resolves to 'common'
	 * @return {string}        	the id of the sound
	 */
	getLibraryId: function (fileId, group) {
		return SoundLibrary.getInstance().getSoundId(this.name, group, fileId);
	},

	// override this
	start: function () {
		// var layer = this.sequence[0];
		// this.addToActiveLayers(layer);
	}, 

	/**
	 * Layers are added into the system based on a current layer in the system.
	 * Checks if a layer should be scheduled into the system based on current time
	 * 
	 * @param  {object} layer from sequence that is playing
	 */
	lookAhead: function (layer) {
		// skip this if not needed
		if (layer.next.startWith.length == 0 && layer.next.startAfter.length == 0) {
			return;
		}

		var time = this.getPlaybackProgress(layer).total;
		var duration = layer.duration;
		// only look at potential next layers (optimisation)
		var nextLayers = layer.next.startWith;
		for (var i = 0; i < nextLayers.length; i++) {
			var nextLayer = nextLayers[i];
			if (!nextLayer) {
				console.log('error');
				break;
			}
			if (nextLayer.startWith == layer.layerId && !nextLayer.isPlaying) {
				if (!nextLayer.delay || nextLayer.delay <= time) {
					this.addToActiveLayers(nextLayer);
					// @TODO @BUG check these 2 lines
					nextLayers.splice(i, 1); // remove it from next layers
					i--;

					// no break because multiple layers may start with this layer
				}
			}
		}
	},

	removeCompleteLayer: function (completeLayer, ignoreNextLayers) {
		// sanity check
		if (!completeLayer.isPlaying) {
			return;
		}
		this.activeLayers.splice(this.activeLayers.indexOf(completeLayer), 1);
		completeLayer.isPlaying = false;

		var sound = {
			soundId: completeLayer.soundId,
			instanceId: completeLayer.instanceId,
		};

		// in case it's still playing, e.g. for loops
		Event.dispatch(SoundEngineEvents.STOP, sound);
		Event.dispatch(JourneyEvents.STOPPED_LAYER, { layerId: completeLayer.layerId });

		Event.dispatch(StatusEvents.SET, { message: 'Removed layer: ' + completeLayer.layerId });
	
		if (ignoreNextLayers) {
			return;
		}
	
		var layers = this.sequence;
		// add new layers to the sequence if they are affected by this layer
		for (var i = 0, len = layers.length; i < len; i++) {
			var layer = layers[i];
			if (layer.startAfter == completeLayer.layerId) {
				this.scheduleAddToActiveLayers(layer);
			}
		}
	},

	/**
	 * Only schedules based on completion of audio, not progress
	 * 
	 * @param  {Object} layer 	Layer to get added
	 */
	scheduleAddToActiveLayers: function (layer) {
		if (!layer.delay) { // if delay not included, or delay == 0. Ah, the joys of automatic casting
			this.addToActiveLayers(layer);
			return;
		}

		// TODO implement delays getting added (naive approach of setTimeout wouldn't cater for paused audio)
		// Ignores delay for now, but should also consider layer playbackProgress
		this.addToActiveLayers(layer);
	},

	addToActiveLayers: function (layer) {
		if (typeof(layer) == 'string') {
			layer = this.getLayerById(layer);
		}
		// Add only unique layers
		if (!ArrayUtils.pushUnique(this.activeLayers, layer)) {
			return;
		}
		if (!layer.keepProgress) {
			// console.log('reset', layer.layerId);
			layer.reset();
		}

		this.playLayer(layer);

		// lookahead to see if new layers need to be added based on this layer
		var layers = layer.next.startAfter;
		for (var i = 0, len = layers.length; i < len; i++) {
			var inactiveLayer = layers[i];
			if (inactiveLayer.startWith == layer.layerId) {
				layer.next.startAfter.splice(layer, 1); // remove it from next layers
				this.scheduleAddToActiveLayers(inactiveLayer);
				// no break because multiple layers may start after this layer
			}
		}
	},

	/**
	 * Apply filters from the group to new layers
	 * @todo check that filters don't already exist on layer
	 * @param {[type]} layer
	 */
	addCurrentFiltersToLayer: function (layer) {
		if (!this.activeFilters[layer.groupId] || this.activeFilters[layer.groupId].length == 0) {
			return;
		}

		var filterList = this.activeFilters[layer.groupId];
		for (var i = 0, numFilters = filterList.length; i < numFilters; i++) {
			this.addFilter(layer.soundId, layer.instanceId, filterList[i]);
		}
	},

	onAddFilterToGroup: function (e) {
		this.addFilterToGroup(e.data.filterId, e.data.groupId);
	},

	onRemoveFilterFromGroup: function (e) {
		this.removeFilterFromGroup(e.data.filterId, e.data.groupId);
	},

	removeFilterFromGroup: function (filterId, groupId) {
		// this.applyFilterToGroup(e.data.filterId, e.data.groupId);
		var group = this.activeFilters[groupId];
		// no active filters
		if (!group) {
			console.log(filterId, 'filter doesn\'t exist in', this.activeFilters);
			return;
		}
		for (var i = 0, len = group.length; i < len; i++) {
			if (group[i] == filterId) {
				group.splice(i, 1);
				break;
			}
		}

		for (var i = 0, len = this.activeLayers.length; i < len; i++) {
			var layer = this.activeLayers[i];
			if (layer.groupId == groupId) {
				Event.dispatch(SoundEngineEvents.REMOVE_FILTER, { soundId: layer.soundId, instanceId: layer.instanceId, filterId: filterId });
			}
		}
	},

	addFilterToGroup: function (filterId, groupId) {
		// create if necessary
		if (!this.activeFilters[groupId]) {
			this.activeFilters[groupId] = [];
		}
		// already exists, so don't apply again
		if (!ArrayUtils.pushUnique(this.activeFilters[groupId], filterId)) {
			return;
		}
		for (var i = 0, len = this.activeLayers.length; i < len; i++) {
			var layer = this.activeLayers[i];
			// console.log('added filter', groupId, '=>', layer.groupId);
			if (layer.groupId == groupId) {
		
				this.addFilter(layer.soundId, layer.instanceId, filterId);
			}
		}
	},

	addFilter: function (soundId, instanceId, filterId) {
		Event.dispatch(SoundEngineEvents.ADD_FILTER, { soundId: soundId, instanceId: instanceId, filterId: filterId });
	},

	/**
	 * @todo rename to `runLayer` and point at stopLayer/playLayer
	 *
	 * @param  {object} layer
	 */
	playLayer: function (layer) {
		// control layers
		if (layer.stop) {
			// stop all listed layers
			for (var i = 0, len = layer.stop.length; i < len; i++) {
				Event.dispatch(StatusEvents.SET, { message: 'Stopping layer: ' + layer.stop[i] });
				this.stopLayer(this.getLayerById(layer.stop[i]));
			}

			// keep stop layers separate from playing
			return;
		}

		var sound = {
			soundId: layer.soundId,
			instanceId: layer.instanceId,
			fadeTime: layer.fadeIn,
			fromTime: 0,
		};

		// resume layer playback if required
		if (layer.currentPlaybackProgress) {
			// console.log('resuming', layer.currentPlaybackProgress);
			sound.fromTime = layer.currentPlaybackProgress;
			sound.fadeTime = FADE_TIME; // force fade in
		}
		else if (layer.samples) { // TODO support multiple samples
			sound.fromTime = layer.samples[0].from;
		}

		layer.isPlaying = true;
		Event.dispatch(SoundEngineEvents.PREPARE, sound);
		// @TODO add filters into sound instead
		this.addCurrentFiltersToLayer(layer);
		// Event.dispatch(SoundEngineEvents.PLAY, sound);

		Event.dispatch(StatusEvents.SET, { message: 'Added layer: ' + layer.layerId });
		Event.dispatch(JourneyEvents.STARTED_LAYER, { 
			journeyId: this.name,
			layerId: layer.layerId, 
			soundId: layer.soundId,
			progress: sound.fromTime,
			startTime: sound.fromTime,
			duration: SoundLibrary.getInstance().getDuration(layer.soundId),
		});

	},

	/**
	 * @TODO   rename removeCompleteLayer to stopLayer
	 * @alias  removeCompleteLayer
	 * @param  {object} layer 
	 */
	stopLayer: function (layer, ignoreNextLayers) {
		if (typeof(layer) == 'string')
			layer = this.getLayerById(layer);
		this.removeCompleteLayer(layer, ignoreNextLayers);
	},

	/**
	 * @TODO   rename removeCompleteLayer to stopLayer
	 * @alias  removeCompleteLayer
	 * @param  {object} layer 
	 */
	startLayer: function (layer) {
		if (typeof(layer) == 'string')
			layer = this.getLayerById(layer);
		this.addToActiveLayers(layer);
	},

	onPlaybackComplete: function (e) {
		for (var i = 0, len = this.activeLayers.length; i < len; i++) {
			var layer = this.activeLayers[i];
			if (layer.soundId == e.data.soundId && layer.instanceId == e.data.instanceId) {
				// TODO very hacky repeat
				if (layer.samples && layer.samples[layer.sampleIndex].repeat == -1) {
					var sound = {
						soundId: layer.soundId,
						instanceId: layer.instanceId,
						fromTime: layer.samples[layer.sampleIndex].from,
					};
					// safety
					if (!sound.fromTime) {
						sound.fromTime = 0;
					}
					Event.dispatch(SoundEngineEvents.PLAY, sound);
				}
				else {
					this.removeCompleteLayer(layer);
				}
				break;
			}
		}
	},
	
	onPlaybackProgress: function (e) {
		for (var i = 0, len = this.activeLayers.length; i < len; i++) {
			var layer = this.activeLayers[i];
			if (layer.soundId == e.data.soundId && layer.instanceId == e.data.instanceId) {
				if (!layer.isPlaying) {
					console.log('whoops');
					continue;
				}
				var time = e.data.progressSeconds;
				if (layer.samples) {
					var sample = layer.samples[layer.sampleIndex];
					sample.playbackProgress = time;
					sample.currentPlaybackProgress = time;
					if (time >= sample.to) {
						// console.log('progress', e.data.progressSeconds, '|', time);
						var sound = {
							soundId: layer.soundId,
							instanceId: layer.instanceId,
							fromTime: layer.samples[layer.sampleIndex].from,
						};
						// safety
						if (!sound.fromTime) {
							sound.fromTime = 0;
						}

						// increment total time every loop. 
						// TODO fix issue where timestamps repeat
						layer.playbackProgress += time;
						layer.currentPlaybackProgress = time;
						// stop playing if complete
						if (sample.repeat > -1) {
							if (++sample.repeat > sample.repeatCount) {
								layer.sampleIndex++;
								if (layer.sampleIndex >= layer.samples.length) {
									this.removeCompleteLayer(layer);
								}
								// handle multiple samples
								else {
									sound.fromTime = layer.samples[layer.sampleIndex].from;
								}
								break;							
							}
						}
						// replay the sample
						Event.dispatch(SoundEngineEvents.PLAY, sound);
					}
				}
				else {
					layer.playbackProgress = time;
					layer.currentPlaybackProgress = time;
				}
				var progressMeta = this.getPlaybackProgress(layer);
				Event.dispatch(JourneyEvents.UPDATED_LAYER, { 
					layerId: layer.layerId, 
					progress: this.getPlaybackProgress(layer),
				});

				this.lookAhead(layer);
				break;
			}
		}
	},

	/**
	 * @TODO fix bug where time is repeated in loops
	 *
	 * @param  {object} layer
	 * @return {total: float, current: float}  time in seconds for total playback (including loops) and currentplayback (position of playhead)
	 */
	getPlaybackProgress: function (layer) {
		if (layer.samples) {
			return {
				total: layer.playbackProgress + layer.samples[layer.sampleIndex].playbackProgress,
				current: layer.samples[layer.sampleIndex].playbackProgress,
			};
		}
		return {
			total: layer.playbackProgress,
			current: layer.currentPlaybackProgress,
		};
	},
	
	getLayerById: function (layerId) {
		for (var i = 0, len = this.sequence.length; i < len; i++) {
			if (this.sequence[i].layerId == layerId) {
				return this.sequence[i];
			}
		}
		throw new Error('No layer called "' + layerId + '"');
		return null;
	},

	setEnvironmentMod: function (environment, isEnabled) {
		// this.environmentMods.push(environment);
		var allowStopActiveLayers = false;
		switch (environment) {
			case EnvironmentMods.DAY:
				this.environmentMods.isNight = !isEnabled;
				allowStopActiveLayers = true;
				break;
			case EnvironmentMods.NIGHT:
				this.environmentMods.isNight = isEnabled;
				allowStopActiveLayers = true;
				break;
			case EnvironmentMods.STORM:
				this.environmentMods.isStormy = isEnabled;
				allowStopActiveLayers = true;
				break;
			case EnvironmentMods.WINDOW_UP:
				this.environmentMods.isWindowUp = isEnabled;
				allowStopActiveLayers = false;
				break;
			case EnvironmentMods.JOY:
				this.environmentMods.isJoyous = isEnabled;
				break;
			case EnvironmentMods.ENGINE_OFF:
				this.environmentMods.isEngineOff = isEnabled;
				allowStopActiveLayers = true;
				break;
		}
		console.log('adjusted', environment, isEnabled);
		this.transitionToEnvironment(allowStopActiveLayers);
	},

	transitionToEnvironment: function (allowStopActiveLayers) {
		console.log('CAN STOP LAYERS', allowStopActiveLayers);
		// convert to array style for getting layers and add all active environment mods
		var activeMods = [];
		if (this.activeEnvironmentMods.isStormy) {
			activeMods.push(EnvironmentMods.STORM);
		}
		if (this.activeEnvironmentMods.isEngineOff) {
			activeMods.push(EnvironmentMods.ENGINE_OFF);
		}

		if (this.activeEnvironmentMods.isNight) {
			activeMods.push(EnvironmentMods.NIGHT);
		}
		else { // specifically add 'day' if not night
			activeMods.push(EnvironmentMods.DAY);
		}

		this.activeEnvironmentMods = ObjectUtils.deepCopy(this.environmentMods);
		this.startEnvironment();

		// if not stopping layers, then no need to continue
		if (!allowStopActiveLayers) {
			return;
		}
		this.stopLayersWithEnvironment(activeMods, FADE_TIME);
	},

	startEnvironment: function () {
		// console.log('override');
	},
	/**
	 * Environments react for full list
	 *
	 * @param  {array<string>} environmentMods
	 */
	getLayersWithEnvironment: function (environmentMods, fromAllLayers) {
		// force array
		if (typeof(environmentMods) == 'string') {
			environmentMods = [environmentMods];
		}
		var fromLayers = this.activeLayers;
		if (fromAllLayers) {
			fromLayers = this.sequence;
		}
		var layers = [];
		activeLayersLoop:
		for (var i = 0, len = fromLayers.length; i < len; i++) {
			var layer = fromLayers[i];
			if (/*!layer.isPlaying ||*/ !layer.hasOwnProperty('environment')) {
				continue;
			}
			for (var n = 0, numGroups = layer.environment.length; n < numGroups; n++) {
				var group = layer.environment[n];
				if (group.length != environmentMods.length) {
					break;
				}
				var skip = false;
				// layer must have all environments in order to stop
				for (var k = 0, numMods = environmentMods.length; k < numMods; k++) {
					var effect = environmentMods[k];
					if (group.indexOf(effect) == -1) {
						skip = true;
						break;
					}
				}
				if (!skip) {
					layers.push(layer);
					continue activeLayersLoop;
				}
			}
		}

		return layers;
	},

	stopLayersWithEnvironment: function (environmentMods, fadeTime) {
		var layers = this.getLayersWithEnvironment(environmentMods);
		this.stopLayers(layers, fadeTime);
	},

	/**
	 * Hard stop - prevents new layers from spawning on completion
	 *
	 * @param  {[type]} layers
	 * @param  {[type]} fadeTime
	 * @return {[type]}          [description]
	 */
	stopLayers: function (layers, fadeTime) {
		if (!fadeTime)
			fadeTime = 0;
		var _this = this;
		var onCompletedFade = function (sound) {
			for (var i = 0, len = layers.length; i < len; i++) {
				if (layers[i].instanceId == sound.instanceId) {
					_this.stopLayer(layers[i], true);
					// layers.splice(i, 1);
					break;
				}
			}
			// if (layers.length == 0) {
			// 	console.log('done!');
			// }
		}

		for (var i = 0, len = layers.length; i < len; i++) {
			var layer = layers[i];
			// this.stopLayer(layer, true);
			Event.dispatch(SoundEngineEvents.SET_VOLUME, { 
				soundId: layer.soundId, 
				instanceId: layer.instanceId, 
				volume: 0,
				fadeTime: fadeTime, 
				onCompletedFade: onCompletedFade, 
			});
		}
	},

	stopActiveLayers: function (fadeTime) {
		this.stopLayers(this.activeLayers, fadeTime);
	},
	
	reset: function () {
		var layers = this.sequence;
		for (var i = 0, len = layers.length; i < len; i++) {
			layers[i].reset();
		}
	},
});

return Journey;