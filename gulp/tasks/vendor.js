var gulp = require('gulp');
var paths = require('../paths');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

//dev 
gulp.task('vendor', function () {
	 return gulp.src(paths.VENDOR)
		//.pipe(concat('vendor.js'))
		//.pipe(uglify())
		.pipe(gulp.dest(paths.TMP_VENDOR));
});

// // prod
// gulp.task('vendor:prod', function () {
// 	 return gulp.src(paths.VENDOR)
// 		//.pipe(concat('vendor.js'))
// 		//.pipe(uglify())
// 		.pipe(gulp.dest(paths.TMP_VENDOR));
// });