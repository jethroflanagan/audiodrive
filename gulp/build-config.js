require.config({

    baseUrl: 'js',
    
    paths: {
        jquery: 'vendor/jquery',
        underscore: 'vendor/underscore',
        backbone: 'vendor/backbone',
        SoundJS: 'vendor/soundjs-0.6.0.combined',
        SoundJSFlash: 'vendor/flashaudioplugin-0.6.0.combined',
        TweenMax: 'vendor/TweenMax',
        Modernizr: 'vendor/modernizr',
        TouchSwipe: 'vendor/jquery.touchSwipe',
        Slick: 'vendor/slick.min',
    },

    deps: ['main'],

    shim: {
        SoundJS: {
            exports: 'SoundJS'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },
        jquery: {
            exports: '$'
        },
        TweenMax: {
            exports: 'TweenMax'
        },
        Modernizr: {
            exports: 'Modernizr'
        },
        Slick: {
            deps: ['jquery'],
            exports: '$.fn.slick'
        }
    }
});
