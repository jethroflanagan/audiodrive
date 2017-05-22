// @TODO remove this. Only for testing.
var Event = require('model/event');
var create = Event.createEvent('visualizer');

return {
	CHANGE: create('change visualizer'),
	START: create('start visualizer'),
	RESIZE: create('resize visualizer'),
}