var gulp = require('gulp');
var paths = require('../paths');
var connect = require('gulp-connect');

gulp.task('connect', function () {
	connect.server({
		root: paths.DEST,
		port: 9001,
		livereload: true
	});
});

gulp.task('connect:prod', function () {
	connect.server({
		root: paths.DEST,
		port: 9002,
		livereload: false
	});
});