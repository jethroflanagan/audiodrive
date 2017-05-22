__DEFAULT_IMPORTS__
var TrackingEvents = require('event/tracking-events');

var TrackingService = Backbone.Model.extend({
	
	initialize: function () {
		Binder.all(this);
		Event.listen(TrackingEvents.PAGE, this.onTrackPage);
		Event.listen(TrackingEvents.EVENT, this.onTrackEvent);
		Event.listen(TrackingEvents.CUSTOM, this.onTrackCustom);
	},

	onTrackEvent: function (e) {
		this.trackEvent(e.data.page, e.data.button, e.data.detail);
	},

	onTrackPage: function (e) {
		this.trackPage(e.data.page);
	},

	onTrackCustom: function (e) {
		this.trackCustom(e.data.index, e.data.name, e.data.value);
	},

	trackEvent: function (page, button, detail) {
		if (detail == null) {
			detail = '';
		}
		console.log('trackEvent', page, button, detail);
		_gaq.push(['_trackEvent', page, button, detail]);
	},

	trackPage: function (page) {
		console.log('trackPage', page);
		_gaq.push(['_trackPageview', page]);
	},

	/**
	 * Uses custom events. Not supporting session as not needed.
	 *
	 * @param  {int} 		index		1-5. This designation is important, any key/value set on this overwrites previous key/values for this variable (per session)
	 * @param  {string} 	name		The key
	 * @param  {string|int} value		
	 */
	trackCustom: function (index, name, value/*, session */) {
		console.log('trackCustom:', index, '|', name, '|', value);
		_gaq.push(['_setCustomVar', index, name, value]);
	},

});

return TrackingService;