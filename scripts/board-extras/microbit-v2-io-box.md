## About this board

DFRobot's compact robot controller for the micro:bit (MBT0005), with the
[BBC micro:bit V2](/docs/boards/reference/microbit-v2/) in its socket: a **two-way motor driver** on I2C, nine IO headers, two
I2C ports, a UART port and a buzzer on P0, on a board that carries its own
rechargeable cell.

Wire a DC motor across `M1A` and `M1B` (or `M2A` and `M2B`) and it turns
with the speed the program sends to the driver; in a 3D World the robot it
drives moves. The cell and its charger are drawn and do nothing.

**MicroPython only** for now: no Arduino/C++ and no MakeCode blocks. Radio
between boards on the canvas and Bluetooth are not modelled.

## Start here

- [Two motors forward and back](https://velxio.dev/example/microbit-v2-io-box-motors):
  DFRobot's own motor sample, with both motors already wired.

## Get the board

The micro:IO-BOX is sold on the [DFRobot store](https://www.dfrobot.com/product-1847.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs&utm_content=microbit-v2-io-box).
The example runs in the browser without it.

*Affiliate link: if you buy through it, Velxio earns a small commission at no extra cost to you.*
