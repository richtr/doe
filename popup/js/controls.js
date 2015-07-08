window.addEventListener( 'load', function() {

	var loader = new THREE.XHRLoader();

	loader.load( 'data/app.json', function( text ) {

		var player = new APP.Player();
		player.load( JSON.parse( text ) );
		player.setSize( window.innerWidth, window.innerHeight );

		document.body.appendChild( player.dom );

		player.play();

		window.addEventListener( 'resize', function() {
			player.setSize( window.innerWidth, window.innerHeight );
		} );

		var orientationAlpha = document.querySelector( '#orientationAlpha' );
		var orientationBeta = document.querySelector( '#orientationBeta' );
		var orientationGamma = document.querySelector( '#orientationGamma' );

		// Listen for device orientation events fired from the emulator
		// and dispatch them on to the parent window
		window.addEventListener( 'deviceorientation', function( event ) {
			if ( !window.parent ) return;

			var data = {};
			data[ "alpha" ] = event.alpha;
			data[ "beta" ] = event.beta;
			data[ "gamma" ] = event.gamma;
			data[ "absolute" ] = event.absolute;
			data[ "roll" ] = event.roll;

			window.parent.postMessage( JSON.stringify( data ), "*" );

			// Print deviceorientation data values in GUI
			orientationAlpha.value = printDataValue( data[ "alpha" ] );
			orientationBeta.value = printDataValue( data[ "beta" ] );
			orientationGamma.value = printDataValue( data[ "gamma" ] );
		}, false );

	} );
}, false );
