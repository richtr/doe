# Doe

##### Doe is a highly precise device and screen orientation emulator for developing and debugging sensor-related web apps on desktop computers

It can be used to build and debug device orientation and screen orientation aware applications without needing to constantly test on mobile devices.

#### Demos

In any web browser that does not support device orientation (e.g. Desktop browsers) you can open one of the following pages:

[https://richtr.github.io/threeVR/examples/vr_basic.html](https://richtr.github.io/threeVR/examples/vr_basic.html)

[https://richtr.github.io/Marine-Compass/](https://richtr.github.io/Marine-Compass/)

[https://richtr.github.io/Full-Tilt/examples/vr_interactive.html](https://richtr.github.io/Full-Tilt/examples/vr_interactive.html)

[https://people.opera.com/richt/release/tests/doe/screenorientation.html](https://people.opera.com/richt/release/tests/doe/screenorientation.html)

##### Advanced demo

The doe emulator can also record key frames and play back those key frames as an animation.

You can check out an example key framed animation [here](https://richtr.github.io/doe/emulator/?url=https%3A%2F%2Frichtr.github.io%2FFull-Tilt%2Fexamples%2Fvr_test.html#W1sxLDEsMCwwLDkwLDAsMF0sWzEsMSwwLDkwLDkwLDAsMF0sWzEsMSwwLDE4MCw5MCwwLDBdLFsxLDEsMCwyNzAsOTAsMCwwXSxbMSwxLDAsMCw5MCwwLDBdLFsxLDEsMCw0NSw0NSwwLDBdLFsxLDEsMCwzMTUsNDUsMCwwXSxbMSwxLDAsMCw5MCwwLDBdLFsxLDEsMCwwLC0xODAsMCwwXSxbMSwxLDAsMCwtOTAsMCwwXSxbMSwxLDAsMjcwLDAsLTkwLDI3MF0sWzEsMSwwLDE4MCwwLC05MCwyNzBdLFsxLDEsMCwwLDAsLTkwLDI3MF0sWzEsMSwwLDI3MCwwLC05MCwyNzBdLFswLDEsMCwxODAsOTAsMCwxODBdLFsxLDEsMCwwLDkwLDAsMTgwXSxbMCwxLDAsMCw5MCwwLDBdXQ==).

#### Developer Usage

Just add the [Device Orientation Emulator script](https://github.com/richtr/doe/blob/gh-pages/doe.js) to any web page on which you want to enable the doe emulator:

```html
<script src="https://richtr.github.io/doe/doe.js"></script>
```

Now open your web page and follow the prompt to open it in the doe emulator.

#### User Interface Guide

When you open doe you will be presented with the following screen:

<img src="https://raw.githubusercontent.com/richtr/doe/images/doe-annotated.png" style="max-width: 100%">

##### 1. The Web App Viewport

This is where the web application that is being emulated is displayed.

You can customize the scale of the viewport and the dimensions of the viewport via tools available in the emulator menu bar.

##### 2. The Device Controller

The device controller is an interactive model of a real device. As a user of the emulator you can change the physical orientation of the 'device' within space.

To change the physical orientation of the device just click on the device shown, and drag your mouse in the desired direction of movement. The device should move on screen.

Any changes you make using your mouse in the device controller will produce updated device orientation data within the emulator menu bar.

##### 3. The Emulator Menu Bar

The doe emulator menu bar lets you refine different important characteristics of your device within real world space. The values displayed or overridden in the menu bar will affect how the Web App Viewport will be oriented on the screen.

<img src="https://raw.githubusercontent.com/richtr/doe/images/menubar-annotated.png" style="max-width: 100%">

###### 3.1. Viewport Scaling

Using the slider you can change the scale of the Web App Viewport. This does not affect the screen dimensions within the Web App Viewport.

###### 3.2. Device type

Using this part of the menu bar lets you change the screen dimensions within the Web App Viewport to the dimensions that can be found on typical hardware devices.

The device types currently available in the doe emulator, from left to right, are as follows:

* iPhone
* Android phone
* Android tablet
* iPad

Just select one of these options and the Web App Viewport will update to the device's screen dimensions.

###### 3.3. Device Orientation Data

This part of the emulator menu bar displays the current device orientation data that is being emitted from the Device Controller.

The data is as follows:

* 'a' (or `DeviceOrientationEvent.alpha`) in the range (0, 360)
* 'b' (or `DeviceOrientationEvent.beta`) in the range (-180, 180)
* 'g' (or `DeviceOrientationEvent.gamma`) in the range (-90, 90)

You can also manually enter device orientation data here. Just select the value shown next to 'a', 'b' or 'g' and enter a new value. The Device Controller will automatically readjust to orient to the chosen values.

The button on the right side allows you to reset the device orientation data to its default position.

###### 3.4. Screen Orientation Data

This part of the emulator menu bar displays the current screen orientation data that is being emitted from the Device Controller.

The data is as follows:

* 's' (or `window.orientation` and `window.screen.orientation.angle`)
  * `0` (aka `portrait-primary`): The screen is in its default (natural) orientation.
  * `90` (aka `landscape-primary`): The screen is rotated 90 degrees clockwise from its natural orientation.
  * `180` (aka `portrait-secondary`): The screen is rotated 180 degrees clockwise from its natural orientation.
  * `270` (aka `landscape-secondary`): The screen is rotated 270 degrees clockwise (or, 90 degrees counter-clockwise) from its natural orientation.

You can change the screen orientation of the device using the button to the right. This rotates the screen in 90 degree increments and simulates the effect of the screen orientation changing from e.g. portrait to landscape.

If the web app within the Web App Viewport uses the Screen Orientation API to lock the device to a specific screen orientation then the screen rotation button is disabled and is replaced by a lock icon. If or when the emulated web app unlocks the device from a specific screen orientation then the screen rotation button will be enabled again and the lock icon will disappear.

##### 4. The Animation Timeline

The animation timeline lets you record and share pre-defined movements of the emulated device using key frames to mark the waypoints of that movement.

<img src="https://raw.githubusercontent.com/richtr/doe/images/timeline-annotated.png" style="max-width: 300px;">

###### 4.1. Play the current animation timeline

When the doe emulator loads it will auto-play any animations that have been included in the emulator URL.

At any time you want to replay the animation timeline you can click this button and the doe emulator will replay the recorded key frame(s).

When the doe emulator is playing a timeline it will disable buttons within the Emulator Menu Bar and also disable the Device Controller. Once animation ends, the emulator will be reset to the position of the first key frame and any disabled controls will be reenabled.

###### 4.2. Key frame(s)

The current key frames for this animation.

At any time you can click on one of these items and then, any changes you make to device or screen orientation will be recorded against this key frame.

###### 4.3. Add a new key frame

Clicking this button adds a new key frame to the animation timeline.

The device and screen orientation of the previous frame will be maintained and you can now change the values of this new frame.

By clicking the play button the doe emulator will interpolate between these frames to create a smooth transition between the device and screen orientation values between the key frames.

You can add up to a maximum of 20 key frames within the doe emulator.

###### 4.4. Delete all key frames

This button will remove all key frames, only keeping the first key frame that was created within the animation timeline.

#### License

MIT. Copyright &copy; Rich Tibbett.
