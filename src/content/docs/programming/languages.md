---
title: Languages — Arduino, MicroPython, ESP-IDF
description: Which language runs on which board, and how to switch.
sidebar:
  order: 2
---

The **language selector** in the toolbar switches how the active board's
code is written and built. Switching languages swaps the file set of the
workspace (a `sketch.ino` becomes a `main.py`, and so on).

## Arduino C++

The default almost everywhere: classic `setup()` / `loop()` sketches,
compiled with the real Arduino toolchain for the target. Use the
**Libraries** button to add any published Arduino library — see
[Libraries](/docs/programming/libraries/).

Available on every board except the Linux Raspberry Pi family.

## MicroPython

Real MicroPython firmware running on the emulated chip — the REPL works
over the serial monitor, `import machine` and friends behave like on
hardware.

Available on:

- **Raspberry Pi Pico / Pico W** (RP2040)
- **ESP32 classic** — DevKit V1, DevKit-C v4, ESP32-CAM, Lolin32 Lite
- **ESP32-S3** — DevKit, XIAO ESP32-S3, Arduino Nano ESP32
- **ESP32-C3** — DevKit, XIAO ESP32-C3, C3 SuperMini

## ESP-IDF

Pure ESP-IDF projects (an `app_main()` entry point, IDF APIs, no Arduino
core), compiled with the same ESP-IDF toolchain. For when you're writing
what you'd flash in production.

Available on the same ESP32 family boards as MicroPython above.

## Python on Linux (Raspberry Pi)

The Linux Raspberry Pi boards (Zero through 5) don't use the language
selector: they boot a full Linux and you work in a real shell — run Python
with `gpiozero`/`RPi.GPIO` against the simulated GPIO, exactly like on the
physical Pi. See the [board pages](/docs/boards/overview/).
