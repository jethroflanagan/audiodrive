var TweenMax = require('TweenMax');
/**
 * Wrapper to easily swap out tween engine as needed - or reference it from elsewhere
 */
return {
	/**
	 * Tween something to a set of properties
	 * @param  {String|String[]} targets	Uses jQuery (or similar) to select
	 * @param  {Object} properties      	e.g. { top: '100px', width: '100%' }
	 * @param  {float} time             	Number of seconds
	 * @return {Tween}                  	Instance of Tween
	 */
	to: function (targets, properties, time) {
		return TweenMax.to(targets, time, properties);
	},

	kill: function (targets, properties) {
		return TweenMax.kill(targets, properties);
	},

	from: function (targets, properties, time) {
		return TweenMax.from(targets, time, properties);
	},
};