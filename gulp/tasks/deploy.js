var gulp = require('gulp');
// force tasks to run synchronously, otherwise reload may occur before other tasks complete
var runSequence = require('run-sequence');

gulp.task('deploy', function () {
	runSequence(['clean', 'clean:tmp'], 
		['static', 'js', 'sass:prod', 'html', 'vendor'],
		'bundle:prod',
		'connect:prod',
		'appengine');
});