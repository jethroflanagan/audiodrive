return {
	getNumObjectProperties: function (obj) {
		var count = 0;
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				count++;
			}
		}
		return count;
	},

	// TODO do a nicer version
	deepCopy: function (obj) {
		if (!obj) { // null/undefined check
			return obj;
		}
		try {
			return JSON.parse(JSON.stringify(obj));
		}
		catch (e) {
			console.log('error copying object');
			throw e;
		}
	},
}