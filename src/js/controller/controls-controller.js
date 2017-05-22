__DEFAULT_IMPORTS__

var SoundEngineEvents = require('event/sound-engine-events');
var JourneyEvents = require('event/journey-events');
var ControlsEvents = require('event/controls-events');
var MasterJourney = require('model/journey/master-journey');
var JourneyScenes = require('model/journey/journey-scenes');
var VisualizerScenes = require('model/visualizer/visualizer-scenes');
var EnvironmentMods = require('model/journey/environment-mods');
var ControlButtons = require('model/controls/control-buttons');
var TrackingEvents = require('event/tracking-events');
// TODO change back to events for engine?

var ControlsController = Backbone.Model.extend({
	journey: null,
	canStartJourney: false,
	view: null,
	state: null,
	delayedUnlockTimeout: null,
	currentJourneyStartTime: 0, 
	currentJourneyTrackingCode: null,

	initialize: function (params) {
		Binder.all(this);
		if (!params.view) {
			console.error('Needs a view');
		}
		this.view = params.view;
		this.state = {
			isNight: false,
			isStormy: false,
			isWindowUp: false,
			isJoyous: false,
			isEngineOff: false,
			scene: null,
		};
		this.view.state = ObjectUtils.deepCopy(this.state);
		Event.listen(SoundEngineEvents.LOAD_COMPLETE, this.onSoundsLoaded);
		Event.listen(JourneyEvents.LOAD_COMPLETE, this.onJourneyLoaded);
		
		this.view.lock();

	},

	onTurnOnAndGo: function (e) {
		this.view.lock();
		// console.log(e.data.scenarioId);
		this.view.setControlActive(ControlButtons.ENGINE, true);
		Event.dispatch(ControlsEvents.SET_SCENE_STATE, { state: EnvironmentMods.ENGINE_OFF, isEnabled: false });
		var _this = this;
		setTimeout(function () {
			// Event.dispatch(ControlsEvents.SET_SCENE, { scene: VisualizerScenes.URBAN });
			_this.view.changeVisualizerToScene(e.data.scenarioId, false, true);
		}, 13000);
		// this.view.flash(e.data.button);
	},

	onLockControls: function (e) {
		this.view.lock();
	},

	onUnlockControls: function (e) {
		this.view.unlock();
	},

	onJourneyLoaded: function (e) {
		// console.log('lo9aded', e.data.journey);
		// this.view.unlockSingle(e.data.journey);
		this.view.setLoadingComplete(e.data.journey);
	},

	onSoundsLoaded: function (e) {
		if (!this.journey) {
			Event.ignore(SoundEngineEvents.LOAD_COMPLETE, this.onSoundsLoaded);
			this.journey = new MasterJourney({ environmentMods: this.state });
			
			Event.listen(JourneyEvents.SHOW_VISUALIZER_INTRO, this.onShowVisualiserIntro);
			Event.listen(JourneyEvents.START_MASTER, this.onStartJourney);
			Event.listen(JourneyEvents.INTRO_CAR_STARTED, this.onIntroCarStarted);
			Event.listen(JourneyEvents.INTRO_SHOW_KEY, this.onIntroShowKey);
			Event.listen(JourneyEvents.INTRO_COMPLETE, this.onIntroComplete);
			Event.listen(JourneyEvents.SCENARIO_STARTED, this.onScenarioStarted);
			// Event.listen(JourneyEvents.STOP, this.onStopJourney);
			Event.listen(JourneyEvents.TURN_ON_AND_GO, this.onTurnOnAndGo);
			Event.listen(JourneyEvents.JOY_COMPLETE, this.onJoyComplete);
			Event.listen(JourneyEvents.WINDOW_COMPLETE, this.onWindowComplete);
			Event.listen(JourneyEvents.THUNDER_COMPLETE, this.onThunderComplete);

			Event.listen(ControlsEvents.SET_SCENE, this.onSetJourneyScene);
			Event.listen(ControlsEvents.SET_SCENE_STATE, this.onSetJourneyState);
			Event.listen(ControlsEvents.LOCK, this.onLockControls);
			Event.listen(ControlsEvents.UNLOCK, this.onUnlockControls);

			Event.listen(JourneyEvents.LOAD_STATUS, this.onLoadStatus);
		}
		this.startJourneyWhenReady();
	},

	getLoadStatus: function () {
		Event.dispatch(JourneyEvents.GET_LOAD_STATUS, { 
			environmentMods: [EnvironmentMods.NIGHT], 
		});
		Event.dispatch(JourneyEvents.GET_LOAD_STATUS, { 
			environmentMods: [EnvironmentMods.DAY], 
		});
		Event.dispatch(JourneyEvents.GET_LOAD_STATUS, { 
			environmentMods: [EnvironmentMods.NIGHT, EnvironmentMods.STORM], 
		});
		Event.dispatch(JourneyEvents.GET_LOAD_STATUS, { 
			environmentMods: [EnvironmentMods.DAY, EnvironmentMods.STORM], 
		});
		Event.dispatch(JourneyEvents.GET_LOAD_STATUS, { 
			environmentMods: [EnvironmentMods.DAY, EnvironmentMods.ENGINE_OFF], 
		});
		Event.dispatch(JourneyEvents.GET_LOAD_STATUS, { 
			environmentMods: [EnvironmentMods.DAY, EnvironmentMods.ENGINE_OFF, EnvironmentMods.STORM], 
		});
		Event.dispatch(JourneyEvents.GET_LOAD_STATUS, { 
			environmentMods: [EnvironmentMods.DAY, EnvironmentMods.ENGINE_OFF], 
		});
		Event.dispatch(JourneyEvents.GET_LOAD_STATUS, { 
			environmentMods: [EnvironmentMods.DAY, EnvironmentMods.ENGINE_OFF, EnvironmentMods.STORM], 
		});
	},

	onShowVisualiserIntro: function (e) {
		// console.log('show');
		// this.view.changeVisualizerToScene(JourneyScenes.FOREST)//, true);
		this.view.showIntro();
	},
	
	onIntroShowKey: function (e) {
		console.log('showing');
		this.view.showControl(ControlButtons.ENGINE);
	},

	onIntroComplete: function (e) {
		this.view.changeVisualizerToScene(JourneyScenes.OCEAN);
	},

	onStartJourney: function (e) {
		this.canStartJourney = true;
		this.startJourneyWhenReady();
	},

	startJourneyWhenReady: function () {
		if (this.journey && this.canStartJourney) {
			this.canStartJourney = false;
			this.journey.start();
		}
	},

	// onStopJourney: function (e) {
	// 	console.log('stop journey');
	// },

	// onTurnOnEffect: function (e) {
	// 	Event.dispatch(JourneyEvents.ADD_ENVIRONMENT_MOD, { effectId: e.data.effectId });
	// },

	// onTurnOffEffect: function (e) {
	// 	Event.dispatch(JourneyEvents.REMOVE_ENVIRONMENT_MOD, { effectId: e.data.effectId });
	// },

	// when the visuals are changed, they cause the audio to change
	onSetJourneyScene: function (e) {
		this.view.lock();
		var scene = e.data.scene;
		var trackingCode = null;
		switch(scene) {
			case VisualizerScenes.URBAN:
				scene = JourneyScenes.URBAN;
				trackingCode = 'City';
				break;
			case VisualizerScenes.OCEAN:
				scene = JourneyScenes.OCEAN;
				trackingCode = 'Wave';
				break;
			case VisualizerScenes.FOREST:
				scene = JourneyScenes.FOREST;
				trackingCode = 'Mountain';
				break;
		}
		this.journey.queueScenario(scene);

		// not first time listening
		if (this.currentJourneyStartTime > 0) {
			var listenTime = (new Date().getTime() - this.currentJourneyStartTime) / 1000;
			Event.dispatch(TrackingEvents.EVENT, { page: 'Console', button: this.currentJourneyTrackingCode + '-Off', detail: listenTime.toString() });
		}
		this.currentJourneyTrackingCode = trackingCode;
		this.currentJourneyStartTime = new Date().getTime();
	},

	onSetJourneyState: function (e) {
		var state = e.data.state;
		var isEnabled = e.data.isEnabled;
		if (state != EnvironmentMods.ENGINE_OFF) {
			this.lockForMoment();
		}
		else {
			// TODO use listeners for this
			this.lockForMoment(isEnabled ? 8000 : 12000);
		}

		console.log('SET_STATE', state, isEnabled);
		// set window up when storm
		if (state == EnvironmentMods.STORM) {
			if (isEnabled) {
				this.view.lockSingle(ControlButtons.STORM);
				this.view.setControlActive(ControlButtons.WINDOW, true);
				// add window as a mod
				Event.dispatch(JourneyEvents.ADD_ENVIRONMENT_MOD, { environmentMod: EnvironmentMods.WINDOW_UP });
			}
			else {
				console.log('locking');
				this.view.lockSingle(ControlButtons.STORM);
				this.view.setControlActive(ControlButtons.WINDOW, false);

				Event.dispatch(JourneyEvents.REMOVE_ENVIRONMENT_MOD, { environmentMod: EnvironmentMods.WINDOW_UP });
			}
		}
		if (state == EnvironmentMods.WINDOW_UP && !isEnabled) {
			// remove storm as a mod only if enabled (otherwise causes issues)
			if (this.view.getControlActive(ControlButtons.STORM)) {
				this.view.setControlActive(ControlButtons.STORM, false);
				Event.dispatch(JourneyEvents.REMOVE_ENVIRONMENT_MOD, { environmentMod: EnvironmentMods.STORM });
			}
			else {
				// Event.dispatch(JourneyEvents.REMOVE_ENVIRONMENT_MOD, { environmentMod: EnvironmentMods.WINDOW_UP });
			}
		}

		if (isEnabled) {
			Event.dispatch(JourneyEvents.ADD_ENVIRONMENT_MOD, { environmentMod: state });
		}
		else {
			Event.dispatch(JourneyEvents.REMOVE_ENVIRONMENT_MOD, { environmentMod: state });
		}

		if (state == EnvironmentMods.JOY) {
			this.view.lockSingle(ControlButtons.JOY);
		}
		else if (state == EnvironmentMods.WINDOW_UP) {
			this.view.lockSingle(ControlButtons.WINDOW);
		}
	},

	onJoyComplete: function (e) {
		this.view.setControlActive(ControlButtons.JOY, false);
		this.view.unlockSingle(ControlButtons.JOY);
	},

	onThunderComplete: function (e) {
		this.view.unlockSingle(ControlButtons.STORM);
	},

	onWindowComplete: function (e) {
		// this.view.setControlActive(ControlButtons.WINDOW, false);
		this.view.unlockSingle(ControlButtons.WINDOW);
		// wait for window down on stopping storm (prevents all audio stopping)
		if (!this.state.isStormy) {
			this.view.unlockSingle(ControlButtons.STORM);
		}
	},

	onIntroCarStarted: function (e) {
		this.view.setControlActive(ControlButtons.ENGINE, true);
	},

	onScenarioStarted: function (e) {
		// required to wait until transition audio is complete! Or it won't
		// play the transition
		var _this = this;
		setTimeout(function () {
			_this.view.unlock();
			_this.view.showAllControls();
		}, 3000);

		// this.getLoadStatus();
	},

	/** only lock for a moment to prevent abuse of controls (multi-click) */
	lockForMoment: function (time) {
		if (!time) {
			time = 1500;
		}

		this.view.lock();
		if (this.delayedUnlockTimeout) {
			clearTimeout(this.delayedUnlockTimeout);
		}

		this.delayedUnlockTimeout = setTimeout(this.view.unlock, time);

	},

	onLoadStatus: function (e) {
		console.log('onLoadStatus', e.data);
	},
});

return ControlsController;