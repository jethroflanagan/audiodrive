// @TODO remove this. Only for testing.
var Event = require('model/event');
var create = Event.createEvent('tracking session');

return {
	SECTION: create('section'),
	ACTION: create('action'),
}