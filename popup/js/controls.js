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

  } );

}, false);
