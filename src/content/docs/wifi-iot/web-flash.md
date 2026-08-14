---
title: Flash real hardware from the browser
description: Write your compiled project to a physical board over USB — no toolchain installed.
sidebar:
  order: 4
---

When your project works in the simulator, you can put it on a **real
board** without installing anything: Velxio flashes the compiled firmware
over USB, straight from the browser.

## Requirements

- A Chromium-based browser (Chrome or Edge) — the flasher uses the
  browser's serial port API, which Firefox and Safari don't ship.
- A data-capable USB cable to your board.
- Close anything else using the port first (serial monitors, IDEs) — the
  browser needs exclusive access.

![The flash dialog picking a USB serial port](../../../assets/docs/wifi-iot/flash-modal.png)

## Flashing

1. Open the **Flash** dialog from the editor.
2. Pick the USB serial port — the dialog auto-detects candidates, and the
   browser asks you to confirm which port to grant.
3. Velxio uses the firmware it already compiled for your board — the same
   binary the simulator was running.
4. Watch the progress; when it finishes, the board reboots into your
   project.

RP2040/RP2350 boards flash their `.uf2`, ESP32 boards their `.bin` — the
dialog picks the right protocol for the target.

## Simulate first, flash second

This closes the loop that makes Velxio useful for real work: iterate
fast in the simulator (no cable, no wear on the hardware, instant
resets), then flash the exact same build artifact when it behaves.
