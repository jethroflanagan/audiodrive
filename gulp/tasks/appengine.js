var gulp = require('gulp');
// force tasks to run synchronously, otherwise reload may occur before other tasks complete

gulp.task('appengine', function () {
	return gulp.src('./deploy/**/*')
		.pipe(gulp.dest('./appengine/static/'));

	// 'C:\\Python27\\pythonw.exe -u "C:\\Program Files (x86)\\Google\\google_appengine\\appcfg.py" --no_cookies', u'--email=stringycustard@gmail.com --passin update "C:\\Work\\Native\\projects\\bmw\\f45-launch\\code\\appengine"';
});
