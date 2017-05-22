var gulp = require('gulp');

// force tasks to run synchronously, otherwise reload may occur before other tasks complete
var runSequence = require('run-sequence');

gulp.task('dev', function () {
	// tasks in
	runSequence(['clean', 'clean:tmp'], 
		['static', 'js', 'html', 'vendor', 'sass'], // run these in parallel, but js must run before vendor
		'bundle', 
		['connect', 'watch']);
});