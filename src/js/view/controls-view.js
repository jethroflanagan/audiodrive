__DEFAULT_IMPORTS__

var SoundEngineEvents = require('event/sound-engine-events');
var VisualizerEvents = require('event/visualizer-events');
var VisualizerScenes = require('model/visualizer/visualizer-scenes');
var EnvironmentMods = require('model/journey/environment-mods');
var ControlsEvents = require('event/controls-events');
var JourneyScenes = require('model/journey/journey-scenes');
var ControlButtons = require('model/controls/control-buttons');
var Tween = require('util/tween');
var ProgressBar = require('view/progress-bar');
var TrackingEvents = require('event/tracking-events');
var JourneyEvents = require('event/journey-events');
var FedScripts = require('scripts');
var AppMode = require('model/app-mode');
var TrackingSessionEvents = require('event/tracking-session-events');
var TrackingSections = require('model/tracking/tracking-sections');

var IS_ACTIVE = 'js-is-active';

// @TODO make state entirely controlled by controller
var ControlsView = Backbone.View.extend({
	events: {
		// scenes
		'click .js-control-scene': 'onChangeToScene',
		// effects
		'click .js-control-effect': 'onChangeSceneState',
		// book
		'click .js-control-book': 'onBook',
	},

	state: null,
	sceneId: null,
	visualizerScene: null,
	isLocked: false,
	progressBars: null,
	isShowingInfo: false,
	isIntro: true,
	// loadingButtons: null,

	initialize: function () {
		Binder.all(this);
		Event.dispatch(VisualizerEvents.START);
		// this.loadingButtons = [];

		// this.showIcons(false);
		this.showAllControls(false);
		this.progressBars = {};
		// var progressBar = new ProgressBar(this.getSceneButton('ocean'), 190);
		this.progressBars[JourneyScenes.FOREST] = new ProgressBar(this.getSceneButton('forest'), 190);
		this.progressBars[JourneyScenes.URBAN]  = new ProgressBar(this.getSceneButton('urban'), 190);
		this.lockSingle('forest');
		this.lockSingle('urban');
		Event.listen(JourneyEvents.LOAD_REDUCED_JOURNEYS, this.onLoadReducedJourneys);
		Event.listen(JourneyEvents.LOAD_SINGLE_JOURNEY, this.onLoadSingleJourney);
		$('.information').click(this.showInfo);
		// var progressBar = new ProgressBar(this.getControl('night'), 90);
		// var progressBar = new ProgressBar(this.getControl('storm'), 90);
		// var progressBar = new ProgressBar(this.getControl('window'), 90);
		// var progressBar = new ProgressBar(this.getControl('joy'), 90);
		// var progressBar = new ProgressBar(this.getControl('engine'), 90);

		// this.$el.find('.js-control-effect').css({ visibility: 'hidden' });
		// this.$el.find('.js-control-scene').css({ visibility: 'hidden' });
		$(window).on('orientationchange', this.onResize);
		$(window).on('resize', this.onResize);
		this.resize();

	},
	
	onResize: function (e) {
		this.resize();
	},

	resize: function () {
		// console.log(FedScripts.isFullscreen());
		// if (FedScripts.isFullscreen()) { // mobile mode, handles everything already
		// 	$('.js-controls-location .js-control-item div')
		// 		.width('')
		// 		.height('');
		// 	$('.js-controls-environment .js-control-item div')
		// 		.width('')
		// 		.height('');
		// 	return;
		// }
		// var ht = $('.js-main-view').height();
		// var ratio = ht / 520;
		// if (ratio < 100) {
		// 	var sceneRatio = 90 * ratio;
		// 	$('.js-controls-location .js-control-item div')
		// 		.width(sceneRatio)
		// 		.height(sceneRatio);
		// 	var otherRatio = 70 * ratio;
		// 	$('.js-controls-environment .js-control-item div')
		// 		.width(otherRatio)
		// 		.height(otherRatio);
		// }
	},

	onLoadReducedJourneys: function () {
		this.removeJourney(JourneyScenes.URBAN);
		$('.js-controls-location').addClass('reduced');
	},

	onLoadSingleJourney: function () {
		this.removeJourney(JourneyScenes.URBAN);
		this.removeJourney(JourneyScenes.FOREST);
		$('.js-controls-location').addClass('reduced');
	},

	removeJourney: function (id) {
		var $journey = this.getControl(id);
		$journey.css({ display: 'none' });
		this.progressBars[id].cancel();
	},

	getSceneButton: function (sceneId) {
		return this.$el.find('.js-control-scene[data-scene="' + sceneId + '"]')
	},

	onChangeToScene: function (e) {
		if (this.isLocked) {
			return;
		}
		if ($(e.target).hasClass('lock')) {
			return;
		}
		var scene = $(e.target).data('scene');
		this.trackSceneChange(scene);

		// deal with start and go (only change visuals to new scene when ready)
		// if (!this.state.isEngineOff) {
		// 	Event.dispatch(ControlsEvents.SET_SCENE, { scene: scene });
		// }
		// else {
			this.changeVisualizerToScene(scene);
		// }
	},

	changeVisualizerToScene: function (sceneId, dontNotify, forceEnterScene) {
		if (!forceEnterScene && this.sceneId == sceneId) {
			console.log('in scene already');
			return;
		}
		this.sceneId = sceneId;
		// remove all selected states
		this.$el.find('.js-control-scene')
			.removeClass(IS_ACTIVE)
			.closest('.js-control-item').removeClass('control-active'); // for css

		// force on
		this.$el.find('.js-control-scene[data-scene="' + sceneId + '"]')
			.addClass(IS_ACTIVE)
			.closest('.js-control-item').addClass('control-active'); // for css

		var scene = null;
		switch( sceneId ) {
			case 'urban':
				scene = VisualizerScenes.URBAN;
				break;
			case 'ocean':
				scene = VisualizerScenes.OCEAN;
				break;
			case 'forest':
				scene = VisualizerScenes.FOREST;
				break;
		}
		this.visualizerScene = scene;

		this.updateSceneState();
		if (!dontNotify) {
			Event.dispatch(ControlsEvents.SET_SCENE, { scene: scene });
		}
	},

	trackSceneStateChange: function (trackingCode, isActive) {
		var state = isActive ? 'On' : 'Off';
		Event.dispatch(TrackingEvents.EVENT, { page: 'Console', button: trackingCode + '-' + state });
	},

	trackSceneChange: function (sceneId) {
		var trackingCode = null;
		switch( sceneId ) {
			case 'urban':
				trackingCode = 'City-On';
				break;
			case 'ocean':
				trackingCode = 'Wave-On';
				break;
			case 'forest':
				trackingCode = 'Mountain-On';
				break;
		}
		Event.dispatch(TrackingEvents.EVENT, { page: 'Console', button: trackingCode });
	},

	updateSceneState: function () {
		var scene = this.visualizerScene;
		var state = this.state;
		var sceneState = null;

		// doesn't work the same as the audio, only 3 states
		if (state.isStormy) { // precedence over day/night
			sceneState = scene.STORM;
		}
		else if (state.isNight) {
			sceneState = scene.NIGHT;
		}
		else {
			sceneState = scene.DAY;
		}
		
		Event.dispatch(VisualizerEvents.CHANGE, { scene: sceneState });
	},

	showIntro: function () { 
		Event.dispatch(VisualizerEvents.CHANGE, { scene: VisualizerScenes.INTRO });
	},

	onBook: function (e) {
		// ignore lock
		// don't set isActive on control

		var $button = $(e.target);
		switch ($button.data('book')) {
			case 'twitter': 
				FedScripts.toggleBooking('#book-social');
				break;
			case 'form': 
				FedScripts.toggleBooking('#book-form');
				break;
		}

		// tracking
		if (AppMode.TEST_BOOK == 0 && $button.hasClass('book-twitter--single')) {
			// Event.dispatch(TrackingEvents.EVENT, { page: 'Version A', button: 'Choose a Journey', detail: 'Book a test drive' });
			Event.dispatch(TrackingSessionEvents.ACTION, {
				action: 'Clicked "Console Book a Test Drive"',
				index: 2,
			});
		}
		else if (AppMode.TEST_BOOK == 1) {
			if ($button.hasClass('book-twitter')) {
				// Event.dispatch(TrackingEvents.EVENT, { page: 'Version B', button: 'Choose a Journey', detail: 'Book via contact form' });
				Event.dispatch(TrackingSessionEvents.ACTION, {
					action: 'Clicked "Console Book via Tweet"',
					index: 2,
				});
			}
			else if ($button.hasClass('book-form')) {
				Event.dispatch(TrackingSessionEvents.ACTION, {
					action: 'Clicked "Console Book via Contact Form"',
					index: 3,
				});
			}
		}

	},

	onChangeSceneState: function (e) {
		if (this.isLocked) {
			return;
		}

		var $button = $(e.target);
		if ($button.hasClass('lock')) {
			return;
		}
		var state = this.state;

		// TODO dulicating work, use setControlActive
		// $button.toggleClass(IS_ACTIVE);
		// var isActive = $button.hasClass(IS_ACTIVE);
		// var $buttonParent = $button.closest('.js-control-item')
		
		
		// toggle it
		var isActive = !$button.hasClass(IS_ACTIVE); 
		this.setControlActive($button.data('effect'), isActive);
		var trackingCode = null;
		var environmentMod = null;
		switch( $button.data('effect') ) {
			case 'night': 
				state.isNight = isActive; 
				environmentMod = EnvironmentMods.NIGHT;
				trackingCode = 'Moon'
				break;
			case 'storm': 
				state.isStormy = isActive;
				environmentMod = EnvironmentMods.STORM;
				trackingCode = 'Storm'
				break;
			case 'window': 
				state.isWindowUp = isActive;
				environmentMod = EnvironmentMods.WINDOW_UP;
				trackingCode = 'Window'
				break;
			case 'joy': 
				state.isJoyous = isActive;
				environmentMod = EnvironmentMods.JOY;
				trackingCode = 'Star'
				break;
			case 'engine': 
				isActive = !isActive; // reversed for engine
				state.isEngineOff = isActive; 
				environmentMod = EnvironmentMods.ENGINE_OFF;
				trackingCode = 'Key'
				break;
		}
		this.updateSceneState();
		Event.dispatch(ControlsEvents.SET_SCENE_STATE, { isEnabled: isActive, state: environmentMod });
		this.trackSceneStateChange( trackingCode, isActive );
	},

	// TODO rewrite to work with scenes
	getControl: function (controlId) {
		var effectId = this.getEffectId(controlId);
		var $control = null;
		if (effectId) {
			$control = this.$el.find('.js-control-effect[data-effect="' + effectId + '"]');
		}
		else {
			$control = this.getSceneButton(controlId);
			// console.log('control', $control);
		}

		return $control;
	},

	getControlActive: function (controlId) {
		var $control = this.getControl(controlId);
		return $control.hasClass(IS_ACTIVE);
	},

	setControlActive: function (controlId, isEnabled) {
		var $control = this.getControl(controlId);
		
		// force on
		if (isEnabled) {
			$control
				.addClass(IS_ACTIVE)
				.closest('.js-control-item').addClass('control-active'); // for css
		}
		else {
			$control
				.removeClass(IS_ACTIVE)
				.closest('.js-control-item').removeClass('control-active'); // for css
		}
	},

	getEffectId: function (controlId) {
		switch (controlId) {
			case ControlButtons.ENGINE:
				return 'engine';
				break;
			case ControlButtons.NIGHT:
				return 'night';
				break;
			case ControlButtons.WINDOW:
				return 'window';
				break;
			case ControlButtons.STORM:
				return 'storm';
				break;
			case ControlButtons.ENGINE:
				return 'engine';
				break;
			case ControlButtons.JOY:
				return 'joy';
				break;
			default:
				return;		
		}
	},

	setLoading: function (controlId, loadPercent) {
		// var progressBar = new ProgressBar(this.getSceneButton('ocean'), 190);
		// var progressBar = new ProgressBar(this.getSceneButton('forest'), 190);
		// var progressBar = new ProgressBar(this.getSceneButton('urban'), 190);
	},
	// TODO rewrite
	setLoadingComplete: function (controlId) {
		var $control = this.getControl(controlId);
		if (controlId == 'forest') {
			this.progressBars[JourneyScenes.FOREST].cancel();
		}
		else if (controlId == 'urban') {
			this.progressBars[JourneyScenes.URBAN].cancel();
		}
		// console.log('!!!', $control)
		this.unlockSingle(controlId);
	},

	showControl: function (controlId) {
		// var effectId = this.getEffectId(controlId);
		// var $control = this.$el.find('.js-control-effect[data-effect="' + effectId + '"]').closest('js-control-item');
		var $control = this.getControl(controlId).closest('.js-control-item');
		// $control.css({ visibility: 'visible' });
		// Tween.to($control, { opacity: 1 }, 0.5);
		$control.removeClass('control-hidden');
		//this.showIcons(true);
	},

	showAllControls: function (isVisible) {
		var $controlsScene = this.$el.find('.js-controls-location').find('.js-control-item');
		var $controlsEnvironment = this.$el.find('.js-controls-environment').find('.js-control-item');
		var $controlsBook = this.$el.find('.js-controls-book').find('.js-control-item');
		var $infoTop = this.$el.find('.js-info-helper1');
		var $infoBottom = this.$el.find('.js-info-helper2');
		var $infoBook = this.$el.find('.js-info-helper3');

		var testBookVersion = null;
		// may have multiple
		switch (AppMode.TEST_BOOK) {
			case 0:
				testBookVersion = 'a';
				break;
			case 1:
				testBookVersion = 'b';
				break;
		}
		this.$el.find('.js-controls-book').find('.js-control-item:not(.test-book-' + testBookVersion + ')').css({ display: 'none' });

		if (isVisible == null || isVisible) {
			$controlsScene.removeClass('control-hidden');
			if (this.isIntro) {
				this.isIntro = false;
				$infoTop.removeClass('control-hidden');
				setTimeout(function () {
					$controlsEnvironment.removeClass('control-hidden');
					$infoBottom.removeClass('control-hidden');
				}, 2000);
				setTimeout(function () {
					// only show test versions
					$controlsBook.removeClass('control-hidden');
					// _this.$el.find('.js-controls-book').find('.js-control-item.test-control')
					if (AppMode.TEST_BOOK == 1) {
						$infoBook.removeClass('control-hidden');
					}

					Event.dispatch(TrackingSessionEvents.SECTION, {
						page: TrackingSections.CONSOLE,
						session: AppMode.TEST_BOOK,
					});

				}, 6000);
				setTimeout(function () {
					$infoTop.addClass('control-hidden');
					$infoBottom.addClass('control-hidden');
					$infoBook.addClass('control-hidden');
					$('.js-info-controls').css({ opacity: 1 });
				}, 10000);
			}
			else {
				$controlsEnvironment.removeClass('control-hidden');
			}
			//js-info-helper1
		}
		else {
			$controlsScene.addClass('control-hidden');
			$controlsEnvironment.addClass('control-hidden');
			$controlsBook.addClass('control-hidden');
		}
	},

	showInfo: function () {
		var $infoTop = this.$el.find('.js-info-helper1');
		var $infoBottom = this.$el.find('.js-info-helper2');
		var $infoBook = this.$el.find('.js-info-helper3');

		this.isShowingInfo = !this.isShowingInfo;
		if (this.isShowingInfo) {
			$infoTop.removeClass('control-hidden');
			$infoBottom.removeClass('control-hidden');
			if (AppMode.TEST_BOOK == 1) {
				$infoBook.removeClass('control-hidden');
			}
		}
		else {
			$infoTop.addClass('control-hidden');
			$infoBottom.addClass('control-hidden');
			$infoBook.addClass('control-hidden');
		}
	},

	lock: function () {
		this.isLocked = true;
		// this.$el.find('.js-control-effect').css({ visibility: 'hidden' });
		// this.$el.find('.js-control-scene').css({ visibility: 'hidden' });
		
		// this.showIcons(false);
		this.$el.find('.js-control-item').addClass('lock');
	},
	
	lockSingle: function (controlId) {
		var $control = this.getControl(controlId);
		$control.addClass('lock');
	},

	unlockSingle: function (controlId) {
		var $control = this.getControl(controlId);
		$control.removeClass('lock');
	},

	// showIcons: function (isVisible) {
	// 	var $controlScenes = this.$el.find('.js-control-scene');
	// 	var $controlEffects = this.$el.find('.js-control-effect');
	// 	if (isVisible == null || isVisible) {
	// 		$controlScenes.removeClass('hide-icon');
	// 		$controlEffects.removeClass('hide-icon');
	// 	}
	// 	else {
	// 		$controlScenes.addClass('hide-icon');
	// 		$controlEffects.addClass('hide-icon');
	// 	}
	// },

	unlock: function () {
		this.isLocked = false;
		// this.showAllControls();
		// this.showIcons(true);
		this.$el.find('.js-control-item').removeClass('lock');

	},

});

return ControlsView;