function getParameterByName( name ) {
	name = name.replace( /[\[]/, "\\[" ).replace( /[\]]/, "\\]" );
	var regex = new RegExp( "[\\?&]" + name + "=([^&#]*)" ),
		results = regex.exec( location.search );
	return results === null ? "" : decodeURIComponent( results[ 1 ].replace( /\+/g, " " ) );
}

window.addEventListener( 'load', function() {

	var selfUrl = new URL( window.location );
	var targetUrl;

	var urlParam = getParameterByName( 'url' );

	var emulatorFrame = document.querySelector( 'iframe#emulatorFrame' );

	if ( urlParam.length > 0 ) {
		if ( urlParam.substr( 0, 4 ) != 'http' ) {
			urlParam = 'http://' + urlParam;
		}
		targetUrl = new URL( urlParam );
		// Load url in iframe
		emulatorFrame.src = urlParam;
	}

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
		$( '#emulatorFrame' ).css( {
			'max-width': newWidth,
			'max-height': newHeight
		} );
		e.preventDefault();
		return false;
	} );

	$( 'body' ).on( 'click', 'button.rotate', function( e ) {
		$( 'button[data-rotate=true]' ).each( function() {
			$( this ).toggleClass( 'landscape' );
			width = $( this ).attr( 'data-viewport-width' );
			height = $( this ).attr( 'data-viewport-height' );
			$( this ).attr( 'data-viewport-width', height );
			$( this ).attr( 'data-viewport-height', width );
			if ( $( this ).hasClass( 'active' ) ) {
				$( this ).trigger( 'click' );
			}
		} );
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
				$( '.rotate' ).trigger( 'click' );
				break;
		}
	} );

	var d = {};

	var actions = {
		'connect': function( data ) {

			var controller = document.querySelector( '#controller' );

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

			var roll = data[ 'roll' ] || 0;
			delete data[ 'roll' ]; // remove roll attribute from json

			// Post deviceorientation data to emulatorFrame window
			emulatorFrame.contentWindow.postMessage( JSON.stringify( data ), targetUrl.origin );

			// Apply roll compensation to emulatorFrame
			emulatorFrame.style.webkitTransform = emulatorFrame.style.msTransform = emulatorFrame.style.transform = 'rotate(' + roll + 'deg)';

			// Store latest data so it can be used if/when 'updatePosition' case runs
			d = data;

		},
		'updatePosition': function( data ) {

			// replace current page's URL hash (if History API is supported)
			if ( 'replaceState' in history ) {
				history.replaceState( '', '', '#[' + d[ 'alpha' ] + ',' + d[ 'beta' ] + ',' + d[ 'gamma' ] + ']' );
			}

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
