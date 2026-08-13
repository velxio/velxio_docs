---
title: FAQ
description: Frequently asked questions about Velxio.
sidebar:
  order: 7
---

### Do I need to install anything?

No. Velxio runs entirely in the browser — the editor, the compiler (in the
cloud) and the simulation. A recent Chrome, Edge or Firefox on a desktop is
the best experience.

### Is it really running my code?

Yes. Your sketch is compiled by the same toolchains the real boards use
(arduino-cli, ESP-IDF, MicroPython), and the resulting **real binary** is
executed by an emulated CPU — not a line-by-line interpretation of your
source. Boot logs, timing quirks, register behavior: what you see is what
the silicon would do.

### Is Velxio free?

The core simulator is free, including the open board catalog and the
examples gallery. Pro boards, the AI assistant and private projects need a
paid plan — see [plans](/docs/getting-started/plans/).

### Can I import my Wokwi projects?

Yes — the **open project** button accepts Wokwi `.zip` archives alongside
Velxio's own `.vlx` files. See
[Saving and opening projects](/docs/getting-started/projects/).

### Which boards are supported?

Arduino UNO/Nano/Mega, the ESP32 family (classic, S3, C3), Raspberry Pi
Pico and Pico W, STM32, full Linux Raspberry Pi, ATtiny85 and more — the
complete list with details is in [Boards](/docs/boards/overview/).

### Does WiFi work in the simulator?

On ESP32 boards, yes — the simulated station associates, gets an IP over
DHCP and can reach the internet gateway for MQTT/HTTP projects. See
[WiFi & IoT](/docs/wifi-iot/overview/).

### Can I get my project onto real hardware?

Yes. For ESP32 projects, **web flash** writes the compiled firmware to a
real board over USB, straight from the browser. See
[Web flash](/docs/wifi-iot/overview/).

### Where do I report a bug or ask for a feature?

Through the **Help** menu in the editor, the Velxio
[Discord community](https://velxio.dev), or the GitHub organization —
whichever you prefer.
