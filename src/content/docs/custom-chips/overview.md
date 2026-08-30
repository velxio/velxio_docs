---
title: Custom chips overview
description: Build your own components with the Velxio custom chips API.
sidebar:
  order: 1
---

When the part you need isn't in the catalog, you can build it yourself. A
**custom chip** is a small program (compiled to WebAssembly) that defines
your component's pins and behavior: it can drive and read GPIOs, speak I2C,
SPI or UART, expose attributes to the properties panel, and even draw to a
framebuffer.

In this section:

- **Getting started** — create your first custom chip from the editor.
- **Programmable sensors** — live sliders that drive your chip while the
  simulation runs (`controls` in chip.json).
- **My Chips** — save a chip once, reuse it in any project (Pro).
- **API reference** — every function in `velxio-chip.h`: GPIO, I2C, SPI,
  UART, time, attributes and framebuffer.
