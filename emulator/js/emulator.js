window.addEventListener( 'load', function() {

	var selfUrl = new URL( window.location );

	var controller = document.querySelector( '#controller' );

	var deviceFrame = document.querySelector( 'iframe#deviceFrame' );

	// Load target in screen iframe
	deviceFrame.src = "screen.html" + location.search;

	$( 'body' ).on( 'click', 'button[data-viewport-width]', function( e ) {
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
			'max-width': newWidth,
			'max-height': newHeight
		} );
		e.preventDefault();

		var newDimension;
		// Take the larger of the two values
		if ( parseInt( newWidth, 10 ) >= parseInt( newHeight, 10 ) ) {
			newDimension = newWidth;
		} else {
			newDimension = newHeight;
		}

		// Relay new dimensions on to deviceFrame
		deviceFrame.contentWindow.postMessage( JSON.stringify( {
			'action': 'updateScreenDimensions',
			'data': {
				'newWidth': newDimension,
				'newHeight': newDimension
			}
		} ), selfUrl.origin );
		return false;
	} );

	var currentScreenOrientation = 0;

	$( 'body' ).on( 'click', 'button.rotate', function( e ) {

		// Update controller rendering
		controller.contentWindow.postMessage( JSON.stringify( {
			'action': 'rotateScreen',
			'data': 90 // rotate screen clockwise in 90 degree increments
		} ), selfUrl.origin );

		currentScreenOrientation += 90;
		currentScreenOrientation %= 360;

		angle = ( 360 - currentScreenOrientation ) % 360;

		// Notify emulated page that screen orientation has changed
		deviceFrame.contentWindow.postMessage( JSON.stringify( {
			'action': 'screenOrientationChange',
			'data': angle
		} ), selfUrl.origin );

		$( 'button[data-rotate=true]' ).each( function() {
			//$( this ).toggleClass( 'landscape' );
			width = $( this ).attr( 'data-viewport-width' );
			height = $( this ).attr( 'data-viewport-height' );
			$( this ).attr( 'data-viewport-width', height );
			$( this ).attr( 'data-viewport-height', width );
			if ( $( this ).hasClass( 'active' ) ) {
				$( this ).trigger( 'click' );
			}
		} );

		screenOrientationEl.textContent = angle

	} );

	// Add keyboard shortcuts to switch in-emulator device type
	$( document ).on( 'keyup', function( e ) {
		switch ( e.keyCode ) {
			case 49:
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
				break;
			case 32:
			case 56:
			case 82:
				//$( '.rotate' ).trigger( 'click' );
				break;
		}
	} );

	var d = {};

	var orientationAlpha = document.querySelector( '#orientationAlpha' );
	var orientationBeta = document.querySelector( '#orientationBeta' );
	var orientationGamma = document.querySelector( '#orientationGamma' );

	var screenOrientationEl = document.querySelector( '#screenOrientation' );

	var actions = {
		'connect': function( data ) {

			// If any deviceorientation URL params are provided, send them to the controller
			if ( selfUrl.hash.length > 6 ) {
				var coords = selfUrl.hash.substring( 1 );
				try {
					var coordsObj = JSON.parse( coords );

					if ( coordsObj.length === 3 && ( coordsObj[ 0 ] || coordsObj[ 1 ] || coordsObj[ 2 ] ) ) {

						controller.contentWindow.postMessage( JSON.stringify( {
							'action': 'setCoords',
							'data': {
								'alpha': coordsObj[ 0 ] || 0,
								'beta': coordsObj[ 1 ] || 0,
								'gamma': coordsObj[ 2 ] || 0
							}
						} ), selfUrl.origin );

					}
				} catch ( e ) {}
			}

			// Tell controller to start rendering
			controller.contentWindow.postMessage( JSON.stringify( {
				'action': 'start'
			} ), selfUrl.origin );

		},
		'newData': function( data ) {

			// Print deviceorientation data values in GUI
			orientationAlpha.textContent = printDataValue( data.alpha );
			orientationBeta.textContent = printDataValue( data.beta );
			orientationGamma.textContent = printDataValue( data.gamma );

			var roll = data[ 'roll' ] || 0;
			delete data[ 'roll' ]; // remove roll attribute from json

			// Post deviceorientation data to deviceFrame window
			deviceFrame.contentWindow.postMessage( JSON.stringify( {
				'action': 'deviceorientation',
				'data': data
			} ), selfUrl.origin );

			// Apply roll compensation to deviceFrame
			deviceFrame.style.webkitTransform = deviceFrame.style.msTransform = deviceFrame.style.transform = 'rotate(' + ( roll - currentScreenOrientation ) + 'deg)';

			// Store latest data so it can be used if/when 'updatePosition' case runs
			d = data;

		},
		'updatePosition': function( data ) {

			// replace current page's URL hash (if History API is supported)
			if ( 'replaceState' in history ) {
				history.replaceState( '', '', '#[' + d[ 'alpha' ] + ',' + d[ 'beta' ] + ',' + d[ 'gamma' ] + ']' );
			}

		},
		'lockScreenOrientation': function( data ) {

			var btn = $( '.rotate' );
			var btnIcon = $( 'i', btn );

			var angle = data;

			var currentAngle = ( 360 - currentScreenOrientation ) % 360;
			if ( currentAngle == 0 ) currentAngle = 360;

			var clickNumber = ( currentAngle / 90 ) - ( angle / 90 );
			if ( clickNumber < 0 ) clickNumber *= -1;

			btn.prop( "disabled", false );

			if ( clickNumber < 4 ) {
				for ( var i = 0; i < clickNumber; i++ ) {
					btn.trigger( 'click' );
				}
			}

			btn.prop( "disabled", true ).attr( "title", "Screen Rotation is locked by page" );
			btnIcon.addClass( 'icon-lock' ).removeClass( 'icon-rotate-left' );

		},
		'unlockScreenOrientation': function( data ) {

			var btn = $( 'button.rotate' );
			var btnIcon = $( 'i', btn );

			btnIcon.addClass( 'icon-rotate-left' ).removeClass( 'icon-lock' );
			btn.attr( "title", "Rotate the Screen" ).prop( "disabled", false );

		}
	}

	// Relay deviceorientation events on to content iframe
	window.addEventListener( 'message', function( event ) {

		if ( event.origin != selfUrl.origin ) return;

		var json = JSON.parse( event.data );

		if ( !json.action || !actions[ json.action ] ) return;

		actions[ json.action ]( json.data );

	}, false );

}, false );
