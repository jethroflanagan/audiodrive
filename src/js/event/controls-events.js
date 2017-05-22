// @TODO remove this. Only for testing.
var Event = require('model/event');
var create = Event.createEvent('control');

return {
	START_JOURNEY: create('start journey'),
	STOP_JOURNEY: create('stop journey'),
	SET_SCENE: create('turn on effect'),
	SET_SCENE_STATE: create('turn on effect'),
	SET_VOLUME: create('set volume'),
	TURN_OFF_BUTTON: create('turn off button'),
	LOCK: create('lock'),
	UNLOCK: create('unlock'),
	FLASH: create('flash'),
}