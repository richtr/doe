var APP = {

	Player: function() {

		var scope = this;

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;

		var controls;

		var events = {};

		this.dom = undefined;

		this.width = 500;
		this.height = 500;

		this.load = function( json ) {

			renderer = new THREE.WebGLRenderer( {
				antialias: true
			} );
			renderer.setClearColor( 0xFFFFFF, 1 );
			renderer.setPixelRatio( window.devicePixelRatio );
			this.dom = renderer.domElement;

			this.setScene( loader.parse( json.scene ) );
			this.setCamera( loader.parse( json.camera ) );

			events = {
				update: []
			};

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				var scripts = json.scripts[ uuid ];

				for ( var i = 0; i < scripts.length; i++ ) {

					var script = scripts[ i ];

					var functions = ( new Function( 'player, scene, update', script.source + '\nreturn { update: update };' ).bind( object ) )( this, scene );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( 'APP.Player: event type not supported (', name, ')' );
							continue;

						}

						events[ name ].push( functions[ name ].bind( object ) );

					}

				}

			}

		};

		this.setCamera = function( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

		};

		this.setScene = function( value ) {

				scene = value;

			},

			this.setSize = function( width, height ) {

				if ( renderer._fullScreen ) return;

				this.width = width;
				this.height = height;

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );

			};

		var dispatch = function( array, event ) {

			for ( var i = 0, l = array.length; i < l; i++ ) {

				array[ i ]( event );

			}

		};

		var prevTime, request;

		var fulltiltEuler = new FULLTILT.Euler();

		var worldQuat = new THREE.Quaternion( -Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) );
		var camQuat = new THREE.Quaternion();
		var rotQuat = new THREE.Quaternion();

		var rotation = new THREE.Euler( 0, 0, 0, 'YXZ' );

		var animate = function( time ) {

			request = requestAnimationFrame( animate );

			dispatch( events.update, {
				time: time,
				delta: time - prevTime
			} );

			controls.update();

			// *** Calculate device orientation quaternion (without affecting rendering)
			camQuat.copy( controls.object.quaternion );
			camQuat.inverse();
			camQuat.multiply( worldQuat );
			camQuat.inverse();

			// Derive Tait-Bryan angles from calculated device orientation quaternion
			fulltiltEuler.setFromQuaternion( camQuat );

			// Calculate required emulator screen roll compensation required
			var rollZ = rotation.setFromQuaternion( controls.object.quaternion, 'YXZ' ).z;
			fulltiltEuler.roll = THREE.Math.radToDeg( -rollZ );

			// Dispatch a new 'deviceorientation' event based on derived device orientation
			dispatchDeviceOrientationEvent( fulltiltEuler );

			// Render the controller
			renderer.render( scene, camera );

			prevTime = time;

		};

		this.play = function( url ) {

			// Rotate the phone in the scene, not the camera as usual
			var phoneMesh = scene.getObjectByProperty( 'uuid', '33A20938-78BD-4994-8180-E10EC6876880', true );

			// Set up device orientation emulator controls
			controls = new DeviceOrientationEmulatorControls( phoneMesh, scope.dom );
			controls.enableManualZoom = false;
			controls.connect();

			request = requestAnimationFrame( animate );
			prevTime = performance.now();

		};

		this.stop = function() {

			cancelAnimationFrame( request );

		};

	}

};
