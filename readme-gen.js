// Dirty hack to make a numbering system for the headers in the readme.md
// e.g. 
// # X 
// ## X2 
// # Y
// Becomes:
// # 1. X
// ## 1.1. X2
// # 2. Y
// Run this using node readme-gen.js

var fs = require('fs');
fs.readFile('_README.md', 'utf8', onRead);

function onRead (err, data) {
	var needle = /#+/;
	var result = null;
	var partial = data;
	var ret = '';
	var heading = [];
	var lastMatch = '';
	while( result = needle.exec(partial) ) {
		var match = result[0];
		var index = result.index + match.length;
		var headingNum = getHeading(heading, match, lastMatch);
		ret += partial.substr(0, index) + headingNum;
		console.log(index, heading);
		lastMatch = match;
		partial = partial.substr(index);
	}

	ret += partial;

	writeFile(ret);
}

function getHeading(heading, match, lastMatch) {
	heading = incrementHeading(heading, match.length, lastMatch.length);
	var ret = ' ';
	for (var i = 0; i < heading.length; i++) {
		ret += heading[i] + '.';
	}
	return ret;
}

function incrementHeading(heading, matchLen, lastMatchLen) {
	if (matchLen > lastMatchLen) {
		heading.push(1);
	}
	else if (lastMatchLen == matchLen) {
		heading[heading.length - 1] = heading[heading.length - 1] + 1;
	}
	else {
		for (var i = 0; i < lastMatchLen - matchLen; i++) {
			heading.pop();
		}
		heading[heading.length - 1] = heading[heading.length - 1] + 1;
	}
	return heading;
}

function writeFile(data) {
	fs.writeFile('README.md', data, 'utf8');
}