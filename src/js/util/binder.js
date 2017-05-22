/**
 * Similar to _.bindAll but binds everything to the scope, except for the specified functions
 * Why use this? Because I'm tired of updating the function names in the bindAll call. 
 * I liked the old mechanism where this was automated.
 * 
 * @mutable	functions change to bound functions
 * 
 * @param  {Object} scope      generally `this`. Whatever scope you want to force the bound functions to. 
 *                             Can be left out if no exceptions are included, then defaults to current scope.
 * @param  {array} exceptions  string names of functions to ignore for binding
 * @return {}            [description]
 */
function bindAllExcept(context, exceptions) {
	if (!context) 
		console.error('No context supplied for binding.');
	
	if (exceptions) {
		exceptions = exceptions.concat(['initialize', 'constructor', 'on', 'off', 'once', 'trigger', 'stopListening', 'listenTo', 'listenToOnce', 'bind', 'unbind']);
	}
	else {
		exceptions = [];
	}

	for (var prop in context) {
		// only work with functions
		if (typeof(context[prop]) != 'function') {
			continue;
		}

		// remove exceptions
		var isException = false;
		// ignore first arg (scope)
		for (var i = 1, len = exceptions.length; i < len; i++) {
			if (prop == exceptions[i]) {
				isException = true;
				break;
			}
		}
		if (isException)
			continue;
		context[prop] = context[prop].bind(context);
	}
}

function bindAll(context) {
	bindAllExcept(context);
}

return {
	allExcept: bindAllExcept,
	all: bindAll,
}