var fs = require('fs');
var gulp = require('gulp');
var paths = require('../paths');
var insert = require('gulp-insert');
var cache = require('gulp-cached');
var replace = require('gulp-replace');

var defaultImports = fs.readFileSync('gulp/replace/js-default-imports.js', 'utf8');

gulp.task('js', function () {
	return gulp.src(paths.SRC_JS)
		// the `changed` task needs to know the destination directory
		.pipe(cache())

		// lazy default imports
		.pipe(replace(/^__DEFAULT_IMPORTS__/, '\n' + defaultImports))

		// insert requirejs boilerplate around files
		.pipe(insert.wrap('define(function(require) { "use strict";\n', '\n});'))
		
		.pipe(gulp.dest(paths.TMP_JS));
		//.on('end', cb);
});

gulp.task('js:prod', function () {
	return gulp.start('js');
});
