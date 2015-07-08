function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

window.addEventListener('load', function() {

  var urlParam = getParameterByName('url');
  var url;
  var resizerFrame = document.querySelector('iframe#resizerFrame');

  if(urlParam.length > 0) {
    if(urlParam.substr(0,4) != 'http') {
      urlParam = 'http://' + urlParam;
    }

    url = new URL(urlParam);

    // Load url in iframe
    resizerFrame.src = urlParam;
  }

  $('body').on('click', 'button[data-viewport-width]', function(e) {
    if($(this).attr('data-viewport-width') == '100%') {
      newWidth = '100%';
    }else{
      newWidth = $(this).attr('data-viewport-width');
    }
    if($(this).attr('data-viewport-height') == '100%') {
      newHeight = '100%';
    }else{
      newHeight = $(this).attr('data-viewport-height');
    }
    $('button[data-viewport-width]').removeClass('asphalt active').addClass('charcoal');
    $(this).addClass('asphalt active').removeClass('charcoal');

    $('#resizerFrame').css({
      'max-width': newWidth,
      'max-height': newHeight
    });
    e.preventDefault();
    return false;
  });

  $('body').on('click', 'button.rotate', function(e) {
    $('button[data-rotate=true]').each(function() {
      $(this).toggleClass('landscape');
      width = $(this).attr('data-viewport-width');
      height = $(this).attr('data-viewport-height');
      $(this).attr('data-viewport-width', height);
      $(this).attr('data-viewport-height', width);
      if($(this).hasClass('active')) {
        $(this).trigger('click');
      }
    });
  });

  $(document).on('keyup', function(e) {
    switch(e.keyCode) {
      case 49:
        $('[data-device="fullscreen"]').trigger('click');
        break;
      case 50:
        $('[data-device="desktop"]').trigger('click');
        break;
      case 51:
        $('[data-device="macbook"]').trigger('click');
        break;
      case 52:
        $('[data-device="ipad"]').trigger('click');
        break;
      case 53:
        $('[data-device="tablet"]').trigger('click');
        break;
      case 54:
        $('[data-device="android"]').trigger('click');
        break;
      case 55:
        $('[data-device="iphone"]').trigger('click');
        break;
      case 32:
      case 56:
      case 82:
        $('.rotate').trigger('click');
        break;
    }
  });

  // Relay deviceorientation events on to content iframe
  window.addEventListener('message', function(event) {
    var json = JSON.parse(event.data);

    var roll = json['roll'] || 0;

    delete json['roll']; // remove roll attribute

    resizerFrame.contentWindow.postMessage(JSON.stringify(json), url.origin);
    resizerFrame.style.transform = 'rotate(' + roll + 'deg)';

  }, false);

}, false);
