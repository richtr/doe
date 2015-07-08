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

	var resizerFrame = document.querySelector( 'iframe#resizerFrame' );

	if ( urlParam.length > 0 ) {
		if ( urlParam.substr( 0, 4 ) != 'http' ) {
			urlParam = 'http://' + urlParam;
		}
		targetUrl = new URL( urlParam );
		// Load url in iframe
		resizerFrame.src = urlParam;
	}

	// If any deviceorientation URL params are provided, send them to the controller
	if ( selfUrl.hash.length > 6 ) {
		var coords = selfUrl.hash.substring( 1 );
		try {

			var coordsObj = JSON.parse( coords );

			if ( coordsObj.length === 3 && ( coordsObj[ 0 ] || coordsObj[ 1 ] || coordsObj[ 2 ] ) ) {
				var controller = document.querySelector( '#controller' );
				if ( controller ) {
					var data = {
						'alpha': coordsObj[ 0 ] || 0,
						'beta': coordsObj[ 1 ] || 0,
						'gamma': coordsObj[ 2 ] || 0
					};

					if ( controller.contentWindow.document.readyState == 'complete' ) {
						window.setTimeout( function() {
							controller.contentWindow.postMessage( JSON.stringify( data ), selfUrl.origin );
						}, 1000 );
					} else {
						controller.contentWindow.addEventListener( 'load', function() {
							controller.contentWindow.postMessage( JSON.stringify( data ), selfUrl.origin );
						}, false );
					}

				}
			}

		} catch ( e ) {}
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
		$( '#resizerFrame' ).css( {
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

	$( document ).on( 'keyup', function( e ) {
		switch ( e.keyCode ) {
			case 49:
				$( '[data-device="fullscreen"]' ).trigger( 'click' );
				break;
			case 50:
				$( '[data-device="desktop"]' ).trigger( 'click' );
				break;
			case 51:
				$( '[data-device="macbook"]' ).trigger( 'click' );
				break;
			case 52:
				$( '[data-device="ipad"]' ).trigger( 'click' );
				break;
			case 53:
				$( '[data-device="tablet"]' ).trigger( 'click' );
				break;
			case 54:
				$( '[data-device="android"]' ).trigger( 'click' );
				break;
			case 55:
				$( '[data-device="iphone"]' ).trigger( 'click' );
				break;
			case 32:
			case 56:
			case 82:
				$( '.rotate' ).trigger( 'click' );
				break;
		}
	} );

	var d = {};

	// Relay deviceorientation events on to content iframe
	window.addEventListener( 'message', function( event ) {
		var json = JSON.parse( event.data );

		switch ( json.action ) {
			case 'newData':
				var roll = json.data[ 'roll' ] || 0;
				delete json.data[ 'roll' ]; // remove roll attribute from json

				// Post deviceorientation data to resizerFrame window
				resizerFrame.contentWindow.postMessage( JSON.stringify( json.data ), targetUrl.origin );

				// Apply roll compensation to resizerFrame
				resizerFrame.style.transform = 'rotateZ(' + roll + 'deg)';

				// Store latest data so it can be used if/when 'updatePosition' case runs
				d = json.data;

				break;

			case 'updatePosition':
				// replace current page's URL hash (if History API is supported)
				if ( 'replaceState' in history ) {
					history.replaceState( '', '', '#[' + d[ 'alpha' ] + ',' + d[ 'beta' ] + ',' + d[ 'gamma' ] + ']' );
				}

				break;
		}
	}, false );


}, false );
