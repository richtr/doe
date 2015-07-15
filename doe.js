/**
 *
 * doe - The Device and Screen Orientation Emulator
 * https://github.com/richtr/doe
 *
 * A simple, accurate device orientation emulator for use in web browsers
 * that do not support device orientation events
 * (https://w3c.github.io/deviceorientation/spec-source-orientation.html)
 *
 * This emulator also supports Screen Orientation API events
 * (http://www.w3.org/TR/screen-orientation/)
 *
 * Copyright: 2015 Rich Tibbett
 * License:   MIT
 *
 */

( function() {

	var emulatorUrl = new URL( 'https://richtr.github.io/doe/emulator' );

	function loadSWAL( callback ) {
		var swalCSSEl = document.createElement( 'link' );
		swalCSSEl.href = 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.0.1/sweetalert.min.css';
		swalCSSEl.type = 'text/css';
		swalCSSEl.rel = 'stylesheet';
		document.getElementsByTagName( 'head' )[ 0 ].appendChild( swalCSSEl );

		var swalJSEl = document.createElement( 'script' );
		swalJSEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.0.1/sweetalert.min.js';
		swalJSEl.type = 'text/javascript';

		swalJSEl.onload = function() {
			callback();
		};

		document.getElementsByTagName( 'head' )[ 0 ].appendChild( swalJSEl );
	}

	function runDetection() {

		var checkTimeout = 1000;

		var deviceOrientationCheck = window.setTimeout( function() {

			loadSWAL( function() {
				swal( {
						title: 'No compass detected.',
						text: 'This page is built for browsers that emit hardware sensor events. If you would still like to try this page you can use an emulator.',
						type: 'error',
						showCancelButton: true,
						confirmButtonColor: '#DD6B55',
						confirmButtonText: 'Open page in emulator',
						cancelButtonText: 'Cancel',
						closeOnConfirm: true
					},
					function() {
						// Open the mobile emulator with the current URL
						var pageUrl = encodeURIComponent( window.location );
						window.location = emulatorUrl.toString() + '/?url=' + pageUrl;
					} );
			} );

		}, checkTimeout );

		var isFirstEvent = true;

		window.addEventListener( 'deviceorientation', function check() {
			// Discard first event (false positive on Chromium Desktop browsers)
			if ( isFirstEvent ) {
				isFirstEvent = false;
				return;
			}

			// Prevent emulator alert from kicking in
			window.clearTimeout( deviceOrientationCheck );
			// Remove this device orientation check
			window.removeEventListener( 'deviceorientation', check, false );
		}, false );

	}

	var actions = {
		'deviceorientation': function( data ) {

			var event = document.createEvent( 'Event' );
			event.initEvent( 'deviceorientation', true, true );

			for ( var key in data ) event[ key ] = data[ key ];
			event[ 'simulation' ] = true; // add 'simulated event' flag

			window.dispatchEvent( event );

		},
		'screenOrientationChange': function( data ) {

			data %= 360;

			// Update window.orientation
			window.orientation = data;

			// Fire a 'orientationchange' event at window
			var event = document.createEvent( 'Event' );
			event.initEvent( 'orientationchange', true, true );
			window.dispatchEvent( event );

			// Update window.screen.orientation.angle
			if ( !angleToType[ data ] ) return;
			screenOrientationAngle = data;
			// Also update window.screen.orientation.type
			screenOrientationType = angleToType[ data ];

			// Fire a 'change' event at window.screen.orientation
			var event = document.createEvent( 'Event' );
			event.initEvent( 'change', true, true );
			window.screen.orientation.dispatchEvent( event );

		}
	};

	function runEmulation() {

		var listener = function( event ) {
			if ( event.origin !== emulatorUrl.origin ) return;

			var json = JSON.parse( event.data );

			if ( !json.action || !actions[ json.action ] ) return;

			actions[ json.action ]( json.data );

		};

		window.addEventListener( 'message', listener, false );

	}

	// *** START Screen Orientation API emulator

	var angleToType = {
		'0': 'portrait-primary',
		'90': 'landscape-primary',
		'180': 'portrait-secondary',
		'270': 'landscape-secondary',
		// Aliases
		'-90': 'landscape-secondary',
		'-180': 'portrait-secondary',
		'-270': 'landscape-primary',
		'360': 'portrait-primary',
	};
	var typeToAngle = {
		'portrait-primary': 0,
		'portrait-secondary': 180,
		'landscape-primary': 90,
		'landscape-secondary': 270,
		// Additional types
		'any': 0,
		'natural': 0,
		'landscape': 90,
		'portrait': 0
	};

	var screenOrientationAngle = 0;
	var screenOrientationType = 'portrait-primary';

	var hasScreenOrientationAPI = window.screen && window.screen.orientation ? true : false;

	function overrideScreenOrientationAPI() {

		// If browser does not support the Screen Orientation API, add a stub for it
		if ( !hasScreenOrientationAPI ) {
			if ( !window.screen ) window.screen = {};

			function Emitter() {
				var eventTarget = document.createDocumentFragment();

				function delegate( method ) {
					this[ method ] = eventTarget[ method ].bind( eventTarget );
				}

				[
					"addEventListener",
					"dispatchEvent",
					"removeEventListener"
				].forEach( delegate, this );
			}

			function ScreenOrientation() {
				Emitter.call( this );
			}

			if ( !window.screen.orientation ) window.screen.orientation = new ScreenOrientation();
		}

		// Override Screen Orientation API 'angle' built-in getter
		window.screen.orientation.__defineGetter__( 'angle', function() {

			return screenOrientationAngle;

		} );

		// Override Screen Orientation API 'type' built-in getter
		window.screen.orientation.__defineGetter__( 'type', function() {

			return screenOrientationType;

		} );

		window.screen.orientation.__proto__.lock = function( val ) {

			var p = new Promise( function( resolve, reject ) {

				var angle = typeToAngle[ val ];

				if ( angle === undefined || angle === null ) {
					window.setTimeout( function() {
						reject( "Cannot lock to given screen orientation" ); // reject as invalid
					}, 1 );
					return;
				}

				// Update window.orientation
				window.orientation = angle;

				// Fire a 'orientationchange' event at window
				var event = document.createEvent( 'Event' );
				event.initEvent( 'orientationchange', true, true );
				window.dispatchEvent( event );

				// Update window.screen.orientation.angle
				if ( !angleToType[ angle ] ) return;
				screenOrientationAngle = angle;
				// Also update window.screen.orientation.type
				screenOrientationType = angleToType[ angle ];

				// Fire a 'change' event at window.screen.orientation
				var event = document.createEvent( 'Event' );
				event.initEvent( 'change', true, true );
				window.screen.orientation.dispatchEvent( event );

				// Lock the screen orientation icon in parent emulator
				if ( !window.parent ) return;

				window.parent.postMessage( JSON.stringify( {
					'action': 'lockScreenOrientation',
					'data': angle
				} ), '*' );

				window.setTimeout( function() {
					resolve();
				}, 1 );

			} );

			return p;

		};

		window.screen.orientation.__proto__.unlock = function( val ) {

			// Unlock the screen orientation icon in parent emulator
			if ( !window.parent ) return;

			window.parent.postMessage( JSON.stringify( {
				'action': 'unlockScreenOrientation'
			} ), '*' );

		}

	}

	// Inject Screen Orientation API shim ASAP when running in emulator
	var parentUrl = new URL( document.referrer || 'http:a' );

	if ( parentUrl.origin === emulatorUrl.origin && parentUrl.pathname.indexOf( emulatorUrl.pathname, 0 ) === 0 ) {

		// We were kicked from the referrer!
		loadSWAL( function() {
			swal({
				title: "Compass detected.",
				text: "You have been redirected here from the emulator because your device supports the required hardware sensor events.",
				type: "success",
				confirmButtonColor: "#638450"
			});
		} );

	} else if ( document.referrer == "" || window.parent == window || parentUrl.origin !== emulatorUrl.origin ) {

		// Check if device orientation events are supported.
		// If not, show the emulator alert message.
		if ( document.readyState === 'complete' ) {
			runDetection();
		} else {
			window.addEventListener( 'load', runDetection, false );
		}

	} else {

		// Make sure the screen orientation API is set up
		overrideScreenOrientationAPI();

		// Listen for proxied device orientation events
		runEmulation();

	}

	// *** END Screen Orientation API emulator

} )();
