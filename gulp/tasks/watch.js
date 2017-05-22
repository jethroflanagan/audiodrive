var gulp = require('gulp');
var paths = require('../paths');

// force tasks to run synchronously, otherwise reload may occur before other tasks complete
var runSequence = require('run-sequence');

gulp.task('watch', function(){

	gulp.watch(paths.BOWER, function() {
		runSequence('clean:js', ['vendor', 'js'], 'bundle', 'reload');
	});
	
	gulp.watch(paths.SRC_JS, function() {
		runSequence('clean:js', ['vendor', 'js'], 'bundle', 'reload');
	});
	
	gulp.watch(paths.SRC_SASS, function() {
		runSequence('sass', 'reload');
	});
	// warning: don't watch assets when downloading something makes for constant reloading
	gulp.watch(paths.SRC_STATIC, function() {
		runSequence('static', 'reload');
	});

	gulp.watch(paths.SRC_HTML, function() {
		runSequence('html', 'reload');
	});

});