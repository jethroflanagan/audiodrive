__DEFAULT_IMPORTS__
var TrackingSessionEvents = require('event/tracking-session-events');
var TrackingEvents = require('event/tracking-events');
var TrackingSections = require('model/tracking/tracking-sections');

/**
 * Tracks custom events for A/B testing.
 * 
 */
var TrackingSession = Backbone.Model.extend({
	// [{
	// 	page: TrackingSections.LoadingScreen, 
	// 	session: 0|1,
	// }, ...]
	sections: null, 

	initialize: function () {
		Binder.all(this);
		this.sections = [];
		Event.listen(TrackingSessionEvents.SECTION, this.onTrackSection);
		Event.listen(TrackingSessionEvents.ACTION, this.onTrackAction);
	},

	onTrackSection: function (e) {
		var page = e.data.page;
		var session = page.sessions[e.data.session];
		// if (this.sections.indexOf(name) > -1) {
		// 	console.error('Tracking the same section');
		// }
		this.sections.push({
			page: page,
			session: session,
		});

		this.trackAction('assigned');
		// Event.dispatch(TrackingEvents.EVENT, { page: page.name, button: page.name + ' ' + session + ' assigned' });
	},

	onTrackAction: function (e) {
		this.trackAction(e.data.action, e.data.index);
	},

	/**
	 * Tracks custom variables for A/B testing
	 *
	 * @param  {string} 			action		The event that occurs, e.g. Click button X
	 * @param  {int} 				[index]		Index can be overridden from the default value
	 */
	trackAction: function (action, index) {
		var sections = this.sections;
		if (!Array.isArray(sections)) {
			sections = [sections];
		}
		var key = '';
		for (var i = 0, len = sections.length; i < len; i++) {
			key += sections[i].page.name + ' ' + sections[i].session;
			if (i < len - 1) {
				key += ' --> ';
			}
		}

		key = key.trim();

		var currentSection = sections[sections.length - 1]; // latest section is current section
		
		if  (index == null) {
			index = currentSection.page.index; // custom variables require an index. 
		}
		var value = key + ': ' + action;
		Event.dispatch(TrackingEvents.CUSTOM, {
			index: index,
			name: currentSection.page.name, 
			value: value,
		});
		
		Event.dispatch(TrackingEvents.EVENT, { page: currentSection.page.name, button: value });
	},
});

return TrackingSession;