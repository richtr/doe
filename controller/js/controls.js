window.addEventListener( 'load', function() {

	var url = new URL( document.location );

	var loader = new THREE.XHRLoader();

	loader.load( 'data/app.json', function( text ) {

		var player = new APP.Player();
		player.load( JSON.parse( text ) );
		player.setSize( window.innerWidth, window.innerHeight );

		document.body.appendChild( player.dom );

		window.addEventListener( 'resize', function() {
			player.setSize( window.innerWidth, window.innerHeight );
		} );

		// Listen for device orientation events fired from the emulator
		// and dispatch them on to the parent window
		window.addEventListener( 'deviceorientation', function( event ) {

			if ( !window.parent ) return;

			var normalizedAlpha = event.alpha;
			var normalizedBeta = event.beta;
			var normalizedGamma = event.gamma;

			// normalize resulting data that is passed back to pages
			if(normalizedAlpha == 360) normalizedAlpha = 0;
			if(normalizedBeta == 180) normalizedBeta = -180;
			if(normalizedGamma == 90) normalizedGamma = -90;

			sendMessage(
				window.parent, {
					'action': 'newData',
					'data': {
						'alpha': normalizedAlpha,
						'beta': normalizedBeta,
						'gamma': normalizedGamma,
						'absolute': event.absolute,
						'roll': event.roll
					}
				}
			);

		}, false );

		var actions = {
			'start': function( data ) {
				player.play();
			},
			'restart': function( data ) {
				player.stop();
				player.play();
			},
			'setCoords': function( data ) {
				player.setManualOrientation( data.alpha, data.beta, data.gamma );
			},
			'rotateScreen': function( data ) {
				player.updateScreenOrientation( data );

				if ( window.parent ) {
					sendMessage(
						window.parent, {
							'action': 'updatePosition'
						}
					);
				}
			}
		};

		// Receive messages from window.parent
		window.addEventListener( 'message', function( event ) {

			if ( event.origin != url.origin ) return;

			var json = JSON.parse( event.data );

			if ( !json.action || !actions[ json.action ] ) return;

			actions[ json.action ]( json.data );

		}, false );

		// Kick off the controller by telling its parent window that it is now ready
		if ( window.parent ) {

			sendMessage(
				window.parent, {
					'action': 'connect'
				}
			);
		}

	} );
}, false );
