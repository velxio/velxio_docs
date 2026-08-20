## About this board

The ESP32-CAM is the DevKit's sensor-carrying cousin: an ESP32 with a 2 MP
camera module and a microSD slot, on a board that breaks out only 16 pins
because the camera bus claims most of them.

The camera is **emulated, not a placeholder** — the simulator feeds frames to
the firmware, so a webcam sketch produces a real picture in the browser. That
is why this board's starter is the webcam demo rather than a blink: a bare LED
sketch would say nothing about the one thing the board exists for.

## Start here

- [Webcam demo](https://velxio.dev/example/esp32cam-webcam-demo) — the camera
  streaming, the shortest path to seeing the board work.
- [Live preview on an ILI9341](https://velxio.dev/example/esp32cam-lcd-preview)
  — the same frames pushed to a wired TFT.
