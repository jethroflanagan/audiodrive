__DEFAULT_IMPORTS__

// var ButtonsView = require('view/buttons-view');
// var SoundUiController = require('controller/sound-ui-controller');
var FooterView = require('view/footer-view');
var LayersView = require('view/layers-view');
var IntroView = require('view/intro-view');
var ControlsView = require('view/controls-view');
var SoundEngine = require('model/sound/sound-engine');
var SoundEngineEvents = require('event/sound-engine-events');
// todo remove and remap into soundengineevents
var SoundApiEvents = require('event/sound-api-events');
var SoundLibrary = require('model/sound/sound-library');
var ControlsController = require('controller/controls-controller');
var Visualizer = require('visualizer/visualizer-main');
var FedScripts = require('scripts');
var JourneyEvents = require('event/journey-events');
var LoadSequencer = require('model/journey/load-sequencer');
var TrackingService = require('model/tracking/tracking-service');
var TrackingSession = require('model/tracking/tracking-session');
var TrackingEvents = require('event/tracking-events');
// var BrochureView = require('view/brochure-view');
var AppMode = require('model/app-mode');

var AppView = Backbone.View.extend({
	buttonsView: null,
	soundEngine: null,
	isTesting: false,
	visualizer: null,
	introView: null,
	footerView: null,
	controlsView: null,
	trackingService: null,
	brochureView: null,
	isIntroComplete: false,
	$container: null,

	// TODO tidy this up and remove references to some things
	initialize: function () {
		Binder.all(this);
		if (AppMode.IS_DEV) {
			$('.logo').addClass('js-skip');
		}

		this.setupABTesting();

		AppMode.FORM_URL = 'https://app.bmw.co.za/dws/WebContact/MobileBMWTestDriveNoFrame.html?system=F45SOUNDM&model=0000037';
		var formType = this.getQueryVariable('form');
		switch (formType) {
			case '2':
				AppMode.FORM_URL = 'https://app.bmw.co.za/dws/WebContact/MobileBMWTestDriveNoFrame.html?system=F45SOUNDC&model=0000037';
				break;
			case '3':
				AppMode.FORM_URL = 'https://app.bmw.co.za/dws/WebContact/MobileBMWTestDriveNoFrame.html?system=F45MAILER1&model=0000037';
				break;
			case '4':
				AppMode.FORM_URL = 'https://app.bmw.co.za/dws/WebContact/MobileBMWTestDriveNoFrame.html?system=F45MAILER2&model=0000037';
				break;
			case '5':
				AppMode.FORM_URL = 'https://app.bmw.co.za/dws/WebContact/MobileBMWTestDriveNoFrame.html?system=F45MAILER3&model=0000037';
				break;
		}
		$('.js-form-takeover-iframe').attr({ src: AppMode.FORM_URL });
		$('.js-form').attr({ src: AppMode.FORM_URL });
		this.showFormIfRequired(formType);

		this.layersView = new LayersView({ el: '.layers' });
		
		if(!document.addEventListener){
			this.onNotSupported();
		}
		else {
			Event.listen(SoundApiEvents.NOT_SUPPORTED, this.onNotSupported);
			Event.listen(SoundApiEvents.SUPPORTED, this.onSupported);
			this.soundEngine = new SoundEngine();
			
			// TODO REMOVE: for testing
			// Event.ignore(SoundApiEvents.SUPPORTED, this.onSupported);
			// Event.dispatch(SoundApiEvents.NOT_SUPPORTED);
		}		

		$(window).on('orientationchange', this.onResize);
		$(window).on('resize', this.onResize);
		this.resize();
	},
	
	setupABTesting: function () {
		// actual google tracking is done with trackingSession. AppMode, etc. is for simple internal tracking
		var trackingSession = new TrackingSession();

		// GREG OR SCHEEPERS: CHANGE HERE TO ENFORCE A SPECIFIC RESULT
		AppMode.TEST_SPLASH = parseInt(this.getQueryVariable('test-splash'))
		AppMode.TEST_BOOK = parseInt(this.getQueryVariable('test-book'));

		if (isNaN(AppMode.TEST_SPLASH)) {
			AppMode.TEST_SPLASH = (Math.random() > 0.5 ? 1 : 0);
		}
		if (isNaN(AppMode.TEST_BOOK)) {
			AppMode.TEST_BOOK = (Math.random() > 0.5 ? 1 : 0);
		}
		 
		console.log('TEST SPLASH', AppMode.TEST_SPLASH);
		console.log('TEST BOOK', AppMode.TEST_BOOK);

		var testSplash = null;
		var testBook = null;
		// explicit in case we have more than 2 versions
		if (AppMode.TEST_SPLASH == 0) {
			testSplash = 'a';
		}
		else if (AppMode.TEST_SPLASH == 1) {
			testSplash = 'b';
		}
		if (AppMode.TEST_BOOK == 0) {
			testBook = 'a';
		}
		else if (AppMode.TEST_BOOK == 1) {
			testBook = 'b';
		}

		$('.js-body')
			.addClass('is-test-splash-' + testSplash) 
			.addClass('is-test-book-' + testBook);
	},

	onSupported: function (e) {
		console.log('SUPPORTED');
		this.soundLibrary = SoundLibrary.getInstance();
		this.loadSequencer = new LoadSequencer();
		this.trackingService = new TrackingService();
		this.visualizer = new Visualizer();
	
		this.introView = new IntroView({ el: '.js-intro-view' });
		
		this.controlsView = new ControlsView({ el: '.js-controls-view' });
		this.controlsController = new ControlsController({ view: this.controlsView });
		this.footerView = new FooterView({ el: '.js-footer-view' });

		

		$('.test-hider').click(this.toggleTesting);
		$('.js-form-takeover-close').click(this.hideTakeoverForm);
		// Event.listen(SoundEngineEvents.NOT, this.onIntroComplete);
		Event.listen(JourneyEvents.INTRO_COMPLETE_FOOTER, this.onIntroCompleteWithFooter);
		// $(window).on('resize', this.debounce(this.onResize, 100).bind(this));
		// this.$container = $('.js-main-view');
		
		// this.brochureView = new BrochureView({ el: '.js-brochure' });

		// hack to reduce journeys on mobile, tablet
		var isIE9 = navigator.userAgent.match(/MSIE 9\.0/i) !== null;
		if (isIE9) {
			$('html').addClass('is-ie9');
		}

		var isIPhone = navigator.userAgent.match(/iPhone/i) !== null;
		var isIPhone4 = isIPhone && window.screen.height == (960 / 2);
		var isIPad = navigator.userAgent.match(/iPad/i) !== null;

		//****** TODO ipad3
		if (isIPhone4 || isIPad) {
			console.log('SINGLE');
			$('.js-controls-view').addClass('single-journey');
			Event.dispatch(JourneyEvents.LOAD_SINGLE_JOURNEY);
		}
		else if (isIPhone || $(window).width() <= 1024) {
			console.log('REDUCED');
			$('.js-controls-view').addClass('reduced-journey');
			Event.dispatch(JourneyEvents.LOAD_REDUCED_JOURNEYS);
		} 
		else {
			console.log('ALL');
			Event.dispatch(JourneyEvents.LOAD_ALL_JOURNEYS);
		}
	},

	// TODO move this to intro-view
	showFormIfRequired: function (formType) {
		if (formType == null) {
			return;
		}
		$('.js-body').addClass('is-form');
		
	},

	hideTakeoverForm: function (e) {
		$('.js-body').removeClass('is-form');
	},

	getQueryVariable: function (variable) {
		var query = window.location.search.substring(1);
		var vars = query.split('&');
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			if (decodeURIComponent(pair[0]) == variable) {
				return decodeURIComponent(pair[1]);
			}
		}
		return null;
	},

	onIntroCompleteWithFooter: function (e) {
		this.isIntroComplete = true;
		this.resize();
		// disable transition events so resizing continues as per normal after intro
		setTimeout(function () {
			$('#canvas').css({ transition: 'none' });
			$('main').css({ transition: 'none' });
		}, 1600);
	},
	
	onNotSupported: function (e) {
		// console.log('NOT SUPPORTED');
		$('.js-loading').css({ display: 'none' });
		$('.js-body')
			.addClass('is-form');
			// .addClass('outdated-browser');
		$('.js-splash-title').text('This experience is not supported by your browser.');
		$('.js-splash-subtitle').text('To fully immerse yourself, we recommend an upgrade.');

		// prevent starting app
		$('.js-form-takeover-close').remove();
		$('.js-start').remove();
	},

	toggleTesting: function () {
		this.isTesting = !this.isTesting;
		if (this.isTesting) {
			$('.test').show();
		}
		else {
			$('.test').hide();
		}
	},

	onResize: function (e) {
		this.resize();
	},

	resize: function () {
		var ht = $(window).height();
		var wd = $(window).width();
		
		FedScripts.resize();
		if (this.isIntroComplete && !FedScripts.isFullscreen()) {
			ht -= $('footer').outerHeight();
		}
		if (this.visualizer) {
			this.visualizer.resize(wd, ht);
		}
		if (!this.$container) {
			this.$container = $('.js-main-view')
		}
		this.$container.css({ height: ht });
	},

	debounce: function(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this;
			var args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) {
					func.apply(context, args);
				}
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
				func.apply(context, args);
			}
		};
	}
});

return AppView;