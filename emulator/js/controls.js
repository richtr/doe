window.addEventListener('load', function() {

  var loader = new THREE.XHRLoader();
  loader.load( 'data/app.json', function ( text ) {

    var player = new APP.Player();
    player.load( JSON.parse( text ) );
    player.setSize( window.innerWidth, window.innerHeight );

  	document.body.appendChild( player.dom );

    player.play();

    window.addEventListener( 'resize', function () {
      player.setSize( window.innerWidth, window.innerHeight );
    } );

    // Set up 'prevent roll' checkbox listener
    var preventRollToggle = document.querySelector('#preventRoll');
    preventRollToggle.addEventListener('click', function() {
      if (this.checked) {
        player.removeDeviceRoll = true;
      } else {
        player.removeDeviceRoll = false;
      }
    }, false);

  } );

}, false);
