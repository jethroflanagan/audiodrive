// Builds the JS into 

var gulp = require('gulp');
var paths = require('../paths');
var clean = require('gulp-clean');
var rjs = require('requirejs');
var closureCompiler = require('gulp-closure-compiler');
//var buildConfig = require(paths.BUILD_CONFIG);

// get app info from package.json in the root
var app = require('./../../package.json');

gulp.task('bundle', function (cb) {
	try {
		rjs.optimize({
			baseUrl: paths.TMP_JS,
			mainConfigFile: paths.BUILD_CONFIG,
			//paths: buildConfig.paths, // import the paths from the config file
			include: 'main',
			insertRequire: ['main'],
			name: '../../node_modules/almond/almond',
			out:  paths.DEST_JS + '/' + app.name + '.js',
			wrap: true,
			optimize: 'none', // uglify2, etc. make reading the scope variables a pain when debugging, so keep source as is.
			generateSourceMaps: true,
			preserveLicenseComments: false
		},
		function (result) {
			cb();
		},
		function (error) {
			// TODO this is hacky
			var message = error.originalError.toString();
			var search = 'Error: Line ';
			var line = message.substring(message.indexOf(search) + search.length);
			var lineNumber = line.substring(0, line.indexOf(':'));
			line = line.substr(lineNumber.length + 2); // also remove ': '
			lineNumber = parseInt(lineNumber) - 9; // offset due to replacing default imports
			if (lineNumber < 1) // occurs when error is right at top, affecting the replacement content
				lineNumber = 1;
			var fileName = error.originalError.fileName;
			fileName = fileName.substr(fileName.indexOf(paths.TMP_JS) + paths.TMP_JS.length);
			console.log(' \x1b[30m\x1b[43mError\x1b[0m\x1b[0m in \x1b[33m%s\x1b[0m', fileName);
			// console.log(fileName);
			console.log(' ' + lineNumber + ': ' + line);
						// console.log(error);

			// for (var prop in e) {
			// 	console.log(prop, e[prop]);
			// }
			cb();
		});
	}
	catch (e) {
		console.log('***Massive failure***');
		console.log(e);
		cb();
	}
});

gulp.task('bundle:prod', function (cb) {
	try {
		// move file into TMP instead for further optimisation by closure
		rjs.optimize({
			baseUrl: paths.TMP_JS,
			mainConfigFile: paths.BUILD_CONFIG,
			//paths: buildConfig.paths, // import the paths from the config file
			include: 'main',
			insertRequire: ['main'],
			name: '../../node_modules/almond/almond',
			out:  paths.DEST_JS + '/' + app.name + '.js',
			wrap: true,
			optimize: 'uglify2',
			generateSourceMaps: false,
			// no point, only preserves requirejs license
			// preserveLicenseComments: true
		}, function () {
			cb();
			// console.log(__dirname);
			// console.log(process.cwd());
			// console.log(process.cwd().replace + '/node_modules/closurecompiler/compiler/compiler.jar');
			// var compiler = gulp.src(paths.DEST_JS +'/' + app.name + '.js')
			// 	.pipe(closureCompiler({
			// 		compilerPath: 'C:\\Work\\Native\\projects\\bmw\\f45-launch\\code\\node_modules\\closurecompiler\\compiler\\compiler.jar',
			// 		fileName: app.name + '.min.js',
			// 		compilerFlags: {
			// 			warning_level: 'QUIET', // errors only
			// 			compilation_level: 'ADVANCED_OPTIMIZATIONS', // treeshaking
			// 		},
			// 	}))
			// 	.pipe(gulp.dest(paths.DEST_JS));

			// compiler.on('end', cb);
		});
	}
	catch (e) {
		console.log('***Massive failure***');
		console.log(e);
		cb();
	}
});