function startEmulator() {

	var selfUrl = new URL( window.location );

	var controller = document.querySelector( 'iframe#controller' );
	var emulatorMenu = document.querySelector( '#emulator' );

	var deviceFrame = document.querySelector( 'iframe#deviceFrame' );

	controller.addEventListener( 'load', function() {
		controller.isLoaded = true;

		controller.style.display = 'block';
		emulatorMenu.style.display = 'block';
	}, false );

	// Load controller
	controller.src = '../controller/index.html';

	deviceFrame.addEventListener( 'load', function() {
		deviceFrame.isLoaded = true;
		deviceFrame.style.display = 'block';
	}, false );

	// Load target in screen iframe
	deviceFrame.src = "screen.html" + location.search;

	var scaleFactor = 1;

	$( 'button[data-viewport-width]' ).on( 'click', function( e ) {
		if ( $( this ).attr( 'data-viewport-width' ) == '100%' ) {
			newWidth = '100%';
		} else {
			newWidth = $( this ).attr( 'data-viewport-width' );
		}
		if ( $( this ).attr( 'data-viewport-height' ) == '100%' ) {
			newHeight = '100%';
		} else {
			newHeight = $( this ).attr( 'data-viewport-height' );
		}
		$( 'button[data-viewport-width]' ).removeClass( 'asphalt active' ).addClass( 'charcoal' );
		$( this ).addClass( 'asphalt active' ).removeClass( 'charcoal' );
		$( '#deviceFrame' ).css( {
			'min-width': newWidth,
			'min-height': newHeight
		} );
		e.preventDefault();

		var w = parseInt( newWidth, 10 );
		var h = parseInt( newHeight, 10 );
		var newDimension = 0;

		// Take the larger of the two values
		if ( w >= h ) {
			newDimension = w;
		} else {
			newDimension = h;
		}

		// Relay new dimensions on to deviceFrame
		sendMessage(
			deviceFrame, {
				'action': 'updateScreenDimensions',
				'data': {
					'newWidth': newDimension + "px",
					'newHeight': newDimension + "px"
				}
			},
			selfUrl.origin
		);

		return false;
	} );

	$( 'button.rotate' ).on( 'click', function( e ) {

		var currentRotation = currentScreenOrientation == 0 ? 360 : currentScreenOrientation;

		updateScreenOrientation( currentRotation - 90, true );

	} );

	var deviceScaleValue = $( '#deviceScaleValue' );

	$( '#deviceScaling' ).on( 'input', function( e ) {
		scaleFactor = e.target.value;
		deviceScaleValue.text( scaleFactor + "x" );
	} );

	$( 'button.reset' ).on( 'click', function( e ) {

		// reset the controller
		sendMessage(
			controller, {
				'action': 'restart'
			},
			selfUrl.origin
		);

		// Update controller rendering
		sendMessage(
			controller, {
				'action': 'rotateScreen',
				'data': {
					'rotationDiff': currentScreenOrientation,
					'totalRotation': currentScreenOrientation,
					'updateControls': true
				}
			},
			selfUrl.origin
		);

	} );

	// Add keyboard shortcuts to switch in-emulator device type
	$( document ).on( 'keyup', function( e ) {
		switch ( e.keyCode ) {
			/*case 49:
				$( '[data-device="iphone"]' ).trigger( 'click' );
				break;
			case 50:
				$( '[data-device="android"]' ).trigger( 'click' );
				break;
			case 51:
				$( '[data-device="tablet"]' ).trigger( 'click' );
				break;
			case 52:
				$( '[data-device="ipad"]' ).trigger( 'click' );
				break;*/
			case 32:
			case 56:
			case 82:
				$( '.rotate' ).trigger( 'click' );
				break;
		}
	} );

	var currentScreenOrientation = 360;

	function updateScreenOrientation( requestedScreenOrientation, updateControls ) {

		// Calculate rotation difference
		var currentRotation = currentScreenOrientation == 0 ? 360 : currentScreenOrientation;

		var rotationDiff = currentRotation - requestedScreenOrientation;

		// Update controller rendering
		sendMessage(
			controller, {
				'action': 'rotateScreen',
				'data': {
					'rotationDiff': -rotationDiff,
					'totalRotation': requestedScreenOrientation,
					'updateControls': updateControls
				}
			},
			selfUrl.origin
		);

		// Notify emulated page that screen orientation has changed
		sendMessage(
			deviceFrame, {
				'action': 'screenOrientationChange',
				'data': 360 - requestedScreenOrientation
			},
			selfUrl.origin
		);

		if ( ( ( currentRotation / 90 ) % 2 ) !== ( ( requestedScreenOrientation / 90 ) % 2 ) ) {

			$( 'button[data-rotate=true]' ).each( function() {
				width = $( this ).attr( 'data-viewport-width' );
				height = $( this ).attr( 'data-viewport-height' );
				$( this ).attr( 'data-viewport-width', height );
				$( this ).attr( 'data-viewport-height', width );
				if ( $( this ).hasClass( 'active' ) ) {
					$( this ).trigger( 'click' );
				}
			} );

		}

		screenOrientationEl.textContent = ( 360 - requestedScreenOrientation ) % 360;

		// Update current screen orientation
		currentScreenOrientation = requestedScreenOrientation;

	}

	var orientationAlpha = document.querySelector( 'input#orientationAlpha' );
	var orientationBeta = document.querySelector( 'input#orientationBeta' );
	var orientationGamma = document.querySelector( 'input#orientationGamma' );

	var userIsEditing = false;

	function onUserIsEditingStart(e) {
		userIsEditing = true;
	}

	function onUserIsEditingEnd(e) {
		var alpha = parseFloat(orientationAlpha.value, 10);
		var beta = parseFloat(orientationBeta.value, 10);
		var gamma = parseFloat(orientationGamma.value, 10);

		// Fit all inputs within acceptable interval
		alpha = alpha % 360;
		if(beta < -180) beta = -180;
		if(beta > 180) beta = 180;
		if(gamma < -90) gamma = -90;
		if(gamma > 90) gamma = 90;

		sendMessage(
			controller, {
				'action': 'setCoords',
				'data': {
					'alpha': alpha || 0,
					'beta': beta || 0,
					'gamma': gamma || 0
				}
			},
			selfUrl.origin
		);

	}

	function stopUserEditing(e) {
		userIsEditing = false;
	}

	function stopUserEditingKey(e) {
		var keyCode = e.which || e.keyCode;
		if (keyCode !== 13) {
			return true;
		}
		// Force blur when return key is pressed
		var target = e.target;
		target.blur();
	}

	orientationAlpha.addEventListener('focus', onUserIsEditingStart, false);
	orientationAlpha.addEventListener('change', onUserIsEditingEnd, false);
	orientationAlpha.addEventListener('keypress', stopUserEditingKey, false);
	orientationAlpha.addEventListener('blur', stopUserEditing, false);

	orientationBeta.addEventListener('focus', onUserIsEditingStart, false);
	orientationBeta.addEventListener('change', onUserIsEditingEnd, false);
	orientationBeta.addEventListener('keypress', stopUserEditingKey, false);
	orientationBeta.addEventListener('blur', stopUserEditing, false);

	orientationGamma.addEventListener('focus', onUserIsEditingStart, false);
	orientationGamma.addEventListener('change', onUserIsEditingEnd, false);
	orientationGamma.addEventListener('keypress', stopUserEditingKey, false);
	orientationGamma.addEventListener('blur', stopUserEditing, false);

	var screenOrientationEl = document.querySelector( '#screenOrientation' );

	var actions = {
		'connect': function( data ) {

			var urlHash = selfUrl.hash;

			// Tell controller to start rendering
			sendMessage(
				controller, {
					'action': 'start'
				},
				selfUrl.origin
			);

			// If any deviceorientation URL params are provided, send them to the controller
			if ( urlHash.length > 6 ) {
				var coords = urlHash.substring( 1 );
				try {
					var coordsObj = JSON.parse( coords );

					if ( ( coordsObj.length === 3 || coordsObj.length === 4 ) && ( coordsObj[ 0 ] || coordsObj[ 1 ] || coordsObj[ 2 ] ) ) {

						sendMessage(
							controller, {
								'action': 'setCoords',
								'data': {
									'alpha': coordsObj[ 0 ] || 0,
									'beta': coordsObj[ 1 ] || 0,
									'gamma': coordsObj[ 2 ] || 0
								}
							},
							selfUrl.origin
						);

						// Use 4th parameter to set the screen orientation
						if ( coordsObj[ 3 ] ) {
							var requestedScreenOrientation = coordsObj[ 3 ] * 1;
							if ( requestedScreenOrientation / 90 > 0 && requestedScreenOrientation / 90 < 4 ) {

								if ( deviceFrame.contentWindow.screenFrame.isLoaded ) {
									updateScreenOrientation( 360 - requestedScreenOrientation, false );
								} else {
									deviceFrame.contentWindow.screenFrame.addEventListener( 'load', function() {
										updateScreenOrientation( 360 - requestedScreenOrientation, false );
									}, false );
								}

							}
						}

					}
				} catch ( e ) {}
			}

		},
		'newData': function( data ) {

			// Print deviceorientation data values in GUI
			if (!userIsEditing) {
				orientationAlpha.value = printDataValue( data.alpha );
				orientationBeta.value = printDataValue( data.beta );
				orientationGamma.value = printDataValue( data.gamma );
			}

			// Indicate that certain values are shown rounded for display purposes
			if ( orientationBeta.textContent === "180" ) orientationBeta.textContent += "*";
			if ( orientationGamma.textContent === "90" ) orientationGamma.textContent += "*";

			var roll = data[ 'roll' ] || 0;
			delete data[ 'roll' ]; // remove roll attribute from json

			// Post deviceorientation data to deviceFrame window
			sendMessage(
				deviceFrame, {
					'action': 'deviceorientation',
					'data': data
				},
				selfUrl.origin
			);

			// Apply roll compensation to deviceFrame
			deviceFrame.style.webkitTransform = deviceFrame.style.msTransform = deviceFrame.style.transform = 'rotate(' + ( roll - currentScreenOrientation ) + 'deg) scale(' + scaleFactor + ')';

		},
		'updatePosition': function( data ) {

			window.setTimeout( function() {
				var hashData = [
					parseFloat( orientationAlpha.value, 10 ),
					parseFloat( orientationBeta.value, 10 ),
					parseFloat( orientationGamma.value, 10 ), ( 360 - currentScreenOrientation ) % 360
				].join( ',' );

				selfUrl.hash = '#[' + hashData + ']';

				replaceURL( selfUrl );
			}, 100 );

		},
		'lockScreenOrientation': function( data ) {

			updateScreenOrientation( ( 360 - data ) % 360, true );

			$( 'button.rotate' ).prop( "disabled", true ).attr( "title", "Screen Rotation is locked by page" );
			$( 'i', 'button.rotate' ).addClass( 'icon-lock' ).removeClass( 'icon-rotate-left' );

		},
		'unlockScreenOrientation': function( data ) {

			$( 'button.rotate' ).attr( "title", "Rotate the Screen" ).prop( "disabled", false );
			$( 'i', 'button.rotate' ).addClass( 'icon-rotate-left' ).removeClass( 'icon-lock' );

		}
	}

	// Relay deviceorientation events on to content iframe
	window.addEventListener( 'message', function( event ) {

		if ( event.origin != selfUrl.origin ) return;

		var json = JSON.parse( event.data );

		if ( !json.action || !actions[ json.action ] ) return;

		actions[ json.action ]( json.data );

	}, false );

}
