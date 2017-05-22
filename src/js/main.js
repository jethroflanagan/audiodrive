__DEFAULT_IMPORTS__
// all polyfills
var animationFramePolyfill = require('util/polyfill/animation-frame');
var isArrayPolyfill = require('util/polyfill/is-array');

// from the FED repo
var modernizr = require('Modernizr');
var swipe = require('TouchSwipe');
var slick = require('Slick');

_.templateSettings.variable = 'data';

var App = require('app');
var app = new App();

// EVENTS testing
/*var create = Event.createEvent('test');
var testEvents = {
	one: create('one'),
	two: create('two'),
	three: create('two'),
}


var cb1 = function (e) {
	console.log('listened one', e.data);
}

var cb2 = function (e) {
	console.log('listened two', e.data);
}

var cb3 = function (e) {
	console.log('listened three', e.data);
}
var cb4 = function (e) {
	console.log('AWESOME', e.data);
}

Event.listen(testEvents.one, cb1);
Event.listen(testEvents.one, cb4);

Event.listen(testEvents.two, cb2);

Event.listen(testEvents.three, cb3);

// Event.ignore(testEvents.one, cb1);
Event.ignore(testEvents.one, cb4);
Event.dispatch(testEvents.one, { goodbye: 'now' });
Event.dispatch(testEvents.two, { hello: 'there' });
*/