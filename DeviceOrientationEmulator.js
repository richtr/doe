/**
 * Propagate deviceorientation emulator events to the opener web page
 */
(function() {
  var controlsUrl = 'https://richtr.github.io/deviceorientationemulator/emulator/index.html';

  // open a new controller
  var controlsFrame = window.open(controlsUrl, 'deviceoriention_emulator', 'height=300,width=300,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no');

  var existenceToParentConfirmed = false;
  var url = new URL(controlsUrl);

  var listener = function(event) {
    if (event.origin !== url.origin) return;

    try {
      if(!existenceToParentConfirmed) {
        window.clearTimeout(checkConnection);
        existenceToParentConfirmed = true;
      }

      var json = JSON.parse(event.data);

      var event = document.createEvent('Event');
      event.initEvent('deviceorientation', true, true);

      for(var key in json) event[key] = json[key];
      event['simulation'] = true; // add 'simulated event' flag

      window.dispatchEvent(event);
    } catch(e) {
      console[console.error ? 'error' : 'log'](e);
    }
  };

  var checkConnection = window.setTimeout(function() {
    alert("Device Orientation events could not be delivered. Ensure popup windows are enabled.");
    window.removeEventListener("message", listener, false);
  }, 10000);

  window.addEventListener("message", listener, false);
})();
