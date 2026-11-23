---
title: "BBC micro:bit"
description: The BBC micro:bit V2 and seven DFRobot boards for it, running the official MicroPython firmware in your browser.
sidebar:
  order: 5.5
---

The **BBC micro:bit V2** runs in Velxio with its own official MicroPython
firmware (2.1.1), unmodified, on an in-browser engine for its nRF52833 chip.
Write MicroPython, press Run, and the program runs in your browser tab, on
every plan, the free one included.

![The BBC micro:bit V2 on the Velxio canvas](../../../assets/docs/boards/microbit-v2.png)

## What runs

- The 5x5 LED matrix, buttons A and B and the touch logo, on a drawing you
  can click.
- The motion sensor (tilt the pad under the board), and the compass heading,
  the temperature, the light level and the sound level, set from the board's
  sensor panel.
- The speaker, once you switch the sound on in that panel, and the edge
  connector: wire LEDs, potentiometers, servos or Grove sensors to its rings
  and strips as on the real board.
- A REPL in the Serial Monitor, and **Upload firmware** for a MicroPython
  `.hex` saved by python.microbit.org, whose files open in the editor.

**MicroPython only** for now: no Arduino/C++ and no MakeCode blocks (a
MakeCode `.hex` does not start yet). Radio between two micro:bits and
Bluetooth are not modelled.

## Start here

- [Hello, World! on the LED matrix](https://velxio.dev/example/microbit-v2-hello)
- [Buttons A and B](https://velxio.dev/example/microbit-v2-buttons)
- [Spirit level](https://velxio.dev/example/microbit-v2-spirit-level), on the
  accelerometer
- [Thermometer](https://velxio.dev/example/microbit-v2-thermometer), on the
  chip's own temperature

## DFRobot boards for the micro:bit

Seven DFRobot boards are in Velxio, each one its own board on the canvas:
place it and the micro:bit comes seated in its socket, with the matrix and
the buttons still in reach. A board with chips opens with a MicroPython
driver beside `main.py` (`maqueen.py`, `maqueen_v5.py`, `microdriver.py`,
`microiobox.py`) that writes the same bytes as DFRobot's own MakeCode blocks.

![The micro:bit V2 seated on a DFRobot Maqueen Lite on the Velxio canvas](../../../assets/docs/boards/microbit-v2-maqueen-lite.png)

### Maqueen Lite

DFRobot's small two-wheel robot (ROB0148-EN): two motors behind a driver on
I2C, two headlights, two line sensors, four RGB LEDs and an ultrasonic
socket. In a 3D World the Maqueen itself is the robot.
[Line follower](https://velxio.dev/example/microbit-v2-maqueen-lite-line) ·
[Drive and blink the headlights](https://velxio.dev/example/microbit-v2-maqueen-lite-drive) ·
[DFRobot store](https://www.dfrobot.com/product-1783.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite)

### Maqueen Lite V5

The current Maqueen Lite (MBT0046): RGB headlights, three line sensors, two
light sensors and a battery level behind its own controller on I2C.
[Colour headlights and light sensors](https://velxio.dev/example/microbit-v2-maqueen-lite-v5-lights) ·
[DFRobot store](https://www.dfrobot.com/product-2937.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite-v5)

### micro:Driver

Four DC motor outputs and eight servo headers from one PCA9685 chip on I2C
(DFR0548), plus nine micro:bit pins on 3-pin headers.
[Two servos and a DC motor](https://velxio.dev/example/microbit-v2-micro-driver-servos) ·
[DFRobot store](https://www.dfrobot.com/product-1738.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-driver)

### micro:IO-BOX

A compact robot controller (MBT0005): a two-way motor driver on I2C, nine IO
headers, I2C and UART ports and a buzzer on P0.
[Two motors forward and back](https://velxio.dev/example/microbit-v2-io-box-motors) ·
[DFRobot store](https://www.dfrobot.com/product-1847.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-box)

### IO Extender

A breakout (MBT0008) with every pin of the edge connector on a 3-pin header
(signal, 3.3 V, ground), three I2C ports and a buzzer on P0 with a switch.
[A light sensor on P1](https://velxio.dev/example/microbit-v2-io-extender-light) ·
[DFRobot store](https://www.dfrobot.com/product-1867.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-extender)

### micro:Mate

A board the size of the micro:bit (DFR0518) that screws onto its front, with
six 3-pin Gravity headers: P0, P1 and P2 at 3.3 V, P8, P12 and P16 at 5 V.
[A light sensor on P0](https://velxio.dev/example/microbit-v2-micro-mate-light) ·
[DFRobot store](https://www.dfrobot.com/product-1699.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-mate)

### Robotics & Power IO Extender

A full breakout for the micro:bit (DFR1231) with the IO Extender's headers in
the same order and the same pin names, so a project moves between the two
without renaming a wire.
[A light sensor on P1](https://velxio.dev/example/microbit-v2-robotics-io-extender-light) ·
[DFRobot store](https://www.dfrobot.com/product-2963.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-robotics-io-extender)

_Store links on this page are affiliate links: Velxio earns a small commission at no extra cost to you._

## Board art and pinouts

Each board's canvas art and full pin map, generated from the simulator:

[BBC micro:bit V2](/docs/boards/reference/microbit-v2/) ·
[Maqueen Lite](/docs/boards/reference/microbit-v2-maqueen-lite/) ·
[Maqueen Lite V5](/docs/boards/reference/microbit-v2-maqueen-lite-v5/) ·
[micro:Driver](/docs/boards/reference/microbit-v2-micro-driver/) ·
[micro:IO-BOX](/docs/boards/reference/microbit-v2-io-box/) ·
[IO Extender](/docs/boards/reference/microbit-v2-io-extender/) ·
[micro:Mate](/docs/boards/reference/microbit-v2-micro-mate/) ·
[Robotics & Power IO Extender](/docs/boards/reference/microbit-v2-robotics-io-extender/)

---

BBC micro:bit is a trademark of the Micro:bit Educational Foundation. Velxio
works with the micro:bit; it is not made or endorsed by the Foundation. The
micro:bit itself is sold through the resellers the Foundation lists at
[microbit.org](https://microbit.org/buy/).
