var Event = require('model/event');
var create = Event.createEvent('sound engine');

return {
	PLAY: create('play'),
	STOP: create('stop'),
	STOP_MASTER: create('stop master'),
	HAS_SET_VOLUME: create('has set volume'), // dispatched when a fade has completed
	SET_VOLUME: create('set volume'),
	SET_MASTER_VOLUME: create('set master volume'),
	ADD_FILTER: create('add filter'),
	REMOVE_FILTER: create('remove filter'),
	PLAYBACK_COMPLETE: create('playback complete'),
	PLAYBACK_PROGRESS: create('playback progress'), // subscribe to this for updates
	PREPARE: create('prepare sound'), // shortcut to create a sound without playing it, allows you to add filters, set the fade in time, set a volume, etc.
	LOADING: create('loading'),
	LOAD_COMPLETE: create('load complete'),
	LOAD_MANIFEST: create('load manifest'),
	GET_DURATION: create('get duration'),
	CHECK_DURATION: create('check duration'), // hack version
	LOAD_ALL: create('load all'), 
}