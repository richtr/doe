# Device Orientation Emulator
A simple and precise device orientation emulator for use in Desktop-based web browsers.

## Demo
On any desktop-based web browser open the following page:

[https://richtr.github.io/Marine-Compass/?emulator=true](https://richtr.github.io/Marine-Compass/?emulator=true)

Once the page loads, enable 'Always allow popups for richtr.github.io' and reload the page!

## Usage
Step 1. Add the injection script to the web page you want to test:

```html
<script src="https://richtr.github.io/deviceorientationemulator/DeviceOrientationEmulator.js"></script>
```

Step 2. Load this web page in a Desktop browser and enable 'Always allow popups'! Reload the page if necessary once you have enabled popups.

Step 3. When the page reloads the popup should load successfully, you can then drag the virtual device presented within the popup around and  'deviceorientation' events will be propagated towards your web page.
