__DEFAULT_IMPORTS__

var SoundEngineEvents = require('event/sound-engine-events');
var JourneyEvents = require('event/journey-events');
var TrackingEvents = require('event/tracking-events');
var VisualizerEvents = require('event/visualizer-events');
var Tween = require('util/tween');
var TrackingSessionEvents = require('event/tracking-session-events');
var TrackingSections = require('model/tracking/tracking-sections');
var AppMode = require('model/app-mode');

var IntroView = Backbone.View.extend({
	$loadPercent: null,
	$start: null,
	$book: null,
	$skip: null,
	$introLoadedText: null,
	$introText: null,
	isStarting: false,
	hasLoaded: false,

	events: {
		'click .js-start-app': 'start',
		'click .js-book': 'onShowBook',
	},

	initialize: function () {
		Binder.all(this);
		Event.listen(SoundEngineEvents.LOADING, this.onLoading);
		Event.listen(SoundEngineEvents.LOAD_COMPLETE, this.onLoadComplete);	
		$(window).on('resize', this.onResize);
		$(window).on('orientationchange', this.onResize);
		this.resize();

		this.startLoadingTime = new Date().getTime();
		window.addEventListener('beforeunload', this.onUnload);
		$(window).unload(this.onUnload);

		$('.logo').on('touchmove',function(e){
			e.preventDefault();
		});
		$('.splash').on('touchmove',function(e){
			e.preventDefault();
		});

	},

	onUnload: function (e) {
		var time = (new Date().getTime() - this.startLoadingTime) / 1000;
		Event.dispatch(TrackingEvents.EVENT, { page: 'Home', button: 'Loading', detail: this.loadedPercentVal + ' | ' + time + 's' });
	},

	onLoading: function (e) {
		this.getElements();
		this.loadedPercentVal = 'Loading ' + Math.round(e.data.percent * 100) + '%' 
		this.$loadPercent.text(this.loadedPercentVal);
	},
	
	onLoadComplete: function (e) {
		if (this.hasLoaded) {
			return;
		}
		Event.dispatch(TrackingSessionEvents.SECTION, {
			page: TrackingSections.SPLASH,
			session: AppMode.TEST_SPLASH,
		});
		var time = (new Date().getTime() - this.startLoadingTime) / 1000;
		Event.dispatch(TrackingEvents.EVENT, { page: 'Home', button: 'Finished Loading', detail: time + 's' });
		this.hasLoaded = true;
		Event.ignore(SoundEngineEvents.LOADING, this.onLoading);
		Event.ignore(SoundEngineEvents.LOAD_COMPLETE, this.onLoadComplete);	

		this.getElements();
		
		this.$skip.css({ visibility: 'visible' });
		this.showIntroText();

		if (AppMode.IS_DEV) {
			$('.js-skip').click(this.skipIntro);
		}


		// this.$el.find('.js-start').css({ width: 180, paddingLeft: 8, paddingRight: 8 });
	},

	showIntroText: function () {
		// this.$loadPercent.text('');
		var _this = this;

		Tween.to(this.$loadPercent, {opacity: 0}, 0.4);
		Tween.to(this.$introText, {opacity: 0, delay: 0.5, onComplete: function () {
			_this.$introText.css({ display: 'none' });
			_this.$loadPercent.css({ display: 'none' });
		} }, 0.4);

		Tween.to(this.$introLoadedText, {opacity: 1, delay: 1}, 0.4);
		this.$start.css({ visibility: 'visible', opacity: 0 });
		Tween.to(this.$start, { opacity: 1, delay: 1.2 }, 0.4);
		if (AppMode.TEST_SPLASH == 0) {
			this.$book.css({ visibility: 'visible', opacity: 0 });
			Tween.to(this.$book, { opacity: 1, delay: 1.2 }, 0.4);
		}

		if (AppMode.TEST_SPLASH == 1) { 
			$('.js-body').css({ cursor: 'pointer' });
			$('.js-body').click(this.start);
		}
		// this.$start.css({ visibility: 'visible' });
		// this.$start.click(this.start);

	},

	onResize: function (e) {
		this.resize();
	},

	resize: function () {
		var ht = $(window).height();
		$('.js-intro-explainer').css({ lineHeight: ht + 'px' });
		// $('.js-intro-explainer').css({ lineHeight: ht + 'px' });
		var offset = $('.js-form-takeover').offset().top;
		$('.js-form-takeover').css({ height: ht - offset });
	},

	/**
	 * TODO fix this hack
	 */
	getElements: function () {
		if (this.$darken == null) {
			this.$darken = this.$el.find('.js-splash-dark');
		}
		if (this.$loadPercent == null) {
			this.$loadPercent = $('.loading-percent', this.$el);
		}
		if (this.$start == null) {
			var startClass = null;
			switch (AppMode.TEST_SPLASH) {
				case 0:
					startClass = '.js-start-ci';
					break;
				case 1:
					startClass = '.js-start-large';
					$('.js-start-ci').css({ display: 'none' }); // something forces it to visible
					break;
			}
			this.$start = $(startClass, this.$el);
			this.$book = $('.js-book', this.$el);
		}
		if (this.$skip == null) {
			this.$skip = $('.js-skip', this.$el);
		}
		if (this.$introLoadedText == null) {
			this.$introLoadedText = $('.js-intro-loaded-text', this.$el);
		}
		if (this.$introText == null) {
			this.$introText = $('.js-intro-text', this.$el);
		}
	},

	start: function () {
		$('.js-body').css({ cursor: '' });
		$('.js-body').removeClass('is-form');
		Event.dispatch(TrackingEvents.PAGE, { page: 'Console.htm' });
		Event.dispatch(TrackingEvents.EVENT, { page: 'Home', button: 'Start' });

		// a/b testing
		// switch (AppMode.TEST_SPLASH) {
		// 	case 0:
		// 		// Event.dispatch(TrackingEvents.EVENT, { page: 'Version A', button: 'Start the Experience', detail: 'Start Experience' });		

		// 		break;
		// 	case 1:
		// 		// Event.dispatch(TrackingEvents.EVENT, { page: 'Version B', button: 'Start the Experience', detail: 'Start Experience' });			
		// 		break;
		// }
		Event.dispatch(TrackingSessionEvents.ACTION, {
			action: 'Clicked "Start Experience"',
		});

		if (this.isStarting) {
			return;
		}

		this.cleanup();
		// this.skipIntro();
		// return; 

		Event.dispatch(JourneyEvents.START_MASTER);
		// this.showVisualiser();
		// return;
		// 
		// $('.js-footer-view').css({ opacity: 0 });
		Tween.to(this.$start, { opacity: 0 }, 0.5);
		Tween.to(this.$book, { opacity: 0 }, 0.5);
		// Tween.to(this.$skip, { opacity: 0 }, 0.5);
		// this.$el.find('.js-skip').css({ opacity: 0 });
		
		var $headphones = this.$el.find('.js-headphones');
		var $immerse = this.$el.find('.js-immerse');

		this.$darken.css({ display: 'block' });
		Tween.to(this.$darken, { opacity: 1 }, 1);
		// Tween.to($headphones, { opacity: 0.7, onComplete: function () {
		// 	Tween.to($headphones, { opacity: 0.7 }, 0.3);
		// } }, 0.1);
		Tween.to($('.splash'), { 
			opacity: 0, 
			// onComplete: this.showCircleSequence 
		}, 1);

		Tween.to($('.js-splash-logo'), { 
			opacity: 0, 
		}, 1);

		var $explainer = $('.js-intro-explainer');
		Tween.to($explainer, { opacity: 1, delay: 3 }, 1);
		Event.dispatch(JourneyEvents.SHOW_VISUALIZER_INTRO);

		Tween.to($explainer, { opacity: 0, delay: 9.6 }, 1);
		
		setTimeout(function() {
			$('.js-splash-logo').css({ display: 'none' });
			Event.dispatch(JourneyEvents.INTRO_SHOW_KEY);
		}, 4465);

		setTimeout(this.startCar, 6550);
	},

	startCar: function () {
		$(".control-item")
			.removeClass("control-active");

		$('.splash').css({ display: 'none' });

		Event.dispatch(JourneyEvents.INTRO_CAR_STARTED);
		var _this = this;
		setTimeout(function () {
			Event.dispatch(JourneyEvents.INTRO_COMPLETE);
			Tween.to($('.js-intro-explainer'), { opacity: 0, onComplete: function () {
				$('.js-intro-explainer').css({ display: 'none' });
			}});
			setTimeout(_this.showFooter, 8000);
		}, 2000);

	},

	showFooter: function () {
		$('.js-footer-view').css({ display: '', opacity: 1 });
		// Tween.to($('.js-footer-view'), {marginTop: 0, height: 153}, 1 );
		$('.js-footer-menu').css({ opacity: 1 });
		setTimeout(function () {
			Event.dispatch(JourneyEvents.INTRO_COMPLETE_FOOTER);
		}, 800);
	},

	skipIntro: function () {
		console.log('skipped');
		if (this.isStarting) {
			return;
		}
		this.cleanup();
		Event.dispatch(JourneyEvents.SKIP_INTRO);
		// Event.dispatch(JourneyEvents.START_MASTER);
		this.startCar();
	},

	cleanup: function () {
		this.isStarting = true;
		Event.ignore(SoundEngineEvents.LOADING, this.onLoading);
		Event.ignore(SoundEngineEvents.LOAD_COMPLETE, this.onLoadComplete);	
	},

	onShowBook: function (e) {
		$('.js-body')
			.addClass('is-form');

		// a/b
		// Event.dispatch(TrackingEvents.EVENT, { page: 'Version B', button: 'Start the Experience', detail: 'Book a Test Drive' });
		Event.dispatch(TrackingSessionEvents.ACTION, {
			action: 'Clicked "Book a Test Drive"',
			index: 5,
		});

	},
});

return IntroView;