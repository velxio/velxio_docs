---
title: ESP32 (classic)
description: ESP32 DevKit V1, DevKit-C V4, ESP32-CAM and Wemos Lolin32 Lite.
sidebar:
  order: 3
---

The original dual-core Xtensa ESP32 — the workhorse of the catalog, with
**WiFi and Bluetooth** available in the simulator.

| Board                  | Highlights                                        |
| ---------------------- | ------------------------------------------------- |
| **ESP32 DevKit V1**    | The standard 30-pin devkit; built-in LED on GPIO2 |
| **ESP32 DevKit-C V4**  | Official Espressif devkit, 38 GPIO                |
| **ESP32-CAM**          | ESP32 + 2 MP camera module + microSD slot         |
| **Wemos Lolin32 Lite** | Compact, LiPo charger footprint                   |

**Languages:** Arduino C++, MicroPython, ESP-IDF — switch with the
toolbar's [language selector](/docs/programming/languages/).

![ESP32 DevKit V1 on the Velxio canvas](../../../assets/docs/boards/esp32.png)

## What works

- **WiFi**: join `Velxio-GUEST` and reach the real internet — see
  [ESP32 WiFi](/docs/wifi-iot/esp32-wifi/).
- **Peripherals**: GPIO, PWM (LEDC), ADC, I2C, SPI, UART, and the
  timer/interrupt machinery — your firmware boots with the real ROM log.
- **ESP32-CAM** exposes its camera and microSD in the simulator's
  component panels.
- **Web flash**: push the same binary to a physical ESP32 over USB —
  [how](/docs/wifi-iot/web-flash/).

## Notes

- The first ESP-IDF/Arduino compile of a session is the slow one; later
  builds cache.
- The built-in blink example
  ([your first project](/docs/getting-started/first-project/)) targets
  the DevKit V1.

## Board art and pinouts

Each board's canvas art and full pin map, generated from the simulator:

[ESP32 DevKit V1](/docs/boards/reference/esp32/) ·
[ESP32 DevKit-C V4](/docs/boards/reference/esp32-devkit-c-v4/) ·
[ESP32-CAM](/docs/boards/reference/esp32-cam/) ·
[Wemos Lolin32 Lite](/docs/boards/reference/wemos-lolin32-lite/)
