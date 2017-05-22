var Event = require('model/event');
var create = Event.createEvent('sound api');

return {
	PLAYBACK_COMPLETE: create('playback complete'),
	PLAYBACK_PROGRESS: create('playback progress'),
	LOADING: create('loading'),
	LOAD_COMPLETE: create('load complete'),
	NOT_SUPPORTED: create('not supported'),
	SUPPORTED: create('supported'),
}