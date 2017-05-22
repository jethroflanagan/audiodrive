return {
	/**
	 * [pushUnique description]
	 *
	 * @param  {[type]}  array
	 * @param  {[type]}  obj
	 *
	 * @return {boolean} returns true if object was pushed
	 */
	pushUnique: function (array, obj) {
		for (var i = 0, len = array.length; i < len; i++) {
			if (array[i] === obj) {
				return false;
			}
		}
		array.push(obj);
		return true;
	},
}