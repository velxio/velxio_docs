## About this board

The classroom board: an **nRF52833** with a 5x5 LED matrix, two buttons, a
touch logo, an accelerometer and compass, a microphone and a speaker. Velxio
runs the official **MicroPython 2.1.1** firmware on it, unmodified, in the
browser and on the free plan: `main.py` runs at boot exactly as on the board,
and the Serial Monitor is the REPL.

Everything on the board answers on the canvas. Click the buttons and the
logo, tilt the board with the pad under it, and set the temperature, the
light, the sound level and the compass heading in the sensor panel. The
speaker plays through your own once you switch the sound on there. Parts
wire to the rings and the strips of the edge connector.

**MicroPython only** for now: no Arduino/C++ and no MakeCode blocks. Radio
between boards on the canvas and Bluetooth are not modelled.
**Upload firmware** takes a MicroPython `.hex`, the kind python.microbit.org
saves; a MakeCode `.hex` is not supported yet.

## Start here

- [Hello, World! on the LED matrix](https://velxio.dev/example/microbit-v2-hello):
  the first program on a micro:bit.
- [Buttons A and B](https://velxio.dev/example/microbit-v2-buttons) adds an
  input, and shows why `was_pressed()` never loses a quick click.
- [Spirit level](https://velxio.dev/example/microbit-v2-spirit-level) reads the
  accelerometer, and the [thermometer](https://velxio.dev/example/microbit-v2-thermometer)
  reads the chip's own temperature.

## Get the board

The micro:bit is sold through the resellers listed by the
[Micro:bit Educational Foundation](https://microbit.org/buy/). Every example
on this page runs in the browser without it, and the same `main.py` runs
unchanged on the real board.
