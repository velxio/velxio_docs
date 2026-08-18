---
title: Pro boards
description: The premium board catalog — M5Stack, Badger 2350, XIAO Sense, ESP32-C6, Galactic Unicorn, UNIHIKER.
sidebar:
  order: 8
  badge: PRO
---

Pro boards are the catalog's premium tier: branded hardware with rich
built-in peripherals, emulated deeply enough to boot their **factory
firmware**. They are part of the hosted catalog on velxio.dev.

:::note[Which plan do they need?]
**Only the UNIHIKER M10 requires a paid plan.** Every other board on this
page — M5Stack, Pimoroni, XIAO and the ESP32-C6 DevKit — **runs on the
free plan**. The paid-only boards are exactly the STM32 family and the
Raspberry Pi Linux family (which is where the UNIHIKER belongs). See
[plans](/docs/getting-started/plans/).
:::

## M5Stack

*Free plan.*

### M5 Cardputer ADV

![M5 Cardputer ADV on the Velxio canvas](../../../assets/docs/boards/cardputer-adv.png)

The ESP32-S3 pocket computer with keyboard and TFT. Boots the real M5
launcher firmware; type on the on-screen keyboard, run apps, use the
speaker.

### M5Stack Core

![M5Stack Core on the Velxio canvas](../../../assets/docs/boards/m5stack-core.png)

The classic stackable ESP32 with 320x240 TFT and three buttons.

## Pimoroni

*Free plan.*

### Badger 2350

![Pimoroni Badger 2350 on the Velxio canvas](../../../assets/docs/boards/badger-2350.png)

The RP2350 e-paper badge. It boots the complete **BadgeOS factory
firmware**: navigate the launcher with the A/B/C/UP/DOWN buttons, open
the clock, badge and gallery apps, and watch the e-paper refresh the way
e-paper really does.

### Galactic Unicorn

![Pimoroni Galactic Unicorn on the Velxio canvas](../../../assets/docs/boards/galactic-unicorn.png)

The 53x11 RGB LED matrix (583 pixels) driven by an on-board Pico 2 W
(RP2350), with the A/B/C/D and volume / brightness buttons.

### Pico Plus 2 W

![Pimoroni Pico Plus 2 W on the Velxio canvas](../../../assets/docs/boards/pimoroni-pico-plus-2w.png)

Pimoroni's RP2350B board in the standard Pico footprint (GP0..GP28 plus
power), so any Pico wiring drops straight onto it. GPIO, UART, USB serial,
I2C and SPI run; the CYW43 WiFi coprocessor and PSRAM are not emulated.

## Seeed Studio XIAO

*Free plan.*

### XIAO ESP32S3 Sense

![XIAO ESP32S3 Sense on the Velxio canvas](../../../assets/docs/boards/xiao-esp32s3-sense.png)

The S3 with the camera module, PDM microphone and microSD.

### XIAO ESP32C6

![XIAO ESP32C6 on the Velxio canvas](../../../assets/docs/boards/xiao-esp32c6.png)

WiFi 6 capable RISC-V C6 in the XIAO footprint.

### XIAO RP2040

![XIAO RP2040 on the Velxio canvas](../../../assets/docs/boards/xiao-rp2040.png)

The RP2040 XIAO with its NeoPixel.

## Espressif ESP32-C6

*Free plan.*

![ESP32-C6 DevKit on the Velxio canvas](../../../assets/docs/boards/esp32-c6.png)

The **ESP32-C6 DevKit** — the RISC-V WiFi-6 chip, with the same language
trio (Arduino / MicroPython / ESP-IDF) as the rest of the ESP32 family.

## DFRobot UNIHIKER M10

*Paid plan required.*

![DFRobot UNIHIKER M10 on the Velxio canvas](../../../assets/docs/boards/unihiker-m10.png)

A Linux single-board computer with built-in touchscreen — documented with
the [Raspberry Pi family](/docs/boards/raspberry-pi/), since it shares the
full-Linux workflow. Like the rest of that family, it is the one board on
this page that **needs a paid plan** to run.

---

Pro boards appear in the [component picker](/docs/circuit-editor/placing-components/)
with a **PRO badge**; the [starter templates](/docs/getting-started/projects/)
include ready-to-run projects for each.

## Board art and pinouts

Each board's canvas art and full pin map, generated from the simulator:

[Badger 2350](/docs/boards/reference/badger-2350/) ·
[Galactic Unicorn](/docs/boards/reference/galactic-unicorn/) ·
[Pico Plus 2 W](/docs/boards/reference/pimoroni-pico-plus-2w/) ·
[M5 Cardputer ADV](/docs/boards/reference/cardputer-adv/) ·
[M5Stack Core](/docs/boards/reference/m5stack-core/) ·
[ESP32-C6 DevKit](/docs/boards/reference/esp32-c6/) ·
[XIAO ESP32S3 Sense](/docs/boards/reference/xiao-esp32s3-sense/) ·
[XIAO ESP32C6](/docs/boards/reference/xiao-esp32c6/) ·
[XIAO RP2040](/docs/boards/reference/xiao-rp2040/) ·
[UNIHIKER M10](/docs/boards/reference/unihiker-m10/)
