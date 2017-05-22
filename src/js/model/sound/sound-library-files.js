/**
 * Duration required prior to load because it may be needed before a file can be loaded for calculations
 */
return {
	master: {
		path: 'master',
		common: {
			path: '',
			files: {
				walk_to_car: {
					path: 'start_gravel_with_walk',
					duration: 25.56,
					load: true,
				},
				start_car: {
					path: 'start_car',
					duration: 12.528,
					load: true,
				},
				stop_car: {
					path: 'stop_car_generic',
					duration: 8.760041666666666,
					load: true,
				},
				start_car_storm: {
					path: 'start_car_with_rain',
					duration: 12.528,
					load: true,
				},
				stop_car_storm: {
					path: 'stop_car_with_rain',
					duration: 8.760041666666666,
					load: true,
				},
				car_scene_transition: {
					path: 'car_scene_transition', 
					duration: 8.064041666666666,
					load: true,
				},
				car_scene_transition_storm: {
					path: 'car_scene_transition_with_rain', 
					duration: 8.064041666666666,
					load: true,
				},
				window_down: {
					path: 'window_down',
					duration: 7.416041666666667,
					load: true,
				},
				window_up: {
					path: 'window_up',
					duration: 8.160041666666666,
					load: true,
				},
				thunder: {
					path: 'thunder',
					duration: 10.128,
					load: true,
				},

			},
		},
	},

	forest: {
		path: 'mountain',
		common: {
			path: '',
			files: {
				day: {
					path: 'mountain_day_with_car',
					duration: 60.04804166666667,
				},
				day_no_car: {
					path: 'mountain_day_no_car',
					duration: 53.5,
				},
				day_storm_no_car: {
					path: 'mountain_day_rain_no_car',
					duration: 34.5,
				},
				day_storm: {
					path: 'mountain_day_rain_with_car',
					duration: 34.5,
				},
				night: {
					path: 'mountain_night_with_car',
					duration: 54.5,
				},
				night_no_car: {
					path: 'mountain_night_no_car',
					duration: 54.5,
				},
				night_storm_no_car: {
					path: 'mountain_night_rain_with_no_car',
					duration: 43.5,
				},
				night_storm: {
					path: 'mountain_night_rain_with_car',
					duration: 43.5,
				},
				joy_day: {
					path: 'jb_mountain_day_cows',
					duration: 8.448041666666667,
				},
				joy_day_storm: {
					path: 'jb_mountain_day_rain_horse',
					duration: 10.080041666666666,
				},
				joy_night: {
					path: 'jb_mountain_night_hyena',
					duration: 9.0,
				},
				joy_night_storm: {
					path: 'jb_mountain_night_rain_frogs',
					duration: 10.056041666666667,
				},
			},
		},	
	},

	ocean: {
		path: 'ocean',
		common: {
			path: '',
			files: {
				day: {
					path: 'ocean_day_with_car',
					duration: 45.5,
					load: true,
				},
				day_no_car: {
					path: 'ocean_day_no_car',
					duration: 45.5,
					load: true,
				},
				day_storm_no_car: {
					path: 'ocean_day_rain_no_car',
					duration: 40.5,
					load: true,
				},
				day_storm: {
					path: 'ocean_day_rain_with_car',
					duration: 46.5,
					load: true,
				},
				night: {
					path: 'ocean_night_with_car',
					duration: 45.5,
					load: true,
				},
				night_no_car: {
					path: 'ocean_night_no_car',
					duration: 45.5,
					load: true,
				},
				night_storm_no_car: {
					path: 'ocean_night_rain_with_no_car',
					duration: 40.5,
					load: true,
				},
				night_storm: {
					path: 'ocean_night_rain_with_car',
					duration: 40.5,
					load: true,
				},
				joy_day: {
					path: 'jb_ocean_day_kids',
					duration: 10.056041666666667,
					load: true,
				},
				joy_day_storm: {
					path: 'jb_ocean_day_rain',
					duration: 9.216041666666667,
					load: true,
				},
				joy_night: {
					path: 'jb_ocean_night_drumcircle',
					duration: 14.136,
					load: true,
				},
				joy_night_storm: {
					path: 'jb_ocean_night_rain_boat',
					duration: 8.64,
					load: true,
				},
			},
		},
	},	

	urban: {
		path: 'urban',
		common: {
			path: '',
			files: {
				day: {
					path: 'urban_day_with_car',
					duration: 60.5,
				},
				day_no_car: {
					path: 'urban_day_no_car',
					duration: 60.5,
				},
				day_storm_no_car: {
					path: 'urban_day_rain_no_car',
					duration: 44.65,
				},
				day_storm: {
					path: 'urban_day_rain_with_car',
					duration: 44.65,
				},
				night: {
					path: 'urban_night_with_car',
					duration: 50.5,
				},
				night_no_car: {
					path: 'urban_night_no_car',
					duration: 50.5,
				},
				night_storm_no_car: {
					path: 'urban_night_rain_with_no_car',
					duration: 41.5,
				},
				night_storm: {
					path: 'urban_night_rain_with_car',
					duration: 41.5,
				},
				joy_day: {
					path: 'jb_urban_day_skater',
					duration: 14.064041666666666,
				},
				joy_day_storm: {
					path: 'jb_urban_day_rain_singers',
					duration: 14.064041666666666,
				},
				joy_night: {
					path: 'jb_urban_night_fireworks',
					duration: 10.08,
				},
				joy_night_storm: {
					path: 'jb_urban_night_rain_music',
					duration: 10.056041666666667,
				},
			},
		},
	},
};