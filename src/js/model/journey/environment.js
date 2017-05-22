__DEFAULT_IMPORTS__

var Environment = Backbone.Model.extend({
	
	isNight: false,
	isStormy: false,
	isEngineOff: false,
	isWindowUp: false,
	isJoyous: false,

	initialize: function (config) {
		Binder.all(this);
		_.extend(this, config);
	},

	getAsList: function () {
		
	},
});

return Environment;