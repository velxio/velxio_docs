---
title: Raspberry Pi Pico & Pico W
description: The RP2040 boards — in-browser emulation with MicroPython and Arduino support.
sidebar:
  order: 5
---

The RP2040 boards run **in your browser** with a faithful dual-core
Cortex-M0+ emulation.

| Board                   | Highlights                                |
| ----------------------- | ----------------------------------------- |
| **Raspberry Pi Pico**   | The standard RP2040 board, 26 GPIO        |
| **Raspberry Pi Pico W** | Same board with the WiFi module footprint |

**Languages:** MicroPython (the Pico's native habitat) and Arduino C++
(the earlephilhower core).

![Raspberry Pi Pico W on the Velxio canvas](../../../assets/docs/boards/pi-pico-w.png)

## What works

- GPIO, PWM, ADC, I2C, SPI, UART — and **PIO**, the RP2040's signature
  programmable I/O blocks, which is what NeoPixel and quirky-protocol
  examples rely on.
- MicroPython's REPL over the [serial monitor](/docs/programming/serial-monitor/).
- Flashing a real Pico via its `.uf2` with
  [web flash](/docs/wifi-iot/web-flash/).

## Where's the RP2350?

The **Badger 2350** (Pimoroni's RP2350 e-paper badge) is a
[Pro board](/docs/boards/pro-boards/) — it boots the complete BadgeOS
factory firmware, e-paper and all.

## Board art and pinouts

Each board's canvas art and full pin map, generated from the simulator:

[Raspberry Pi Pico](/docs/boards/reference/raspberry-pi-pico/) ·
[Raspberry Pi Pico W](/docs/boards/reference/pi-pico-w/)
