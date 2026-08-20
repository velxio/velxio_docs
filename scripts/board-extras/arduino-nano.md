## About this board

The same ATmega328P at 16 MHz as the [UNO](/docs/boards/reference/arduino-uno/),
32 KB of flash, in a breadboard-friendly stick. Sketches move between the two
without changes.

The one real difference is in the pin map below: the Nano exposes **`A6` and
`A7`**, two extra analog-only inputs the UNO does not have. They read with
`analogRead()` but cannot be used as digital pins.

## Start here

[New Arduino Nano project](https://velxio.dev/example/nano-blink) opens the
editor with this board and a working blink sketch.
