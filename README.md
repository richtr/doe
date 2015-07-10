# Doe

### The Device Orientation Emulator

##### Doe is a highly capable device and screen orientation emulator for developing and debugging sensor-related web apps on desktop computers

Doe is a simple and precise device orientation and screen orientation API emulator for web browsers that do not provide native sensor support.

It can be used to build and debug device orientation and screen orientation aware applications without needing to constantly test it on different devices.

If it works in doe then it will work on devices too!

#### Demo

In any web browser that does not support device orientation (e.g. Desktop browsers) open one of the following pages:

[https://richtr.github.io/threeVR/examples/vr_basic.html](https://richtr.github.io/threeVR/examples/vr_basic.html)

[https://richtr.github.io/Marine-Compass/](https://richtr.github.io/Marine-Compass/)

[https://richtr.github.io/Full-Tilt/examples/vr_interactive.html](https://richtr.github.io/Full-Tilt/examples/vr_interactive.html)

This emulator also supports the [Screen Orientation API](http://www.w3.org/TR/screen-orientation/). If your browser does not support the Screen Orientation API then you can open the following page:

[https://people.opera.com/richt/release/tests/doe/screenorientation.html](https://people.opera.com/richt/release/tests/doe/screenorientation.html)

If your browser does not support Device Orientation Events then you will be asked if you want to load these pages in this emulator.

#### Usage

Add the Device Orientation Emulator script to any web page you want to allow the emulator to run on when device orientation event support can not be detected:

```html
<script src="https://richtr.github.io/doe/doe.js"></script>
```
That's it!

Now whenever this page loads and the current device is not supports it will ask the user if they want to run it in the emulator :)

#### License

MIT. Copyright &copy; Rich Tibbett.
