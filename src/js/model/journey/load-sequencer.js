__DEFAULT_IMPORTS__

var SoundLibrary = require('model/sound/sound-library');
var SoundEngineEvents = require('event/sound-engine-events');
var JourneyEvents = require('event/journey-events');

// TODO distortions
var LoadSequencer = Backbone.Model.extend({
	soundLibrary: null,
	hasLoaded: null,
	toLoad: null,

	initialize: function () {
		Binder.all(this);
		this.soundLibrary = SoundLibrary.getInstance();
		this.hasLoaded = [];
		this.toLoad = [];
		Event.listen(SoundEngineEvents.LOAD_COMPLETE, this.onLoadComplete);
		Event.listen(JourneyEvents.LOAD_SINGLE_JOURNEY, this.onLoadSingleJourney);
		Event.listen(JourneyEvents.LOAD_REDUCED_JOURNEYS, this.onLoadReducedJourneys);
		Event.listen(JourneyEvents.LOAD_ALL_JOURNEYS, this.onLoadAllJourneys);
	},

	/** phone devices */
	onLoadSingleJourney: function () {
		this.toLoad = []; 
		this.soundLibrary.prepareManifest(true);//master and ocean load targetted
	},

	onLoadReducedJourneys: function () {
		console.log('reduced');
		// todo pick
		var pick = Math.random() >= 0.5 ? 'forest' : 'urban';
		this.toLoad = ['forest']; 
		this.soundLibrary.prepareManifest(true);//master and ocean load targetted
	},

	/** only possible on non-phone devices */
	onLoadAllJourneys: function () {
		this.toLoad = [/*'master', 'ocean', */'forest', 'urban'];
		this.soundLibrary.prepareManifest(true);//master and ocean load targetted
	},

	/**
	 * TODO messy
	 */
	onLoadComplete: function (journey) {
		Event.ignore(SoundEngineEvents.LOAD_COMPLETE, this.onLoadComplete);
		Event.dispatch(JourneyEvents.LOAD_COMPLETE, { journey: journey });

		this.hasLoaded.push(journey);
		this.loadNext();
	},

	loadNext: function () {
		if (this.toLoad.length == 0) {
			return;
		}
		
		// console.log(this.soundLibrary.libraryMeta);
		var group = [this.toLoad.shift()];
		console.log('LOAD COMPLETE', group);

		//this.hasLoaded.push(group);
		this.soundLibrary.prepareManifest(false, group);
		Event.listen(SoundEngineEvents.LOAD_COMPLETE, function onLoad () {
			this.onLoadComplete(group);
			Event.ignore(SoundEngineEvents.LOAD_COMPLETE, onLoad);
		}.bind(this));
	},

});

return LoadSequencer;