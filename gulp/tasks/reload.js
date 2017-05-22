var gulp = require('gulp');
var connect = require('gulp-connect');
var paths = require('../paths');

gulp.task('reload', function () {
	gulp.src(paths.DEST)
		.pipe(connect.reload());
});