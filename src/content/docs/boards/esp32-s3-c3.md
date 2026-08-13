---
title: ESP32-S3 and ESP32-C3
description: The newer Xtensa S3 and RISC-V C3 families, including the XIAO and Nano variants.
sidebar:
  order: 4
---

## ESP32-S3 (Xtensa LX7, dual-core)

| Board                  | Highlights                                              |
| ---------------------- | ------------------------------------------------------- |
| **ESP32-S3 DevKit**    | The reference S3 board — AI acceleration, plenty of RAM |
| **XIAO ESP32-S3**      | Seeed's thumb-sized S3, 11 pins                         |
| **Arduino Nano ESP32** | S3 in the classic Nano footprint, RGB LED               |

## ESP32-C3 (RISC-V, single-core)

| Board                  | Highlights                                |
| ---------------------- | ----------------------------------------- |
| **ESP32-C3 DevKit**    | The reference C3 — small, cheap, WiFi+BLE |
| **XIAO ESP32-C3**      | Seeed's tiny C3                           |
| **ESP32-C3 SuperMini** | The popular postage-stamp C3 board        |

**Languages** for both families: Arduino C++, MicroPython, ESP-IDF.

## Same platform, different silicon

Everything from the [classic ESP32 page](/docs/boards/esp32/) applies —
WiFi on `Velxio-GUEST`, the peripheral set, web flash — but the firmware
is built for and executed on the right core: Xtensa LX7 for the S3,
RISC-V for the C3. Instruction-level differences are faithfully
emulated, which is why an S3 binary and a C3 binary of the same sketch
behave exactly like their hardware counterparts.

Looking for the **ESP32-C6**, the **XIAO ESP32S3 Sense** (camera + mic +
microSD) or the **XIAO ESP32C6**? Those are
[Pro boards](/docs/boards/pro-boards/).

## Board art and pinouts

Each board's canvas art and full pin map, generated from the simulator:

[ESP32-S3 DevKit](/docs/boards/reference/esp32-s3/) ·
[XIAO ESP32-S3](/docs/boards/reference/xiao-esp32-s3/) ·
[Arduino Nano ESP32](/docs/boards/reference/arduino-nano-esp32/) ·
[ESP32-C3 DevKit](/docs/boards/reference/esp32-c3/) ·
[XIAO ESP32-C3](/docs/boards/reference/xiao-esp32-c3/) ·
[ESP32-C3 SuperMini](/docs/boards/reference/aitewinrobot-esp32c3-supermini/)
