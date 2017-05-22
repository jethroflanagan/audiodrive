// TODO integrate FED scripts into app
var $ = require('jquery');
var Event = require('model/event');
var TrackingEvents = require('event/tracking-events');
// require('slick');


//
// onReady event for prettier loading
//

$('.splash').fadeIn(0, function() {
	$('.fade-in').show();
});


//
// Declare global variables
//

var windowHeight = $(window).height();
var windowWidth = $(window).width();
var footerHeight = $('footer').outerHeight();
var mobileBreak = 767;
var speed = 300;
var hasLoadedBrochure = false;
var isFooterOffscreen = false;
//
// Functions
//

// Reference: 
// 1. resizeVar - L46
// 2. mainHeight - L53
// 3. brochure - L75
// 4. slider - L104
// 5. mPush - L140
// 6. mSlider - L158
// 7. mAccordion - L166
// 8. mFooter - L189
// 9. socialShare - L199
// 10. ieOutdated - L218
// 11. debounce - L225


// Re-declare variables on window resize
function resizeVar() {
	windowHeight = $(window).height();
	windowWidth = $(window).width();
	footerHeight = $('footer').outerHeight();
}

// Calculate controls div height
function mainHeight() {

	if (windowWidth > mobileBreak) {
		if (windowHeight > (520 + footerHeight)) {
			var ht = windowHeight - footerHeight;
			$('main, #brochure, .m-push').css('height', ht);
			$('main').css('line-height', ht + 'px');
			$('.collapsed').css('bottom', footerHeight);
			$('.footer').css('position', 'relative');
			// $('.logo').css('z-index', '200');
			isFooterOffscreen = false;
		}
		else {
			$('main, #brochure, .m-push').css('height', windowHeight);
			$('.footer').css('position', 'absolute');
			$('.collapsed').css('bottom', '0');
			// $('.logo').css('z-index', '200');
			isFooterOffscreen = true;
			$('main').css('line-height', windowHeight + 'px');
		}
	}
	else {
		$('main, #brochure, .m-push').css('height', windowHeight);
		$('main').css('line-height', windowHeight + 'px');
	}
}

// Brochure
function brochure() {

	if (windowWidth < mobileBreak) {

		// Remove desktop slider if initialised
		if ($('.brochure-wrap').hasClass('slick-initialized')) {
			$('.brochure-wrap').unslick();
		}

		mSlider();
		mAccordion();

		// Resets if an accordion is initialised
		if ($('.slide h1').hasClass('m-open')) {
			$('.slide h1').removeClass('m-open');
			$('.brochure-content').css('display','none');
			$('.m-sub-slider').unslick();
		}

	}
	// Initialise slider for desktop and tablet
	else {
		if (!$('.brochure-wrap').hasClass('slick-initialized')) {
			slider();
		}
	}
}

function slickCustomPaging(slider, i) {
	$('.slide-count').html(function(count) {
		return '0' + (count) + '/0' + slider.slideCount;
	});
	return i;
}

function  trackBrochurePage() {
	var currentSlide = $('.slick-slider').slickCurrentSlide();
	var page = null;
	switch (currentSlide) {
		case 0: 
			page = 'Brochure/Design.html';
			break;
		case 1: 
			page = 'Brochure/Comfort.html';
			break;
		case 2: 
			page = 'Brochure/DrivingDynamics.html';
			break;
		case 3: 
			page = 'Brochure/DownloadBrochure.html';
			break;
	}
	Event.dispatch(TrackingEvents.PAGE, { page: page });
}

// Slider - Desktop
function slider() {
	var pageIndex = 0;
	if (!hasLoadedBrochure)
		return;
	$('.brochure-wrap').slick({
		infinite: true,
		arrows: false,
		dots: true,
		customPaging: slickCustomPaging,
		onInit: function(){
			$('.m-intro-slider').unslick();
		},
		onBeforeChange: function () {
			pageIndex = $('.slick-slider').slickCurrentSlide();
		},
		onAfterChange: function() {
			var isForward = true;
			var diff = $('.slick-slider').slickCurrentSlide() - pageIndex;

			if (diff > 0) {
				isForward = true;
			}
			else {
				isForward = false;
			}
			// deal with cycling to start/end (infinite scroll)
			if (Math.abs(diff) > 1) {
				isForward = !isForward;
			}
			Event.dispatch(TrackingEvents.EVENT, { page: 'Brochure', button: 'Page ' + (isForward ? 'Forward': 'Backward')});

			trackBrochurePage();
		}
	});
	// Brochure controls
	$('.slide-next').click(function(e) {
		e.preventDefault();
		$('.slick-slider').slickNext();
		
		// trackBrochurePage();
	});

	$('.slide-prev').click(function(e) {
		e.preventDefault();
		$('.slick-slider').slickPrev();
		// Event.dispatch(TrackingEvents.EVENT, { page: 'Brochure', button: 'Page Backward'});
		// trackBrochurePage();
	});

	$('.slide-close').click(function(e) {
		e.preventDefault();
		$('#brochure').fadeOut();
	});

	
}

// Push navigation
var state = false;

function mPush() {

	if (state) {
		$('.m-push').css('left', '0');
		$('.m-fixed').css('left', '-85%');
		$('.m-hamburger').css('height', 'auto');
	}
	else{ 
		$('.m-push').css('left', '85%');
		$('.m-fixed').css('left', '0');
		$('.m-hamburger').css('height', '100%');
	}

	state = (state)?false:true;

}

// Slider - Mobile
function mSlider() {
	$('.m-intro-slider').slick({
		arrows: true,
		dots: true,
	});
}

// Accordion - Mobile
function mAccordion() {

	$('brochure h1').off().click(function(){
		// Determine parent to initialise slider
		var sliderParent = $(this).parent().attr('class').split(' ')[1];

		$(this).next().slideToggle(200, 'swing', function(){
			// Initialise the slider on accordion open
			$('.' + sliderParent + ' .m-sub-slider').slick({
				arrows: true,
				dots: true,
			});
		});

		$('.brochure-content').not($(this).next()).slideUp(200, 'swing');
		// Class added to open accordion
		$(this).toggleClass('m-open');
		$('brochure h1').not($(this)).removeClass('m-open');
	});

}

// Footer - Mobile
function mFooter() {
	if (windowWidth < mobileBreak) {
		$('.close-panel').click(function(e) {
			e.preventDefault();
			$(this).parent().fadeOut();
		});
	}
}

// Social sharing for Facebook & Twitter
function socialShare(network,url,title,hash){
	var popupWidth  = 600;
	var popupHeight = 400;
	var left = (screen.width / 2) - (popupWidth / 2);
	var top = (screen.height / 2) - (popupHeight / 2);

	if (network === 'facebook') {
		window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(url) + '&t=' + encodeURIComponent(title), 'Facebook', 'height=' + popupHeight + ',width=' + popupWidth + ',left=' + left + ',top=' + top);
	} 
	else if (network === 'twitter') {
		window.open('http://twitter.com/intent/tweet?text=' + title + (hash ? '&hashtags=' + hash : '') + (url ? '&url=' + url : ''), 'Twitter', 'height=' + popupHeight + ',width=' + popupWidth + ',left=' + left + ',top=' + top);
	} 
	else {
		return;
	}
}

// Check for outdated version of IE
function ieOutdated() {
	if(!document.addEventListener){
		$('html').addClass('outdated-browser');
	}
}

// Debounce for smarter resizing



//
// Call Functions
//

mainHeight();
mFooter();
ieOutdated();

// Debounce smart resize
var smartResize = function() {

	resizeVar();
	mainHeight();
	brochure();
	mFooter();
}

//window.addEventListener('resize', smartResize);


//
// On Click Events
//

// Splash fadeout
$('.start').click(function(e) {
	e.preventDefault();
	// $('.splash').fadeOut('slow');
	// $('.collapsed').fadeIn('slow');
});

// Logo Reset
$('.logo').click(function(e) {
	e.preventDefault();
	// reset all states
	if (windowWidth < mobileBreak) {
		$('.open').removeClass('open').slideToggle();
		// $('.control-item').removeClass('control-active');
	}
	// else {
	// 	$('.control-item').removeClass('control-active');
	// }
});

// Information
// $('.information').click(function(e){
// 	e.preventDefault();
// 	$(this).toggleClass('information-expanded');
// 	$('.information-text', this).fadeToggle(speed);
// });


// Footer
$('a.toggle').click(function (e) {
	e.preventDefault();	
	// ID of clicked link
	var target = $(this).attr('href');
	toggleBooking(target);
});

// #book-social and #book-form
function toggleBooking(target) {
	
	// Mobile
	if (windowWidth < mobileBreak) {
		// Uncomment to slide in from right
		//$(target).stop().animate({width:'toggle'}, speed ).addClass('open');

		$(target).stop().fadeIn(speed).addClass('open');
	}

	// Desktop
	else {

		// If a footer item is initialised
		if ($('.collapsed div').hasClass('open')){

			// ID of the open panel before removing class
			var sameTarget = '#' + $('.open').attr('id');

			// Close the open panel
			$('.open').removeClass('open').stop().slideToggle(speed, 'swing', function(){
				
				// If the ID is not equal to the open item, open it
				if (sameTarget !== target) {
					$(target).stop().slideToggle(speed, 'swing').addClass('open');
				}

			});


		} 
		// Else just open the panel
		else {

			$(target).stop().slideToggle(speed, 'swing').addClass('open');

			$('.close-panel').click(function(e){
				e.preventDefault();
				if (windowWidth < mobileBreak) {
					$('.open').removeClass('open').stop().fadeOut(speed);
				}
				else {
					$('.open').removeClass('open').stop().slideToggle(speed, 'swing');
				}
			});

		}

	}

}

// Brochure
$('.nav-other li:nth-child(2) a').click(function(e){
	e.preventDefault();

	// Uncomment to update user on loading status
	/*
	var loadStatus = $(this);
	$(loadStatus).text('Loading');
	*/
	
	$('#brochure').fadeToggle('slow');

	// Only load brochure if requested to improve performance
	// return;
	$('#brochure').load('brochure.html', function() {
		hasLoadedBrochure = true;
		// Uncomment to update user on loading status
		//$(loadStatus).text('Brochure');
		$('.js-download-brochure').click(function () {
			Event.dispatch(TrackingEvents.EVENT, { page: 'Brochure', button: 'Download the Brochure' });
		});

		// Mobile - use accordion functions
		if (windowWidth < mobileBreak) {

			mAccordion();
			mSlider();

			$('.slide-close').click(function(e) {
				e.preventDefault();
				$('#brochure').fadeOut();
			});
		}
		// Desktop - initialise slider
		else {
			slider();
		}
	});

});


// Social Sharer
$('a[data-network]').click(function(e) {
	e.preventDefault();
	var network = $(this).data('network');
	var title = $(this).data('title');
	var url = $(this).data('url');
	var hash = $(this).data('hash');
	socialShare(network, url, title, hash);
});

// Control - active buttons classes
//
$('.m-hamburger').click(function(e) {
	e.preventDefault();
	mPush();
});

//
// Swipe Functions - Touch device support
//

$('.m-push').swipe({
	swipeRight:function(event, direction, distance, duration, fingerCount) {
		mPush();
	},
	threshold:50
});

$('.m-fixed').swipe({
	swipeLeft:function(event, direction, distance, duration, fingerCount) {
		mPush();
	},
	threshold:50
});

// Tablets only
if (windowWidth > mobileBreak) {

	// $('.hidden').swipe({
	// 	swipeDown:function(event, direction, distance, duration, fingerCount) {
	// 		$('.open').removeClass('open').stop().slideToggle(speed, 'swing');
	// 	},
	// 	threshold:50
	// });

	$('#brochure').swipe({
		pinchOut:function(event, direction, distance, duration, fingerCount, pinchZoom) {
			$(this).fadeOut();
		},
		fingers:2,
		pinchThreshold:0
	});
}

return {
	isFullscreen: function () {
		return (windowWidth < mobileBreak) || 
			isFooterOffscreen;
	},

	resize: smartResize,
	toggleBooking: toggleBooking,
}