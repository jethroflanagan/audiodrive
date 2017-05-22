__DEFAULT_IMPORTS__

var ControlsEvents = require('event/controls-events');
var JourneyEvents = require('event/journey-events');
var Tween = require('util/tween');
var TrackingEvents = require('event/tracking-events');
var SoundControlView = require('view/sound-control-view');
var EnvironmentMods = require('model/journey/environment-mods');
var FedScripts = require('scripts');
var AppMode = require('model/app-mode');
var TrackingSessionEvents = require('event/tracking-session-events');

var FooterView = Backbone.View.extend({
	// $bookText: null,
	soundControl: null,

	events: {
		'click .js-open-book-form': 'onOpenForm',
		'click .js-open-book-tweet': 'onOpenTwitter',
		'click .js-open-share': 'onOpenShare',
		'click .js-share-twitter': 'onShareTwitter',
		'click .js-share-facebook': 'onShareFacebook',
		'click .js-open-brochure': 'onOpenBrochure',
		'click .js-open-site-link': 'onOpenSiteLink',
		'click .js-book-tweet': 'onBookTwitter',
		// 'click .js-twitter-book': 'onBook',
	},
	initialize: function () {
		Binder.all(this);
		// $('.js-twitter-book').click(this.onBook);
		// this.$bookText = $('.js-book-footer-text');
		// setTimeout(changeCopy, 5000);
		Event.listen(JourneyEvents.INTRO_COMPLETE_FOOTER, this.onChangeCopy);
		this.soundControl = new SoundControlView({ el: '.js-sound' });
		// not contained in actual footer
		$('.js-information-icon').click(this.onInfoIcon);

		Event.listen(ControlsEvents.SET_SCENE_STATE, this.onSetSceneState);
		
	},

	onSetSceneState: function (e) {
		// if (e.data.state == EnvironmentMods.ENGINE_OFF && e.data.isEnabled) {
		// 	FedScripts.toggleBooking('#book-social');
		// }
	},

	onChangeCopy: function (e) {
		var $text = $('.js-book-footer-text');
		Tween.to($text, { opacity: 0, delay: 10, onComplete: function () {
			$text.text('Book a test drive.');
			Tween.to($text, { opacity: 1 }, 1);
		} }, 1);
	},

	onOpenForm: function (e) {
		Event.dispatch(TrackingEvents.EVENT, { page: 'Console', button: 'Open Book Via Contact Form' });
		Event.dispatch(TrackingEvents.PAGE, { page: 'Book-Form.htm' });
		Event.dispatch(TrackingSessionEvents.ACTION, {
			action: 'Clicked "Footer Book via Contact Form"',
			index: 4,
		});

		var $form = $('.js-form');
		if ($form.attr('src') == '') {
			$('.js-form').attr({ 
				src: AppMode.FORM_URL + window.parent.location.search 
			});
		}
	},

	onOpenTwitter: function (e) {
		Event.dispatch(TrackingEvents.PAGE, { page: 'Book-Tweet.htm' });
		Event.dispatch(TrackingEvents.EVENT, { page: 'Console', button: 'Open Book With Tweet' });
		Event.dispatch(TrackingSessionEvents.ACTION, {
			action: 'Clicked "Footer Book with a Tweet"',
			index: 4,
		});

	},
	
	onBookTwitter: function (e) {
		Event.dispatch(TrackingEvents.EVENT, { page: 'Book With A Tweet', button: 'Submit Tweet' });
	},
	
	onOpenShare: function (e) {
		Event.dispatch(TrackingEvents.EVENT, { page: 'Console', button: 'Open Book Share' });
		Event.dispatch(TrackingEvents.PAGE, { page: 'Share.htm' });
	},
	
	onShareTwitter: function (e) {
		Event.dispatch(TrackingEvents.EVENT, { page: 'Share', button: 'Twitter' });
	},
	
	onShareFacebook: function (e) {
		Event.dispatch(TrackingEvents.EVENT, { page: 'Share', button: 'Facebook' });
	},
	
	onOpenBrochure: function (e) {
		Event.dispatch(TrackingEvents.EVENT, { page: 'Console', button: 'Open Brochure' });
		Event.dispatch(TrackingEvents.PAGE, { page: 'Brochure/Design.html' });
	},

	onOpenSiteLink: function (e) {
		Event.dispatch(TrackingEvents.EVENT, { page: 'Console', button: 'BMW Site Link' });
	},

	onInfoIcon: function (e) {
		Event.dispatch(TrackingEvents.EVENT, { page: 'Console', button: 'Help' });
	},
});

return FooterView;