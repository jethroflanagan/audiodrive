var fs = require('fs');

var extraDependencies = require('../vendor-extra');	

function showFileMissingError(file, pathAttempted) {
	throw new Error("Can't find the production file for '" + file + "' when searching in '" + pathAttempted + "'.");
}

// Allows reading of slightly broken JSON files.
function getJSON(file) {
	return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function getDependencyList () {
	var conf = getJSON('./.bowerrc');
	var path = null;
	if (conf)
		path = conf.directory;

	// Use default location
	if (!path || !conf) 
		path = 'bower_components';

	// Don't get list from main `bower.json` file as it only lists the top level deps, get them from the folder instead
	// TODO Start with `bower.json` then use dependencies in `.bower` or `bower` to do this instead
	var dependencies = fs.readdirSync(path);
	var files = [];
	var i, len;

	// Get actual production file for each dependency
	for (i = 0, len = dependencies.length; i < len; i++) {
		// Load bower settings for the dependency
		var settings = null;
		var dependencyFolder = dependencies[i]; // the name of the last folder for the dependency
		var dependencyPath = path + '/' + dependencyFolder; // full path

		// Don't try get loose files, only real modules
		if (!fs.statSync(dependencyPath).isDirectory()) {
			continue;
		}

		// Try find a bower file. Bower has loose requirements around naming conventions
		try {
			settings = getJSON(dependencyPath + '/bower.json');
		} 
		catch (e) {
			settings = getJSON(dependencyPath + '/.bower.json');
		}

		// Get the main prod script
		var filename = settings.main;
	if (!filename)
			filename = dependencies[i] + '.js';
		// TODO hack for array
		if (typeof(filename) != 'string') {
			// console.log(settings)
			filename = filename[0];
		}
		var filePath = dependencyPath;
		
		// If it's not specified (due to missing meta), try find the script based on the dependency name
		var file = filePath + '/' + filename;
		
		// Test if the file exists
		try {
			if (!fs.existsSync(file, 'utf8'))
				showFileMissingError(filename, filePath);
			else
				files.push(file);
		}
		catch (e) {
			showFileMissingError(filename, filePath);
		}
	}

	// Not all files are listed in bower, so this pulls extra ones - configure them as needed
	for (var prop in extraDependencies) {
		var extraDepList =  extraDependencies[prop];
		// listed in array per item
		for (i = 0, len = extraDepList.length; i < len; i++) {
			files.push(extraDepList[i]);
		}
	}
	// console.log(files);
	return files;
}

module.exports = getDependencyList;