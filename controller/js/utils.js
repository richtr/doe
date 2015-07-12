function dispatchDeviceOrientationEvent( values ) {
	var data = values || {};

	// Create and dispatch an emulated device orientation event at window
	// object
	var event = document.createEvent( 'Event' );
	event.initEvent( 'deviceorientation', true, true );

	// Enforce range mathematical intervals
	if ( data.alpha === 360 ) data.alpha %= 360;  // [0, 360)
	if ( data.beta === 180 ) data.beta -= 1e-7;  // [-180, 180)
	if ( data.gamma === 90 ) data.gamma -= 1e-7; // [-90, 90)

	var eventData = {
		'alpha': data.alpha,
		'beta': data.beta,
		'gamma': data.gamma,
		'absolute': true,
		'roll': data.roll || 0 // custom attribute for emulator roll adjustment
	};

	for ( var key in eventData ) event[ key ] = eventData[ key ];
	event[ 'simulation' ] = true; // add 'simulated event' flag

	window.dispatchEvent( event );
}

function sendMessage( target, json, origin ) {
	target[ 'postMessage' ]( JSON.stringify( json ), origin || '*' );
}
