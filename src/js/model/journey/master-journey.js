__DEFAULT_IMPORTS__
var Journey = require('model/journey/journey');
var JourneyScenes = require('model/journey/journey-scenes');
var ForestJourney = require('model/journey/forest-journey');
var OceanJourney = require('model/journey/ocean-journey');
var UrbanJourney = require('model/journey/urban-journey');
var JourneyEvents = require('event/journey-events');
var StatusEvents = require('event/status-events');
var JourneyGroups = require('model/journey/journey-groups');
var EnvironmentMods = require('model/journey/environment-mods');
var ControlsEvents = require('event/controls-events');
var ControlButtons = require('model/controls/control-buttons');

var SCENARIO_FADE_TIME = 3;
var STOP_FADE_TIME = 3; // stopping car

var MasterJourney = Journey.extend({
	sequence: [
		{
			layerId: 'walkToCar',
			soundId: 'walk_to_car',
			groupId: JourneyGroups.INTERNAL,
		},
		{
			layerId: 'windowUp',
			soundId: 'window_up',
			groupId: JourneyGroups.INTERNAL,
		},		
		{
			layerId: 'thunder',
			soundId: 'thunder',
			groupId: JourneyGroups.INTERNAL,
		},		
		{
			layerId: 'windowDown',
			soundId: 'window_down',
			groupId: JourneyGroups.INTERNAL,
		},		
		{
			layerId: 'startCar',
			soundId: 'start_car',
			groupId: JourneyGroups.INTERNAL,
		},		
		{
			layerId: 'stopCar',
			soundId: 'stop_car',
			groupId: JourneyGroups.INTERNAL,
		},		
		{
			layerId: 'startCarStorm',
			soundId: 'start_car_storm',
			groupId: JourneyGroups.INTERNAL,
		},		
		{
			layerId: 'stopCarStorm',
			soundId: 'stop_car_storm',
			groupId: JourneyGroups.INTERNAL,
		},		
		{
			layerId: 'transition',
			soundId: 'car_scene_transition',
			groupId: JourneyGroups.EXTERNAL,
		},		
		{
			layerId: 'transition_storm',
			soundId: 'car_scene_transition_storm',
			groupId: JourneyGroups.INTERNAL,
		},		

	],

	name: 'master', 
	scenario: null,
	canStartScenario: false,
	hasStartedScenario: false,
	hasStartedCar: false,
	transitionLayerId: null,
	nextScenario: null,
	isNextScenarioTransitioning: false,
	previousScenarios: null,

	initialize: function (config) {
		Binder.all(this);
		this._super = MasterJourney.__super__;
		this._super.initialize.apply(this, arguments);
		if (!config || !config.environmentMods) {
			console.error('Missing config');
		}
		this.environmentMods = config.environmentMods;
		this.previousScenarios = {};

		Event.listen(JourneyEvents.START, this.onStartScenario);
		Event.listen(JourneyEvents.STARTED_LAYER, this.onStartedLayer);
		Event.listen(JourneyEvents.UPDATED_LAYER, this.onUpdatedLayer);
		Event.listen(JourneyEvents.STOPPED_LAYER, this.onStoppedLayer);
		Event.listen(JourneyEvents.ADD_ENVIRONMENT_MOD, this.onStartMod);
		Event.listen(JourneyEvents.REMOVE_ENVIRONMENT_MOD, this.onStopMod);
		Event.listen(JourneyEvents.SKIP_INTRO, this.onSkipIntro);
	},

	start: function () {
		var layer = this.getLayerById('walkToCar');
		this.addToActiveLayers(layer);

		// this.loadPriorityFiles();
	},
	
	onSkipIntro: function () {
		// TODO start with forest journey
		var layer = this.getLayerById('walkToCar');
		layer.samples = [{
			from: 10,
			to: 12,
			repeat: 0,
		}];
		this.start();
	},

	onStartScenario: function (e) {
		this.queueScenario(e.data.journey);
		// this.loadPriorityFiles();
	},

	queueScenario: function (scenarioId) {
		if (this.activeEnvironmentMods.isEngineOff) {
			Event.dispatch(JourneyEvents.TURN_ON_AND_GO, { scenarioId: scenarioId });
			return;
		}
		var scenario = null;
		if (!this.previousScenarios.hasOwnProperty(scenarioId)) {
			switch (scenarioId) {
				case JourneyScenes.FOREST:
					scenario = new ForestJourney();
					break;
				case JourneyScenes.OCEAN:
					scenario = new OceanJourney();
					break;
				case JourneyScenes.URBAN:
					scenario = new UrbanJourney();
					break;
			}
			this.previousScenarios[scenarioId] = scenario;
		}
		else {
			scenario = this.previousScenarios[scenarioId];
			scenario.addListeners(); // re-add these since they were removed on stop
		}
		// already running a scenario
		if (this.scenario) {
			this.transitionToScenario(scenario);
		}
		else {
			this.scenario = scenario;
			this.startScenario();
		}
	},

	/**
	 * Starts playing if ready
	 *
	 * @return {[type]} [description]
	 */
	startScenario: function () {
		// console.log('generic start');
		if (this.scenario && this.canStartScenario) {
			this.hasStartedScenario = true;
			// @todo deep copy until this can be handled separately per journey/or through master filters
			this.scenario.start();
			Event.dispatch(StatusEvents.SET, { message: 'starting scenario' });
			Event.dispatch(JourneyEvents.SCENARIO_STARTED);
		}
	},

	/**
	 * For changing state variables, use onStartMod or onStopMod
	 * for more complex changes/functions
	 * 
	 * @param {[type]}  environment [description]
	 * @param {Boolean} isEnabled   [description]
	 */
	setEnvironmentMod: function (environment, isEnabled) {
		// this.environmentMods.push(environment);
		var allowStopActiveLayers = false;
		switch (environment) {
			case EnvironmentMods.STORM:
				this.environmentMods.isStormy = isEnabled;
				allowStopActiveLayers = true;
				break;
			case EnvironmentMods.WINDOW_UP:
				this.environmentMods.isWindowUp = isEnabled;
				break;
			case EnvironmentMods.ENGINE_OFF:
				this.environmentMods.isEngineOff = isEnabled;
				break;
			// case EnvironmentMods.JOY:
			//  this.environmentMods.isEngineOff = isEnabled;
			// 	break;
		}
		this.transitionToEnvironment(allowStopActiveLayers);
	},


	onStartedLayer: function (e) {
	},

	onUpdatedLayer: function (e) {
		// todo neater
		var layer = null;// = this.getLayerById(e.data.layerId);
		if (!this.hasStartedScenario && e.data.layerId == 'walkToCar') {
			layer = this.getLayerById(e.data.layerId);
			if (this.getPlaybackProgress(layer).total > 10) {
			 	this.canStartScenario = true;
 				// console.log('EXISTS',this.scenario, this.activeFilters);
 				this.scenario.activeFilters = ObjectUtils.deepCopy(this.activeFilters);
				this.scenario.environmentMods = ObjectUtils.deepCopy(this.environmentMods);
			 	this.startScenario();
			 	// this.stopLayer('suburb');
			 }
		}

		if (!this.isNextScenarioTransitioning && e.data.layerId == this.transitionLayerId) {
			layer = this.getLayerById(e.data.layerId);
			if (this.getPlaybackProgress(layer).current > 4) {
				this.isNextScenarioTransitioning = true;
				this.scenario = this.nextScenario;
				this.nextScenario = null;
				this.startScenario();
			}
		}

	},

	onStoppedLayer: function (e) {
		if (e.data.layerId == this.getLayerById('windowUp').layerId ||
			e.data.layerId == this.getLayerById('windowDown').layerId) {
			// console.log('go window');
			Event.dispatch(JourneyEvents.WINDOW_COMPLETE);
		}
		else if (e.data.layerId == this.getLayerById('thunder').layerId) {
			// console.log('go window');
			Event.dispatch(JourneyEvents.THUNDER_COMPLETE);
		}
		// if (e.data.layerId == this.transitionLayerId) {
		// 	console.log('transition complete');

		// 	this.scenario = this.nextScenario;
		// 	this.nextScenario = null;
		// 	this.startScenario();
		// 	// Event.dispatch(ControlsEvents.UNLOCK);
		// }
	},

	onStartMod: function (e) {
		// console.log('start effect', e.data.environmentMod, this.environmentMods);

		var environmentMod = e.data.environmentMod;
		this.setEnvironmentMod(environmentMod, true);
		var canSetModInScenario = true;
		switch (environmentMod) {
			case EnvironmentMods.STORM:
				this.startLayer('thunder');
				break;
			case EnvironmentMods.WINDOW_UP:
				this.startLayer('windowUp');
				canSetModInScenario = false;
				setTimeout(function () { 
					Event.dispatch(JourneyEvents.ADD_FILTER, { filterId: 'window', groupId: JourneyGroups.EXTERNAL });
				}, 6700);
				break;
			case EnvironmentMods.ENGINE_OFF:
				this.startLayer('stopCar' + (this.environmentMods.isStormy ? 'Storm' : ''));
				canSetModInScenario = false;
				this.scenario.stopActiveLayers(STOP_FADE_TIME);
				// TODO do this more safely in onStopped
				setTimeout(function() {
					this.scenario.setEnvironmentMod(environmentMod, true);
				}.bind(this), 6000);
				break;
			case EnvironmentMods.JOY:
				canSetModInScenario = false;
				this.scenario.playJoy();//startLayer('joyDay');

				break;
		}
		if (canSetModInScenario) {
			this.scenario.setEnvironmentMod(environmentMod, true);
		}

	},

	onStopMod: function (e) {
		var environmentMod = e.data.environmentMod;
		this.setEnvironmentMod(environmentMod, false);
		var canSetModInScenario = true;
		switch (environmentMod) {
			case EnvironmentMods.WINDOW_UP:
				this.startLayer('windowDown');
				canSetModInScenario = false;
				setTimeout(function () { 
					Event.dispatch(JourneyEvents.REMOVE_FILTER, { filterId: 'window', groupId: JourneyGroups.EXTERNAL });
				}, 500);
				break;
			case EnvironmentMods.ENGINE_OFF:
				this.startLayer('startCar' + (this.environmentMods.isStormy ? 'Storm' : ''));
				canSetModInScenario = false;
				this.scenario.stopActiveLayers(STOP_FADE_TIME);
				// TODO do this more safely in onStopped
				setTimeout(function() {
					this.scenario.setEnvironmentMod(environmentMod, false);
				}.bind(this), 12000);
				break;
			// case EnvironmentMods.STORM:
			// 	console.log('stop storm');
			// 	this.stopLayer('rain', true);
			// 	break;
		}
		if (canSetModInScenario) {
			this.scenario.setEnvironmentMod(environmentMod, false);
		}
		
	},

	transitionToScenario: function (scenario) {
		this.isNextScenarioTransitioning = false;
		// Event.dispatch(ControlsEvents.LOCK);
		scenario.activeFilters = ObjectUtils.deepCopy(this.scenario.activeFilters);
		scenario.environmentMods = ObjectUtils.deepCopy(this.scenario.environmentMods);
		scenario.activeEnvironmentMods = ObjectUtils.deepCopy(this.scenario.activeEnvironmentMods);

		this.stopScenario();
		this.nextScenario = scenario;

		this.transitionLayerId = 'transition' //+ this.scenario.name + '_to_' + scenario.name;
		if (this.activeEnvironmentMods.isStormy) {
			this.transitionLayerId += '_storm';
		}
		var layer = this.getLayerById(this.transitionLayerId);
		layer.reset();
		this.startLayer(this.transitionLayerId);
	},

	stopScenario: function () {
		this.scenario.stopActiveLayers(SCENARIO_FADE_TIME);
		this.scenario.reset();
		this.scenario.removeListeners();
	},
});


return MasterJourney;