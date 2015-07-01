/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

	Player: function () {

		var scope = this;

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;

		var controls;

		var events = {};

		this.dom = undefined;

		this.width = 500;
		this.height = 500;

		this.load = function ( json ) {

			renderer = new THREE.WebGLRenderer( { antialias: true } );
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

				for ( var i = 0; i < scripts.length; i ++ ) {

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

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

		};

		this.setScene = function ( value ) {

			scene = value;

		},

		this.setSize = function ( width, height ) {

			if ( renderer._fullScreen ) return;

			this.width = width;
			this.height = height;

			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			renderer.setSize( width, height );

		};

		var dispatch = function ( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		};

		var prevTime, request;

		var fulltiltEuler = new FULLTILT.Euler();

		var worldQuat = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) );

		var animate = function ( time ) {

			request = requestAnimationFrame( animate );

			dispatch( events.update, { time: time, delta: time - prevTime } );

			controls.update();

			// Calculate current camera orientation using Full-Tilt library
			var cam = camera.quaternion.clone();
			cam.multiply(worldQuat).inverse();

			fulltiltEuler.setFromQuaternion(cam);

      // Store device orientation data for dispatch to opener window
      window.deviceOrientation = fulltiltEuler;

			// DEBUG
			orientationAlpha.value = printDataValue(window.deviceOrientation.alpha);
			orientationBeta.value = printDataValue(window.deviceOrientation.beta);
			orientationGamma.value = printDataValue(window.deviceOrientation.gamma);

			renderer.render( scene, camera );

			prevTime = time;

		};

		this.play = function (url) {

			// Set up mouse/touch controls
      controls = new THREE.TrackballControls( camera );
			controls.target.set(0,0,0);
			controls.noPan = true;
			controls.noZoom = true;

			request = requestAnimationFrame( animate );
			prevTime = performance.now();

		};

		this.stop = function () {

			cancelAnimationFrame( request );

		};

	}

};
