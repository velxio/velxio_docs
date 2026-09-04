---
title: Raspberry Pi Pico & Pico W
description: Die RP2040-Boards — Emulation im Browser mit MicroPython- und Arduino-Unterstützung.
sidebar:
  order: 5
---

Die RP2040-Boards laufen **in Ihrem Browser** mit einer originalgetreuen
Dual-Core-Cortex-M0+-Emulation.

| Board                   | Highlights                                |
| ----------------------- | ----------------------------------------- |
| **Raspberry Pi Pico**   | Das Standard-RP2040-Board, 26 GPIO        |
| **Raspberry Pi Pico W** | Gleiches Board mit WiFi-Modul-Grundfläche |

**Sprachen:** MicroPython (die native Umgebung des Pico) und Arduino C++
(der earlephilhower-Kern).

![Raspberry Pi Pico W auf der Velxio-Leinwand](../../../../assets/docs/boards/pi-pico-w.png)

## Was funktioniert

- GPIO, PWM, ADC, I2C, SPI, UART — und **PIO**, die charakteristischen
  programmierbaren I/O-Blöcke des RP2040, auf die sich NeoPixel- und
  Beispiele mit ausgefallenen Protokollen stützen.
- Die MicroPython-REPL über den [seriellen Monitor](/docs/de/programming/serial-monitor/).
- Flashen eines echten Pico aus dem Browser: Das Board wechselt in den
  BOOTSEL-Modus und der Dialog schreibt die `.uf2`-Datei über WebUSB,
  oder Sie laden die Datei herunter und legen sie auf dem Laufwerk ab.
  Siehe [Web-Flash](/docs/de/wifi-iot/web-flash/).

## Wo ist der RP2350?

Der **Badger 2350** (Pimoronis RP2350-E-Paper-Badge) ist ein
[Pro-Board](/docs/de/boards/pro-boards/) — es bootet die vollständige
BadgeOS-Werksfirmware, inklusive E-Paper.

## Board-Grafik und Pinbelegung

Die Leinwandgrafik und die vollständige Pinbelegung jedes Boards,
generiert aus dem Simulator:

[Raspberry Pi Pico](/docs/de/boards/reference/raspberry-pi-pico/) ·
[Raspberry Pi Pico W](/docs/de/boards/reference/pi-pico-w/)
