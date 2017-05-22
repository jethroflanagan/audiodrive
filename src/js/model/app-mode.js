return {
	IS_DEV: (window.location.host == 'localhost:9001' && window.navigator.userAgent.match('MSIE 9.0') == null),
	FORM_URL: null,
	TEST_SPLASH: null, 	// a/b testing for splash page start button (0=start + book button, 1=click, to start)
	TEST_BOOK: null, 	// a/b testing for book a test drive button button (0=single book button, 1=twitter & fb book buttons)
}