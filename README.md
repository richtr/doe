# Device Orientation Emulator

A simple and precise device orientation emulator for web browsers that do not support device orientation events.

## Demo

In any web browser that does not support device orientation (e.g. Desktop browsers) open one of the following pages:

[https://richtr.github.io/threeVR/examples/vr_basic.html](https://richtr.github.io/threeVR/examples/vr_basic.html)

[https://richtr.github.io/Marine-Compass/](https://richtr.github.io/Marine-Compass/)

[https://richtr.github.io/Full-Tilt/examples/vr_interactive.html](https://richtr.github.io/Full-Tilt/examples/vr_interactive.html)

This emulator also supports the [Screen Orientation API](http://www.w3.org/TR/screen-orientation/). If your browser does not support the Screen Orientation API then you can open the following page:

[https://people.opera.com/richt/release/tests/doe/screenorientation.html](https://people.opera.com/richt/release/tests/doe/screenorientation.html)

If your browser does not support Device Orientation Events then you will be asked if you want to load these pages in this emulator.

That's it!

## Usage

Add the Device Orientation Emulator script to any web page you want to allow the emulator to run on when device orientation event support can not be detected:

```html
<script src="https://richtr.github.io/deviceorientationemulator/DeviceOrientationEmulator.js"></script>
```

Happy debugging of device orientation events :)
