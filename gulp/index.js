var fs = require('fs');
var filter = require('./util/filter'); // only take js files (in case readmes, etc)
var tasks = fs.readdirSync('./gulp/tasks/').filter(filter);

// get all tasks in immediate folder
// to add new tasks, just create a file in /tasks
tasks.forEach(function(task) {
	require('./tasks/' + task);
});