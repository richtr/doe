function dispatchDeviceOrientationEvent( values ) {
	var data = values || {};

	// Create and dispatch an emulated device orientation event at window
	// object
	var event = document.createEvent( 'Event' );
	event.initEvent( 'deviceorientation', true, true );

	if ( data.alpha >= 360 ) data.alpha %= 360;

	var eventData = {
		'alpha': data.alpha || 0,
		'beta': data.beta || 90,
		'gamma': data.gamma || 0,
		'absolute': true,
		'roll': data.roll || 0 // custom attribute for emulator roll adjustment
	};

	for ( var key in eventData ) event[ key ] = eventData[ key ];
	event[ 'simulation' ] = true; // add 'simulated event' flag

	window.dispatchEvent( event );
}
