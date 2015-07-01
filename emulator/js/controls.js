window.addEventListener('load', function() {

  var loader = new THREE.XHRLoader();
  loader.load( 'data/app.json', function ( text ) {

    var player = new APP.Player();
    player.load( JSON.parse( text ) );
    player.setSize( window.innerWidth, window.innerHeight );
    player.play();

  	document.body.appendChild( player.dom );

    window.addEventListener( 'resize', function () {
      player.setSize( window.innerWidth, window.innerHeight );
    } );

  } );

}, false);
