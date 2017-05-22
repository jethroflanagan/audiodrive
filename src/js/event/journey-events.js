var Event = require('model/event');
var create = Event.createEvent('journey');
return {
	QUEUE: create('queue journey'),
	LOAD_COMPLETE: create('load complete'),
	LOAD_ALL_JOURNEYS: create('load all journeys'), // warning will crash on mobile phones
	LOAD_REDUCED_JOURNEYS: create('load reduced journeys'), // for mobile phones, some tablets
	LOAD_SINGLE_JOURNEY: create('load single journey'), // for iPhone and minimal
	
	START: create('start journey'),
	STOP: create('stop journey'),
	START_MASTER: create('start journey'),
	SCENARIO_STARTED: create('scenario started'),
	
	ADD_FILTER: create('add filter'),
	REMOVE_FILTER: create('remove filter'),
	
	STARTED_LAYER: create('started layer'),
	STOPPED_LAYER: create('stopped layer'),
	UPDATED_LAYER: create('updated layer'),
	
	ADD_ENVIRONMENT_MOD: create('start effect'),
	REMOVE_ENVIRONMENT_MOD: create('stop effect'),

	INTRO_CAR_STARTED: create('intro car started'),
	SHOW_VISUALIZER_INTRO: create('show visualizer intro'),
	INTRO_SHOW_KEY: create('show key'),
	INTRO_COMPLETE: create('intro complete'),
	INTRO_COMPLETE_FOOTER: create('intro complete with footer'),
	SKIP_INTRO: create('skip intro'),
	
	GET_LOAD_STATUS: create('get load status'),
	LOAD_STATUS: create('load status'),
	
	TURN_ON_AND_GO: create('turn on and go'), // when stopped and trying to travel
	JOY_COMPLETE: create('joy complete'), // finish joy audio
	WINDOW_COMPLETE: create('window complete'), // finish window up/down audio
	THUNDER_COMPLETE: create('thunder complete'), // finish thunder audio
}