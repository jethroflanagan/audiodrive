var gulp = require('gulp');
var paths = require('../paths');
// var template = require('gulp-template');
// var data = require('gulp-data');

gulp.task('html', function () {
	// use `base` to retain original file structure, but point at src so `src` folder is not part of the output structure
	return gulp.src(paths.SRC_HTML, {base: paths.SRC})
		.pipe(gulp.dest(paths.DEST_HTML));

	// gulp.src(paths.SRC_HTML)
	//	.pipe(data(function () {
 //            return {name: 'Sindre'};
 //        }))
 //        .pipe(template())
 //        .pipe(gulp.dest(paths.DEST_HTML));
});
