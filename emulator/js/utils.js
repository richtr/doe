function getParameterByName( name ) {
	name = name.replace( /[\[]/, "\\[" ).replace( /[\]]/, "\\]" );
	var regex = new RegExp( "[\\?&]" + name + "=([^&#]*)" ),
		results = regex.exec( location.search );
	return results === null ? "" : decodeURIComponent( results[ 1 ].replace( /\+/g, " " ) );
}

function printDataValue( input ) {
	input *= 1; // force to number for emulator display
	return Math.round( ( input + 0.00001 ) * 100 ) / 100; // return to 2 decimal places
}

function sendMessage( target, json, origin ) {
	// If frame is not loaded, dispatch it when it loads
	if ( !target.isLoaded ) {
		target.addEventListener( 'load', function() {
			target.contentWindow[ 'postMessage' ]( JSON.stringify( json ), origin || '*' );
		}, false );
	} else { // Otherwise, send message immediately
		target.contentWindow[ 'postMessage' ]( JSON.stringify( json ), origin || '*' );
	}
}

function replaceURL( urlObj ) {
	if ( 'replaceState' in history ) {
		history.replaceState( null, null, urlObj.toString() );
	}
}
