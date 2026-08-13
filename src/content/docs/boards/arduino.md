---
title: Arduino & AVR
description: Arduino UNO, Nano, Mega 2560 and the bare ATtiny85.
sidebar:
  order: 2
---

The AVR family runs **entirely in your browser** — instant start, no
cloud round-trip — with cycle-accurate AVR emulation.

| Board                 | MCU                | Flash  | Notes                                                  |
| --------------------- | ------------------ | ------ | ------------------------------------------------------ |
| **Arduino UNO**       | ATmega328P, 16 MHz | 32 KB  | The default beginner board; 14 digital + 6 analog pins |
| **Arduino Nano**      | ATmega328P, 16 MHz | 32 KB  | Same chip as the UNO in a breadboard-friendly stick    |
| **Arduino Mega 2560** | ATmega2560, 16 MHz | 256 KB | 54 digital I/O, 4 UARTs — for pin-hungry projects      |
| **ATtiny85**          | ATtiny85, 8 MHz    | 8 KB   | The bare 8-pin DIP chip, breadboard it directly        |

**Language:** Arduino C++.

## Details that behave like hardware

- `analogWrite` PWM, timers, interrupts (`attachInterrupt`), EEPROM and
  `Serial` at any baud rate work as on silicon.
- The ADC reads whatever the analog circuit provides — wire a
  potentiometer divider and `analogRead` tracks it.
- Classic shields' worth of parts (LCDs, 74HC595s, servos, matrix
  keypads) are in the catalog with examples.

## Good starting examples

The gallery's **Arduino Uno** filter lists dozens — binary counters,
OLED displays, steppers with A4988 drivers, battery monitors. See the
[examples gallery](/docs/getting-started/examples-gallery/).

## Board art and pinouts

Each board's canvas art and full pin map, generated from the simulator:

[Arduino UNO](/docs/boards/reference/arduino-uno/) ·
[Arduino Nano](/docs/boards/reference/arduino-nano/) ·
[Arduino Mega 2560](/docs/boards/reference/arduino-mega/) ·
[ATtiny85](/docs/boards/reference/attiny85/)
