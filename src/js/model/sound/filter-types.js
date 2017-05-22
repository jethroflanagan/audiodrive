var LOW_PASS = 'lowpass';
return {
	//window going up
	window: {
		// shared properties
		properties: {
			time: 0.7, // how long it should take to crossfade
		},
		// audioContext
		SoundJS_WebAudio: {
			type: LOW_PASS,
			frequency: {
				value: 860,
			},
			Q: {
				value: 0,
			},
			gain: {
				value: 0,
			},
		},
		targetGroup: 'external',
	},

	THUNDER: {
	}
}