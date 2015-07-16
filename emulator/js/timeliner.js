function EmulatorTimeline( alpha, beta, gamma, screen ) {

	var _frames = [];

	this.import = function( frames ) {
		_frames = frames;
	};

	this.getAll = function( index ) {
		return _frames;
	};

	this.get = function( index ) {
		return _frames[ index ];
	};

	this.set = function( obj, duration, offset, index ) {

		var frame = {
			'type': 0, // FIX TO POSITION
			'duration': duration || 1,
			'offset': offset || 0,
			'data': obj || {}
		};

		if ( index !== undefined && index !== null ) {
			// Update an existing animation frame
			_frames[ index ] = frame;
		} else {
			// Append a new animation frame
			_frames.push( frame );
		}

		return this;

	};

	this.length = function() {
		return _frames.length;
	};

	this.animate = function( obj, duration, offset, index ) {

		var frame = {
			'type': 1, // ANIMATE TO POSITION
			'duration': duration || 1,
			'offset': offset || 0,
			'data': obj || {}
		};

		if ( index !== undefined && index !== null ) {
			// Update an existing animation frame
			_frames[ index ] = frame;
		} else {
			// Append a new animation frame
			_frames.push( frame );
		}

		return this;

	};

	this.start = function() {

		sendMessage(
			controller, {
				'action': 'playback',
				'data': {
					'frames': _frames
				}
			},
			selfUrl.origin
		);

		return this;

	};

	// Set initial device orientation frame data
	var data = {
		'alpha': alpha || 0,
		'beta': beta || 0,
		'gamma': gamma || 0,
		'screen': screen || 0
	};

	this.set( data, 1, 0 );

};

EmulatorTimeline.prototype = {

	'constructor': EmulatorTimeline,

	// Static method
	'compress': function( framesOriginal ) {
		var framesCompressed = [];

		for ( var i = 0, l = framesOriginal.length; i < l; i++ ) {
			framesCompressed.push( [
				framesOriginal[ i ].type,
				framesOriginal[ i ].duration,
				framesOriginal[ i ].offset,
				framesOriginal[ i ].data.alpha,
				framesOriginal[ i ].data.beta,
				framesOriginal[ i ].data.gamma,
				framesOriginal[ i ].data.screen
			] );
		}

		return framesCompressed;
	},

	'uncompress': function( framesCompressed ) {
		var framesOriginal = [];

		for ( var i = 0, l = framesCompressed.length; i < l; i++ ) {
			var data = {
				'type': framesCompressed[ i ][ 0 ],
				'duration': framesCompressed[ i ][ 1 ],
				'offset': framesCompressed[ i ][ 2 ],
				'data': {
					'alpha': framesCompressed[ i ][ 3 ],
					'beta': framesCompressed[ i ][ 4 ],
					'gamma': framesCompressed[ i ][ 5 ],
					'screen': framesCompressed[ i ][ 6 ]
				}
			};

			framesOriginal.push( data );
		}

		return framesOriginal;
	}

};

// Create a new emulator timeline
var timeline = new EmulatorTimeline( 0, 0, 0, 0 );

var activeFrameIndex = 0;
var _lastData = {};

var actions = {
	'connect': function( data ) {

		$( 'button#play' ).on( 'click', function() {
			$( 'button[data-frame-number=0]' ).removeClass( 'charcoal' ).addClass( 'asphalt active' );

			$( 'button[data-frame-number=0]' ).trigger( 'click' );

			timeline.start();
		} );

		$( 'body' ).on( 'click', 'button[data-frame-number]', function() {

			activeFrameIndex = $( this ).attr( 'data-frame-number' );

			var activeFrame = timeline.get( activeFrameIndex );

			sendMessage(
				controller, {
					'action': 'setCoords',
					'data': activeFrame.data
				},
				selfUrl.origin
			);

			// Post message to self to update screen orientation
			postMessage( JSON.stringify( {
				'action': 'updateScreenOrientation',
				'data': {
					'totalRotation': ( 360 - activeFrame.data.screen ) % 360,
					'updateControls': false
				}
			} ), selfUrl.origin );

			$( 'button.active[data-frame-number]' ).removeClass( 'asphalt active' ).addClass( 'charcoal' );
			$( 'button[data-frame-number=' + activeFrameIndex + ']' ).removeClass( 'charcoal' ).addClass( 'asphalt active' );

		} );

		$( 'button#clearTimeline' ).on( 'click', function() {

			// Trash all frame buttons except the first one
			$( 'button[data-frame-number]' ).not( ':first' ).remove();

			var startFrame = timeline.get( 0 );
			// Reset timeline
			timeline.import( [ startFrame ] );

			// Focus the first frame
			$( 'button[data-frame-number=0]' ).trigger( 'click' );

		} );

		$( 'button#addNewFrame' ).on( 'click', function() {

			var newFrameId = timeline.length();

			if ( timeline.get( newFrameId ) == undefined ) {

				// Use last known device orientation values to initialize new animation frame
				var data = {
					alpha: printDataValue( _lastData.alpha ),
					beta: printDataValue( _lastData.beta ),
					gamma: printDataValue( _lastData.gamma ),
					screen: _lastData.screen
				};

				timeline.animate( data, 1, 0 );

			}

			// Create and add a new frame button to GUI
			$( '#frame-group' ).append(
				$( '<li></li>' ).append(
					$( '<button class="frame charcoal" tabindex="-1"></button>' )
					.attr( 'data-frame-number', newFrameId )
					.attr( 'data-disable-during-playback', 'true' )
					.text( newFrameId + 1 )
				)
			);

			// Highlight new frame
			$( 'button[data-frame-number=' + newFrameId + ']' ).trigger( 'click' );

			// Don't allow more than 20 frames
			if ( newFrameId >= 19 ) {

				$( 'button#addNewFrame' ).attr( 'disabled', 'disabled' );

			}

		} );

		// Tell controller to start rendering
		sendMessage(
			controller, {
				'action': 'start'
			},
			selfUrl.origin
		);

		var urlHash = selfUrl.hash;

		// Parse provided JSON animation hash object (if any)
		if ( urlHash && urlHash.length > 3 ) {
			// Remove leading '#'
			var jsonBase64 = urlHash.substring( 1 );

			// Base64 decode this data
			var jsonStr = window.atob( jsonBase64 );

			try {
				var json = JSON.parse( "{\"d\": " + jsonStr + " }" );

				// 'Unzip' the data
				var frames = EmulatorTimeline.prototype.uncompress( json.d );

				if ( frames && frames.length > 0 ) {

					// Create the correct number of animation frame buttons
					for ( var i = 1; i < frames.length; i++ ) {
						$( 'button#addNewFrame' ).trigger( 'click' );
					}

					// Import json as the emulator timeline
					timeline.import( frames );

					// Focus the first frame
					$( 'button[data-frame-number=0]' ).trigger( 'click' );

					// Update onscreen coords
					sendMessage(
						controller, {
							'action': 'setCoords',
							'data': {
								'alpha': frames[ 0 ].data.alpha || 0,
								'beta': frames[ 0 ].data.beta || 0,
								'gamma': frames[ 0 ].data.gamma || 0
							}
						},
						selfUrl.origin
					);

					// Post message to self to then update controller screen orientation
					postMessage( JSON.stringify( {
						'action': 'updateScreenOrientation',
						'data': {
							'totalRotation': ( 360 - frames[ 0 ].data.screen ) % 360,
							'updateControls': false
						}
					} ), selfUrl.origin );

					// Start whatever animation was loaded when page loads
					window.setTimeout(function() {
							timeline.start();
					}, 500); // delay until setCoords and updateScreenOrientation above complete

				}
			} catch ( e ) {
				console.log( e );
			}

		}

		$( '#timeline' ).css( {
			'display': 'block'
		} );

	},
	'newData': function( data ) {
		var _data = {
			alpha: printDataValue( data.alpha ),
			beta: printDataValue( data.beta ),
			gamma: printDataValue( data.gamma ),
			screen: data.screen
		}

		if ( _data.alpha == _lastData.alpha && _data.beta == _lastData.beta && _data.gamma == _lastData.gamma && _data.screen == _lastData.screen ) return;

		// If this data applies to the first frame or a screen orientation change
		// is being observed then use .set instead of .animate!
		if ( activeFrameIndex === 0 || _data.screen !== _lastData.screen ) {
			timeline.set( _data, _data.screen !== _lastData.screen ? 1 : 0.5, 0, activeFrameIndex );
		} else {
			timeline.animate( _data, 1, 0, activeFrameIndex );
		}

		_lastData = _data; // store for next loop
	},
	'updatePosition': function( data ) {
		window.setTimeout( function() {
			// 'Zip' the current timeline data
			var framesCompressed = EmulatorTimeline.prototype.compress( timeline.getAll() );

			// Stringify the data object
			var jsonStr = JSON.stringify( framesCompressed );

			// Base64 encode the data object
			var jsonBase64 = window.btoa( jsonStr );

			// Replace current URL hash with compressed, stringified, encoded data!
			selfUrl.hash = '#' + jsonBase64;
			replaceURL( selfUrl );
		}, 150 );
	},
	'playbackStarted': function( data ) {

		// Disable buttons
		$( '[data-disable-during-playback]' ).each( function() {
			$( this ).attr( 'disabled', 'disabled' );
		} );

	},
	'playbackTransition': function( data ) {

		// Disable the previous frame if we have one
		if ( data > 0 ) {
			var previousFrameButton = $( 'button[data-frame-number=' + ( data - 1 ) + ']' );

			previousFrameButton.removeClass( 'asphalt active' )
			previousFrameButton.addClass( 'charcoal' );
			previousFrameButton.attr( 'disabled', 'disabled' );
		}

		$( 'button[data-frame-number=' + data + ']' ).removeAttr( 'disabled' ).trigger( 'click' );

	},
	'playbackEnded': function( data ) {

		// Re-enable buttons
		$( '[data-disable-during-playback]' ).each( function() {
			$( this ).removeAttr( 'disabled' );
		} );

		$( 'button[data-frame-number=0]' ).trigger( 'click' );

	}
};

window.addEventListener( 'message', function( event ) {

	if ( event.origin != selfUrl.origin ) return;

	var json = JSON.parse( event.data );

	if ( !json.action || !actions[ json.action ] ) return;

	actions[ json.action ]( json.data );

}, false );
