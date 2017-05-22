var gulp = require('gulp');
var paths = require('../paths');
var sass = require('gulp-sass');
// var sass = require('gulp-compass');
var uncss = require('gulp-uncss');
// var compass = require('compass');
var exec = require('child_process').exec;
gulp.task('sass', function (cb) {
	// return gulp.src(paths.SRC_SASS)
	// 	.pipe(sass({
	// 		config_file: './config.rb',
	// 		css: './src/css',
	// 		sass: './src/scss',
	// 		style: 'compressed'
	// 	}))
	// 	.pipe(gulp.dest(paths.DEST_CSS));
	// console.log(compass);
	
	// compass.compile({
	// 	cwd: __dirname,
	// },
	// function (err, stdout, stderr) {
	// 	cb();
	// });

	exec('compass compile --force', function (error, stdout, stderr) {
		if (error) { 
			console.log(error);
		}
		if (stdout) { 
			console.log(stdout);
		}
		if (stderr) { 
			console.log(stderr);
		}
		cb();
	});
	
});

gulp.task('sass:prod', function (cb) {
	// return gulp.src(paths.SRC_SASS)
	// 	.pipe(sass())
	// 	// .pipe(uncss())
	// 	.pipe(gulp.dest(paths.DEST_CSS));
	exec('compass compile --force', function (error, stdout, stderr) {
		if (error) { 
			console.log(error);
		}
		if (stdout) { 
			console.log(stdout);
		}
		if (stderr) { 
			console.log(stderr);
		}
		cb();
	});
});