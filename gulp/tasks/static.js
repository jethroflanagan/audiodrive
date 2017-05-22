var gulp = require('gulp');
var paths = require('../paths');

gulp.task('static', function () {
	// use `base` to retain original file structure, but point at src so `src` folder is not part of the output structure
	return gulp.src(paths.SRC_STATIC, {base: paths.SRC})
		.pipe(gulp.dest(paths.DEST_STATIC));
});
