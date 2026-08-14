---
title: Raspberry Pi Pico & Pico W
description: Die RP2040-Boards – Emulation im Browser mit MicroPython- und Arduino-Unterstützung.
sidebar:
  order: 5
---

Die RP2040-Boards laufen **in Ihrem Browser** mit einer originalgetreuen
Dual-Core-Cortex-M0+-Emulation.

| Board                   | Highlights                              |
| ----------------------- | --------------------------------------- |
| **Raspberry Pi Pico**   | Das Standard-RP2040-Board, 26 GPIO      |
| **Raspberry Pi Pico W** | Gleiches Board mit WiFi-Modul-Footprint |

**Sprachen:** MicroPython (die natürliche Umgebung des Pico) und Arduino C++
(der earlephilhower-Kern).

## Was funktioniert

- GPIO, PWM, ADC, I2C, SPI, UART – und **PIO**, die charakteristischen
  programmierbaren I/O-Blöcke des RP2040, auf die NeoPixel- und
  unkonventionelle Protokoll-Beispiele angewiesen sind.
- MicroPythons REPL über den [seriellen Monitor](/docs/de/programming/serial-monitor/).
- Flashen eines echten Pico über seine `.uf2`-Datei mit
  [Web-Flash](/docs/de/wifi-iot/web-flash/).

## Wo ist der RP2350?

Der **Badger 2350** (Pimoronis RP2350-E-Paper-Badge) ist ein
[Pro-Board](/docs/de/boards/pro-boards/) – es bootet die vollständige BadgeOS-
Werksfirmware, inklusive E-Paper und allem anderen.

----- END PAGE -----
