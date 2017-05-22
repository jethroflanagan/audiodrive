__DEFAULT_IMPORTS__
var Journey = require('model/journey/journey');
var JourneyGroups = require('model/journey/journey-groups');
var LibraryGroups = require('model/sound/sound-library-groups');
var EnvironmentMods = require('model/journey/environment-mods');
var ScenarioBase = require('model/journey/scenario-base');

var UrbanJourney = ScenarioBase.extend({
	sequence: [
		{
			layerId: 'day',
			soundId: 'day',
			groupId: JourneyGroups.EXTERNAL,
			// libraryGroup: LibraryGroups.DAY,
			environment: [[EnvironmentMods.DAY]],
			keepProgress: true,
			samples: [
				{
					from: 0,
					to: 6.275,
				},
				{
					from: 6.275,
					to: 60,
					repeat: -1,
				},
			],
		},
		{
			layerId: 'dayNoCar',
			soundId: 'day_no_car',
			groupId: JourneyGroups.EXTERNAL,
			environment: [
				[EnvironmentMods.DAY, EnvironmentMods.ENGINE_OFF],
				[EnvironmentMods.DAY, EnvironmentMods.ENGINE_OFF, EnvironmentMods.STORM],
			],
			keepProgress: true,
			samples: [
				{
					from: 0,
					to: 6.275,
				},
				{
					from: 6.275,
					to: 60,
					repeat: -1,
				},
			],
		},
		{
			layerId: 'night',
			soundId: 'night',
			groupId: JourneyGroups.EXTERNAL,
			environment: [[EnvironmentMods.NIGHT]],
			keepProgress: true,
			samples: [
				{
					from: 0,
					to: 18,
				},
				{
					from: 18,
					to: 50,
					repeat: -1,
				},
			],
		},
		{
			layerId: 'nightNoCar',
			soundId: 'night_no_car',
			groupId: JourneyGroups.EXTERNAL,
			environment: [
				[EnvironmentMods.NIGHT, EnvironmentMods.ENGINE_OFF],
			],
			keepProgress: true,
			samples: [
				{
					from: 0,
					to: 18,
				},
				{
					from: 18,
					to: 50,
					repeat: -1,
				},
			],
		},
		{
			layerId: 'dayStorm',
			soundId: 'day_storm',
			groupId: JourneyGroups.INTERNAL,
			environment: [
				[EnvironmentMods.DAY, EnvironmentMods.STORM]
			],
			keepProgress: true,
			samples: [
				{
					from: 0,
					to: 9,
				},
				{
					from: 9,
					to: 44.15,
					repeat: -1,
				},
			],
		},
		{
			layerId: 'nightStorm',
			soundId: 'night_storm',
			groupId: JourneyGroups.INTERNAL,
			environment: [
				[EnvironmentMods.NIGHT, EnvironmentMods.STORM]
			],
			keepProgress: true,
			samples: [
				{
					from: 0,
					to: 17,
				},
				{
					from: 17,
					to: 41,
					repeat: -1,
				},
			],
		},
		{
			layerId: 'nightStormNoCar',
			soundId: 'night_storm_no_car',
			groupId: JourneyGroups.INTERNAL,
			environment: [
				[EnvironmentMods.NIGHT, EnvironmentMods.STORM, EnvironmentMods.ENGINE_OFF]
			],
			keepProgress: true,
			samples: [
				{
					from: 0,
					to: 17,
				},
				{
					from: 17,
					to: 41,
					repeat: -1,
				},
			],
		},
		{
			layerId: 'dayStormNoCar',
			soundId: 'day_storm_no_car',
			groupId: JourneyGroups.INTERNAL,
			environment: [
				[EnvironmentMods.DAY, EnvironmentMods.STORM, EnvironmentMods.ENGINE_OFF]
			],
			keepProgress: true,
			samples: [
				{
					from: 0,
					to: 9,
				},
				{
					from: 9,
					to: 44.15,
					repeat: -1,
				},
			],
		},
		{
			layerId: 'joyDay',
			soundId: 'joy_day',
			groupId: JourneyGroups.EXTERNAL,
		},
		{
			layerId: 'joyNight',
			soundId: 'joy_night',
			groupId: JourneyGroups.EXTERNAL,
		},
		{
			layerId: 'joyDayStorm',
			soundId: 'joy_day_storm',
			groupId: JourneyGroups.EXTERNAL,
		},
		{
			layerId: 'joyNightStorm',
			soundId: 'joy_night_storm',
			groupId: JourneyGroups.EXTERNAL,
		},
	],
	
	name: 'urban',

	initialize: function () {
		Binder.all(this);
		this._super = UrbanJourney.__super__;
		this._super.initialize.apply(this, arguments);
	},

});




return UrbanJourney;