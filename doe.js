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

	var Detector = ( function() {

		var detectorLoaded = false;

		return function() {

			if ( detectorLoaded ) return;

			var detectionCheckTimeout = 1000;

			var deviceOrientationCheck = window.setTimeout( function() {

				SweetAlertLoader( function() {
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

			}, detectionCheckTimeout );

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

			detectorLoaded = true;

		};

	} )();

	var Emulator = ( function() {

		var _this = this;

		var emulatorLoaded = false;

		var actions = {
			'deviceorientation': function( data ) {

				var event = document.createEvent( 'Event' );
				event.initEvent( 'deviceorientation', true, true );

				for ( var key in data ) event[ key ] = data[ key ];
				event[ 'simulation' ] = true; // add 'simulated event' flag

				window.dispatchEvent( event );

			},
			'screenOrientationChange': function( data ) {

				// Update window.screen.orientation.angle
				_this.screenOrientationAPI.update( data );

			}
		};

		var listener = function( event ) {

			if ( event.origin !== emulatorUrl.origin ) return;

			var json = JSON.parse( event.data );

			if ( !json.action || !actions[ json.action ] ) return;

			actions[ json.action ]( json.data );

		}.bind( this );

		return function() {

			if ( emulatorLoaded ) return;

			// Set up Screen Orientation API
			_this.screenOrientationAPI = new ScreenOrientationAPI();

			// Listen for incoming window messages from parent
			window.addEventListener( 'message', listener, false );

			emulatorLoaded = true;

		};

	} )();

	function ScreenOrientationAPI() {

		var _this = this;

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

		var hasScreenOrientationAPI = window.screen && window.screen.orientation ? true : false;

		_this._angle = 0;
		_this._type = 'portrait-primary';

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

		function _ScreenOrientation() {
			Emitter.call( this );
		}

		// Update internal screen orientation and fire the appropriate DOM events
		this.update = function( angle ) {

			var _angle = angle % 360;

			// Update internal API values
			_this._angle = _angle;
			_this._type = angleToType[ _angle ];

			// Update window.orientation
			window.orientation = _this._angle;

			// Fire a 'orientationchange' event at window
			var event = document.createEvent( 'Event' );
			event.initEvent( 'orientationchange', true, true );
			window.dispatchEvent( event );

			// Fire a 'change' event at window.screen.orientation
			var event = document.createEvent( 'Event' );
			event.initEvent( 'change', true, true );
			window.screen.orientation.dispatchEvent( event );

		};

		// If browser does not support the Screen Orientation API, add a stub for it
		if ( !hasScreenOrientationAPI ) {
			if ( !window.screen ) window.screen = {};
			if ( !window.screen.orientation ) window.screen.orientation = new _ScreenOrientation();
		}

		// Override Screen Orientation API 'angle' built-in getter
		window.screen.orientation.__defineGetter__( 'angle', function() {
			return _this._angle;
		} );

		// Override Screen Orientation API 'type' built-in getter
		window.screen.orientation.__defineGetter__( 'type', function() {
			return _this._type;
		} );

		window.screen.orientation.__proto__.lock = function( val ) {
			var p = new Promise( function( resolve, reject ) {

				// Check a valid type is provided
				var angle = typeToAngle[ val ];

				if ( angle === undefined || angle === null ) {
					window.setTimeout( function() {
						reject( "Cannot lock to given screen orientation" ); // reject as invalid
					}, 1 );
					return;
				}

				_this.update( angle );

				window.setTimeout( function() {
					resolve();
				}, 1 );

				// Lock the screen orientation icon in parent emulator
				if ( window.parent ) {

					window.parent.postMessage( JSON.stringify( {
						'action': 'lockScreenOrientation',
						'data': angle
					} ), '*' );

				}

			} );

			return p;
		};

		window.screen.orientation.__proto__.unlock = function( val ) {
			if ( !window.parent ) return;

			window.parent.postMessage( JSON.stringify( {
				'action': 'unlockScreenOrientation'
			} ), '*' );
		};

		return this;

	}

	var SweetAlertLoader = ( function() {

		var isSWALLoaded = false;

		return function( callback ) {

			if ( isSWALLoaded ) return;

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

			isSWALLoaded = true;

		}

	} )();

	// Run on start

	var referrerUrl = new URL( document.referrer || 'http:a' );
	var referrerPath = referrerUrl.pathname;

	var originsMatch = referrerUrl.origin === emulatorUrl.origin;
	var pathsMath = referrerPath.indexOf( emulatorUrl.pathname, 0 ) === 0;
	var notScreenEmbedded = referrerPath.indexOf( "/screen", 0 ) < 0;

	if ( originsMatch && pathsMath && notScreenEmbedded ) {
		// We have been kicked from the emulator.
		// Display an alert that we were kicked.
		SweetAlertLoader( function() {
			swal( {
				title: "Compass detected.",
				text: "You have been redirected here from the emulator because your device supports the required hardware sensor events.",
				type: "success",
				confirmButtonColor: "#638450"
			} );
		} );
	} else if ( window == window.parent ) {
		// Check if the current UA supports device orientation events.
		// If not, then display a prompt to try this page in the emulator.
		if ( document.readyState === 'complete' ) {
			Detector();
		} else {
			window.addEventListener( 'load', Detector, false );
		}
	} else {
		// Run the emulator (listen for proxied events from parent window)
		Emulator();
	}

} )();
