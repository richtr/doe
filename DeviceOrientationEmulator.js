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

  var rootUrl = 'https://richtr.github.io/deviceorientationemulator';

  function runDetection() {

    var checkTimeout = 1000;

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
          text: "This page is built for devices that emit device orientation events. If you would still like to try this page you can use an emulator.",
          type: "error",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Open in the emulator",
          cancelButtonText: "Cancel",
          closeOnConfirm: true
        },
        function(){
          // Open the mobile emulator with the current URL
          var selfUrl = encodeURIComponent(window.location);
          window.location = rootUrl + '/emulator/?url=' + selfUrl;
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

  function runEmulation() {
    var url = new URL(rootUrl);

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
  }

  runEmulation();

  if (document.readyState === 'complete') {
    runDetection();
  } else {
    window.addEventListener('load', runDetection, false);
  }

})();
