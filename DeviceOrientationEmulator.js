/**
 *
 * DEVICE ORIENTATION EMULATOR
 * https://github.com/richtr/deviceorientationemulator
 *
 * A simple, accurate device orientation emulator for use in web browsers
 * that do not support device orientation events
 * (https://w3c.github.io/deviceorientation/spec-source-orientation.html)
 *
 * Copyright: 2015 Rich Tibbett
 * License:   MIT
 *
 */

(function() {

  function runDetection() {

    var checkTimeout = 500;

    var deviceOrientationCheck = window.setTimeout(function() {

      var swalCSSEl = document.createElement('link');
      swalCSSEl.href = 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.0.1/sweetalert.min.css';
      swalCSSEl.type = 'text/css';
      swalCSSEl.rel = 'stylesheet';
      document.getElementsByTagName('head')[0].appendChild(swalCSSEl);

      var swalJSEl = document.createElement('script');
      swalJSEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.0.1/sweetalert.min.js';
      swalJSEl.type = 'text/javascript';

      swalJSEl.onload = function() {
        swal({
          title: "No compass detected.",
          text: "This page is built for devices that emit device orientation events. If you would still like to test this page you will need to use an emulator.",
          showCancelButton: true,
          type: "error",
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Use the emulator!",
          cancelButtonText: "Cancel",
          closeOnConfirm: true
        },
        function(){
          var url = new URL('https://richtr.github.io/deviceorientationemulator/emulator/index.html');

          // Open a new popup containing the Device Orientation Emulator!
          var controlsFrame = window.open(url, 'deviceoriention_emulator', 'height=300,width=300,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no');

          var listener = function(event) {
            if (event.origin !== url.origin) return;

            try {
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

          window.addEventListener('message', listener, false);
        });
      };

      document.getElementsByTagName('head')[0].appendChild(swalJSEl);

    }, checkTimeout);

    var isFirstEvent = true;

    window.addEventListener('deviceorientation', function check() {
      // Discard first event (false positive on Chromium Desktop browsers)
      if (isFirstEvent) {
        isFirstEvent = false;
        return;
      }

      // Prevent emulator from kicking in
      window.clearTimeout(deviceOrientationCheck);
      // Remove self
      window.removeEventListener('deviceorientation', check, false);
    }, false);

  }

  if (document.readyState === 'complete') {
    runDetection();
  } else {
    window.addEventListener('load', runDetection, false);
  }

})();
