## About this board

DFRobot's motor and servo driver board for the micro:bit (DFR0548), with the
[BBC micro:bit V2](/docs/boards/reference/microbit-v2/) in its edge socket. One PCA9685 on I2C drives **four DC motor outputs**
and **eight servo headers**; nine micro:bit pins come out on 3-pin headers
and there are two I2C ports.

Wire a DC motor across a pair of motor terminals, or a servo to a servo
header, and it follows what the program writes to the chip. The green and
red LEDs under each motor output show which way that motor is driven.

**MicroPython only** for now: no Arduino/C++ and no MakeCode blocks. Radio
between boards on the canvas and Bluetooth are not modelled.

## Start here

- [Two servos and a DC motor](https://velxio.dev/example/microbit-v2-micro-driver-servos):
  sweeps S1 and S2 in opposite directions and runs M1 forward and back.

## Get the board

The micro:Driver is sold on the [DFRobot store](https://www.dfrobot.com/product-1738.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs&utm_content=microbit-v2-micro-driver).
The example runs in the browser without it.

*Affiliate link: if you buy through it, Velxio earns a small commission at no extra cost to you.*
