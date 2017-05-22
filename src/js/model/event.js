var listeners = [];
var $ = null;

function init(jQuery) {
	$ = jquery;
}

/* PRIVATE */
function runCallback(callback, e, args, includeEvent) {
	//deref args or stacking occurs

	var a = null;
	if (args != undefined)
		a = args.slice();
	else
		a = [];

	if (includeEvent === true)
		a.unshift(e);

	callback.apply(this, a);
}

/**
 *
 * @param eventType
 * @param params:   object
 */
function dispatch(eventType, data) {
	if (eventType == null)
		throw new Error('Event type cannot be undefined');

	var ids = getCallbacks(eventType);

	// console.log(ids[0], 'dispatch', eventType)
	for (var i = 0; i < ids.length; i++) {
		// console.log(ids[i], 'dispatch', eventType)
		var id = ids[i];
		if (!listeners[id]) {
			console.log('no listeners for ', eventType, '(', data, ')');
			console.log(listeners);
			continue;
		}
		var callback = listeners[id].callback;
		callback(new Event(eventType, data));
	}
}

function addListener(eventType, callback) {
	if (!eventType)
		throw new Error('Event type cannot be undefined');
	if (!callback)
		throw new Error('Event callback cannot be undefined');
	var ids = getListeners(eventType, callback);
	if (ids == -1)
		listeners.push({eventType: eventType, callback: callback});
	// console.log(listeners);
}

function removeListener(eventType, callback) {
	var id = getListeners(eventType, callback);
	
	if (id == -1)
		return;
	// listeners.splice(id, 1);
	// Race condition / unable to do mutex lock in JS so use null instead of slice
	listeners[id] = null;
}

/**
 *
 * @param eventType
 * @param callback
 * @return {Number}
 */
function getListeners(eventType, callback) {
	var ids = [];
	for (var i = 0; i < listeners.length; i++) {
		var listener = listeners[i];
		if (listener == null)
			continue;
		if (listener.eventType == eventType && listener.callback == callback) {
			return i;
		}
	}
	return -1;
}
/**
 * @param eventType
 * @return {Number}
 */
function getCallbacks(eventType) {
	var ids = [];
	for (var i = 0; i < listeners.length; i++) {
		var listener = listeners[i];
		if (listener == null)
			continue;
		if (listener.eventType == eventType) {
			ids.push(i);
		}
	}
	// if (ids.length > 0)
	return ids;
}

function Event(eventType, data) {
	this.eventType = eventType;
	this.data = data;
	return this;
}

function EventType(id) {
	this.id = id;
	return this;
}

/**
 for creating event ids.
 do something like
 var create = box.event.createEvent('my event type');

 return {
 		myEvent: create('my event')
 	};
 where 'my event type' can be anything (and is better as an object to prevent collisions)

 or (more formally, and consistently):
 var type = new box.event.EventType('my event type');
 var create = box.event.createEvent(type);

 return {
 		myEvent: create('my event')
 	};

 The event type does not have to be a string. The best and simplest case for non-colliision would be to
 make each type id an empty object ({}). A string is just helpful in debugging.
 */
function createEvent(type) {
	return function (id) {
		return {type: type, id: id};
	};
}

return {
	listen: addListener,
	ignore: removeListener,
	dispatch: dispatch,
	init: init,
	createEvent: createEvent,
	EventType: EventType
};
