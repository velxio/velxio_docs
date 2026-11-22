## About this board

A breakout for the micro:bit (MBT0008) that brings **every pin of the edge
connector** out to a 3-pin header (signal, 3.3 V, ground), with the [BBC micro:bit V2](/docs/boards/reference/microbit-v2/) in
its socket. It adds two I2C ports at 3.3 V, one at 5 V, and a buzzer on P0
with a switch.

A wire on a header pin is a wire on that micro:bit pin, so the micro:bit
page's notes apply as they are: P3, P4, P6, P7 and P10 also drive the LED
matrix, and the buzzer shares P0 until you switch it off.

**MicroPython only** for now: no Arduino/C++ and no MakeCode blocks. Radio
between boards on the canvas and Bluetooth are not modelled.

## Start here

- [A light sensor on P1](https://velxio.dev/example/microbit-v2-io-extender-light):
  a Gravity ambient light sensor on one header, shown as a bar on the
  matrix.

## Get the board

The IO Extender for micro:bit is sold on the [DFRobot store](https://www.dfrobot.com/product-1867.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs&utm_content=microbit-v2-io-extender).
The example runs in the browser without it.

*Affiliate link: if you buy through it, Velxio earns a small commission at no extra cost to you.*
