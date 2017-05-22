var gulp = require('gulp');
var paths = require('../paths');
var clean = require('gulp-clean');

gulp.task('clean', function () {
	return gulp.src(paths.DEST + '/*', {read: false})
		.pipe(clean());
});

gulp.task('clean:tmp', function () {
	return gulp.src(paths.TMP, {read: false})
		.pipe(clean());
});

gulp.task('clean:js', function () {
	return gulp.src(paths.DEST_JS, {read: false})
		.pipe(clean());
});