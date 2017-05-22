__DEFAULT_IMPORTS__
var SoundLibraryFiles = require('model/sound/sound-library-files');
var LibraryGroups = require('model/sound/sound-library-groups');
var SoundEngineEvents = require('event/sound-engine-events');

// TODO distortions
var SoundLibrary = Backbone.Model.extend({
	library: null,

	// TODO a bit hacky
	libraryMeta: null, // hashmap of info for sound

	initialize: function () {
		Binder.all(this);
		this.library = {};
		this.libraryMeta = {};
		// this.prepareManifest();
		Event.listen(SoundEngineEvents.LOADING, this.onLoading);
	},
	/**
	 * @param  {boolean|object} onlyLoadRequired	true to load library listed "load" files, 
	 * @param  {array<string>} onlyScenes			list of scenes to load		
	 */
	prepareManifest: function (onlyLoadRequired, onlyScenes) {
		var scenes = ['master', 'forest', 'ocean', 'urban'];
		if (onlyScenes) {
			scenes = onlyScenes;
		}
		// console.log(scenes);

		var situations = [
			LibraryGroups.DAY, 
			LibraryGroups.NIGHT, 
			LibraryGroups.DAY_STORM, 
			LibraryGroups.NIGHT_STORM
		];
		var files = {};
		// this.getFiles(files, SoundLibraryFiles.common, 'common');
		// var commonLibrary = SoundLibraryFiles.common; 
		// for (var prop in commonLibrary.files) {
		// 	var basePath = 'audio/' + commonLibrary.path;
		// 	files[this.getSoundId('common', prop)] = basePath + '/' + commonLibrary.path + '/' + commonLibrary.files[prop].path;
		// }
		for (var i = 0, numScenes = scenes.length; i < numScenes; i++) {
			var scene = scenes[i];
			this.getFiles(files, SoundLibraryFiles[scene], scene, 'common', onlyLoadRequired);
			for (var k = 0, numSituations = situations.length; k < numSituations; k++) {
				var situation = situations[k];
				this.getFiles(files, SoundLibraryFiles[scene], scene, situation, onlyLoadRequired);
			}
		}

		// only load requested files. Done as a secondary step so all files are at least initialised into lib
		var requestedFiles = {};
		for (var prop in files) {
			var meta = this.libraryMeta[prop];
			var file = files[prop];
			if (meta.isLoading) {
				requestedFiles[prop] = file;
			}
		
			// requestedFiles
			if (onlyLoadRequired) {
				var isRequested = false;
				// if (Array.isArray(onlyLoadRequired)) {
				// 	isRequested = (onlyLoadRequired.indexOf(id) == -1)
				// }
				// either file.load needed or the id is listed in onlyLoadRequired array
				if (!(file.load || isRequested)) {
					continue;
				}
			}
			requestedFiles[prop] = file;
			file.loading = true;
		}
		// console.log('GET', files)

		//console.log('REQUESTED', requestedFiles);
		// console.log(files);
		
		// add all files to lib for reference in getSound, etc.
		// this.library = files;
				// console.log('PREP', requestedFiles);

		Event.dispatch(SoundEngineEvents.LOAD_MANIFEST, { files: requestedFiles });
	},

	/**
	 * Sets up files for loading. The group name directly relates to the property name in SoundLibraryFiles (e.g. 'urban')
	 *
	 * @param  {object} *files						@mutable will be used to copy properties into 
	 * @param  {object} library						list of files
	 * @param  {string} scene						scene name, e.g. urban, forest
	 * @param  {string} group						group name, e.g. sunnyDay
	 */
	getFiles: function (files, library, scene, group, onlyLoadRequired) {
		if (!library.hasOwnProperty(group))
			return;
		var libraryGroup = library[group];
		var basePath = 'audio/' + library.path + this.terminatePath(library.path);
		for (var prop in libraryGroup.files) {
			// use group as an id so the same names for files can exist in each group
			var id = this.getSoundId(scene, group, prop);
			
			// skip already loaded files
			if (this.libraryMeta.hasOwnProperty(id)) {
				if (this.libraryMeta[id].isLoading || this.libraryMeta[id].isLoaded) {
					continue;
				}
			}
			
			var file = libraryGroup.files[prop];
			files[id] = basePath + libraryGroup.path + this.terminatePath(libraryGroup.path) + file.path;

			if (!file.duration) {
				// id gets lost, so bind it to callback
				var checkMissingDuration = this.checkMissingDuration;
				Event.listen(SoundEngineEvents.LOAD_COMPLETE, (function(id) {
					checkMissingDuration(this.id);
				}).bind({id:id}));
			}
			// console.log('CHANGE TO FALSE');
			var isLoading = false;
			// requestedFiles
			if (onlyLoadRequired) {
				var isRequested = false;
				
				// TODO changing onlyLoadRequired behaviour

				// if (Array.isArray(onlyLoadRequired)) {
				// 	isRequested = (onlyLoadRequired.indexOf(id) == -1)
				// }
				// either file.load needed or the id is listed in onlyLoadRequired array
				if (file.load || isRequested) {
					isLoading = true;
				}
			}
			this.library[id] = files[id];
			this.libraryMeta[id] = {
				duration: file.duration,
				isLoading: isLoading,
				isLoaded: false,
			}
		}
	},

	checkMissingDuration: function (id) {
		// console.log(id);
		Event.dispatch(SoundEngineEvents.CHECK_DURATION, { soundId: id });
	},

	/**
	 * Adds a / if necessary to the end of a path
	 *
	 * @param  {[type]} path
	 * @return {[type]}      [description]
	 */
	terminatePath: function (path) {
		if (path.length == '') {
			return '';
		}
		return (path.substr(-1,1) == '/' ?  '' : '/');
	},

	getSoundId: function (scene, group, fileId) {
		if (!group) {
			group = 'common';
		}
		return scene + '__' + group  + '__' + fileId;
	},

	getSound: function (soundId) {
		if (!this.library.hasOwnProperty(soundId)) {
			// console.log(this.library);
			console.error('SoundId ' + soundId + ' doesn\'t exist in library');
			return false;
		}
		return this.library[soundId];
	},

	// TODO this thing
	getDuration: function (soundId, instanceId) {
		var sound = this.libraryMeta[soundId];
		return sound.duration;
	},

	isLoading: function (soundId) {
		return this.libraryMeta[soundId].isLoading;
	},

	isLoaded: function (soundId) {
		return this.libraryMeta[soundId].isLoaded;
	},

	onLoading: function (e) {
		// console.log(e.data, 'loaded');
		this.libraryMeta[e.data.soundId].isLoading = false;
		this.libraryMeta[e.data.soundId].isLoaded = true;
	},


});

var instance = null;
return {

	// singleton
	getInstance: function () {
		if (!instance)
			instance = new SoundLibrary();
		return instance; 
	}
}