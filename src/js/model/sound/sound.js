__DEFAULT_IMPORTS__

// var SoundApi = require('model/sound/sound-api');
var SoundLibrary = require('model/sound/sound-library');
var SoundGroups = require('model/sound/sound-groups');

var Sound = Backbone.Model.extend({
	groupId: null,
	soundId: null,
	instanceId: null,

	initialize: function (params) {
		this.groupId = params.groupId;
		this.soundId = params.soundId;
		this.instanceId = params.instanceId;
	},
});