## About this board

DFRobot's expansion board for the micro:bit and the UNIHIKER K10 (DFR1231),
with the [BBC micro:bit V2](/docs/boards/reference/microbit-v2/) in its socket. For the micro:bit it is a full breakout: every
pin of the edge connector on a 3-pin header, two I2C ports at 3.3 V, one at
5 V, and a buzzer on P0 with a switch.

Its headers are those of the [IO Extender](/docs/boards/reference/microbit-v2-io-extender/),
in the same order, and Velxio gives the two the same pin names: a project
moves between them without renaming a wire. The servo ports S0 to S3 and the
ports C0 to C3 belong to the UNIHIKER K10; they are drawn and nothing wires
to them.

**MicroPython only** for now: no Arduino/C++ and no MakeCode blocks. Radio
between boards on the canvas and Bluetooth are not modelled.

## Start here

- [A light sensor on P1](https://velxio.dev/example/microbit-v2-robotics-io-extender-light):
  a Gravity ambient light sensor on one header, shown as a bar on the
  matrix.

## Get the board

The Robotics & Power IO Extender is sold on the [DFRobot store](https://www.dfrobot.com/product-2963.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs&utm_content=microbit-v2-robotics-io-extender).
The example runs in the browser without it.

*Affiliate link: if you buy through it, Velxio earns a small commission at no extra cost to you.*
