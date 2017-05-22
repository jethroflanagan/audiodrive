__DEFAULT_IMPORTS__
var Journey = require('model/journey/journey');
var JourneyGroups = require('model/journey/journey-groups');
var LibraryGroups = require('model/sound/sound-library-groups');
var EnvironmentMods = require('model/journey/environment-mods');
var ScenarioBase = require('model/journey/scenario-base');

var OceanJourney = ScenarioBase.extend({
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
					to: 9,
				},
				{
					from: 9,
					to: 45,
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
					to: 9,
				},
				{
					from: 9,
					to: 45,
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
					to: 11,
				},
				{
					from: 11,
					to: 45,
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
					to: 11,
				},
				{
					from: 11,
					to: 45,
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
					to: 6,
				},
				{
					from: 6,
					to: 46,
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
					to: 8,
				},
				{
					from: 8,
					to: 40,
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
					to: 8,
				},
				{
					from: 8,
					to: 40,
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
					to: 6,
				},
				{
					from: 6,
					to: 46,
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
	
	name: 'ocean',

	initialize: function () {
		Binder.all(this);
		this._super = OceanJourney.__super__;
		this._super.initialize.apply(this, arguments);
	},

});


return OceanJourney;