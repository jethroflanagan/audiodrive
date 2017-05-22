// @TODO remove this. Only for testing.
var Event = require('model/event');
var create = Event.createEvent('tracking');

return {
	PAGE: create('page'),
	EVENT: create('event'),
	CUSTOM: create('event'),
}