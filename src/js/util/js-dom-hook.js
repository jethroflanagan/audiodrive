// @deprecated. Too much effort in code. Resorting to js- hooks (e.g. class="js-target") and getting it with $('.js-target');
var js = require('jquery');

return {
	el: function (id, context) {
		return $('[data-js="' + id + '"]', context);
	},
	// useful if you need to use find, etc.
	target: function (id) {
		return '[data-js="' + id + '"]';
	}
}