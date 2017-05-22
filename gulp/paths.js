/**
* Must be run from root of project (i.e. the location of bower.json / .bowerrc)
*/

var getDependencies = require('./util/get-dependencies');

var src = 'src/';
var dest = 'deploy/';
var tmp = 'tmp/';

module.exports = {
	SRC: src,
	SRC_JS: src + 'js/**/*.js',
	SRC_SASS: src + 'scss/**/*.scss',
	VENDOR: getDependencies(),
	SRC_STATIC: [src + 'img/**/*.*', src + 'audio/**/*.*', src + 'fonts/**/*.*', src + 'assets/**/*.*'],
	SRC_HTML: [src + '**/*.html'], // '-' + src + 'index.html'],
	DEST: dest,
	DEST_JS: dest + 'js',
	DEST_VENDOR: dest + 'js/vendor',
	DEST_STATIC: dest,
	DEST_HTML: dest,
	DEST_CSS: dest + 'css',
	TMP: tmp,
	TMP_JS: tmp + 'js',
	TMP_VENDOR: tmp + 'js/vendor',
	BUILD_CONFIG: 'gulp/build-config.js',
	BOWER: 'bower.json'
};