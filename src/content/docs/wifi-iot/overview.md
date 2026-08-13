---
title: WiFi & IoT overview
description: Simulated WiFi on ESP32 boards, MQTT/HTTP projects, and flashing real hardware from the browser.
sidebar:
  order: 1
---

ESP32 boards in Velxio come with **simulated WiFi**: your firmware sees a
network, associates, gets an IP address over DHCP and can talk to the
internet — the same sketch that runs on your desk runs in the simulator.

In this section:

- **ESP32 WiFi** — how the simulated network works, which chips support it,
  and WiFi from Arduino and MicroPython.
- **MQTT and HTTP** — connect your simulated board to real brokers and APIs.
- **Web flash** — when you're happy with the project, flash it to a real
  ESP32 over USB straight from the browser, no toolchain installed.
