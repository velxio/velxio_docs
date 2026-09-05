---
title: Flash real hardware from the browser
description: Write your compiled project to a physical board over USB, straight from the browser, with no toolchain installed.
sidebar:
  order: 4
---

When your project works in the simulator, you can put it on a **real
board** without installing anything: Velxio flashes the compiled firmware
over USB, straight from the browser.

## Requirements

- A Chromium-based browser (Chrome or Edge). The flasher uses the
  browser's Web Serial and WebUSB APIs, which Firefox and Safari do not
  ship. Pico-family boards still get a **Download .uf2** button there
  (see below).
- A data-capable USB cable to your board.
- Close anything else using the port first (serial monitors, IDEs,
  picotool): the browser needs exclusive access.

![The flash dialog picking a USB serial port](../../../assets/docs/wifi-iot/flash-modal.png)

## Flashing

1. Right-click the board on the canvas and pick **Flash to real board**.
2. Click **Connect & flash**. The browser asks which USB device to grant;
   pick your board.
3. Velxio uses the build it already made for that board (the same binary
   the simulator was running). If the code changed since, it recompiles
   first and the compiler output streams into the dialog.
4. Watch the progress bar; when it finishes, the board reboots into your
   project.

The dialog picks the protocol for the target:

| Family | How it is written | The board must be |
| --- | --- | --- |
| ESP32, S3, C3, C6 | esptool over the serial port, the merged `.bin` | plugged in; hold BOOT if it does not answer |
| Arduino Uno, Nano, Mega, ATtiny85 | STK500 against the board's bootloader, the `.hex` | plugged in (ATtiny85: through an Arduino running ArduinoISP) |
| Raspberry Pi Pico, Pico W, Pico 2, Pimoroni RP2040 / RP2350 boards | PICOBOOT over WebUSB, the `.uf2` picotool built | in **BOOTSEL** mode (next section) |

## Pico-family boards: BOOTSEL first

An RP2040 or RP2350 is programmed by its bootloader, a separate USB
personality the chip only shows in **BOOTSEL** mode. Two ways to get
there:

- **By hand**: hold the BOOTSEL button while plugging the board in, then
  release it. The board mounts as a USB drive named `RPI-RP2` (RP2040) or
  `RP2350`.
- **From the dialog**: the flash dialog for these boards has a
  **Reboot into bootloader over USB** button. It works when the board is
  running a sketch Velxio built (the Arduino core reboots on a 1200 baud
  open) or MicroPython (the REPL runs `machine.bootloader()`). The
  browser asks for the board's serial port, the board drops off and comes
  back as the bootloader. Then click **Connect & flash** and pick the
  `RP2 Boot` / `RP2350 Boot` device.

Two clicks, two permission prompts: the serial port for the reboot and
the USB device for the write. Once the board is in BOOTSEL, later flashes
need only the second one.

### Two revisions of the same board

Pimoroni sold the Stellar and Galactic Unicorn with a Pico W (RP2040)
until January 2025 and with a Pico 2 W (RP2350) since. The simulator
runs the current one; the flash dialog has a **Real board revision**
select for these boards. Pick "Pico W aboard" for the older unit: the
dialog builds a second image for that chip, flashes or downloads it, and
the simulator keeps running its own build. The choice is remembered per
board. The label on the back of the board (or the drive name in BOOTSEL,
`RPI-RP2` versus `RP2350`) tells you which one you have.

The dialog refuses an image that does not match the chip that answered
(an RP2350 build on an RP2040, a RISC-V build on an ARM configuration)
before anything is erased, verifies every byte after writing, and
reboots the board into the program.

### Windows and an RP2040: install WinUSB once

The RP2040 bootloader ships no Windows driver descriptor, so the browser
cannot claim it until WinUSB is bound to it. One-time setup:

1. Put the board in BOOTSEL and plug it in.
2. Download and run [Zadig](https://zadig.akeo.ie).
3. Pick `RP2 Boot (Interface 1)` from the list (Options, List All
   Devices if it is hidden), select **WinUSB** as the driver and click
   **Install Driver**.

RP2350 boards (Pico 2, Pico 2 W, the Pimoroni "Pico 2 W Aboard"
Unicorns, Badger 2350) need nothing: their bootloader carries the
descriptor and Windows binds WinUSB by itself. macOS needs nothing on
either chip.

### Linux: a udev rule

Linux gives USB devices to root by default. Create
`/etc/udev/rules.d/99-velxio-rp2.rules` with:

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

then `sudo udevadm control --reload-rules && sudo udevadm trigger` and
re-plug the board. The serial port used for the reboot step needs the
usual `dialout` group membership as well.

### Any browser: download the .uf2, or copy it to the drive

The flash dialog for a Pico-family board always offers **Download .uf2**
(on Firefox and Safari, where the browser cannot flash, that is the whole
dialog). Save the file, put the board in BOOTSEL and drop the file on the
`RPI-RP2` / `RP2350` drive: the board reboots into your sketch the moment
the copy ends.

On Chrome and Edge there is also **Copy to the board's drive**: the
browser asks you to pick the drive and writes the file there itself. No
driver is involved, so it is the way to program an RP2040 on Windows
without installing WinUSB. The dialog checks that the folder you picked
is a BOOTSEL drive (it carries `INFO_UF2.TXT`) before writing anything.

### MicroPython projects on a Pico

The dialog uploads the project's `.py` files over the REPL and reboots
into `main.py`. MicroPython itself has to be on the board first:

- **Pico and Pico W**: the dialog installs it. If no REPL answers, it
  asks you to put the board in BOOTSEL and click Retry; that click writes
  the same MicroPython build the simulator runs, and one more Retry
  uploads your files.
- **Pimoroni RP2350 boards** (Badger 2350, Pico Plus 2W): they ship with
  Pimoroni's own MicroPython. If yours lost it, download the `.uf2` from
  [pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases)
  and drop it on the BOOTSEL drive once, then flash from the dialog.

## Troubleshooting

- **"No board in BOOTSEL mode was found"**: the device picker was empty.
  Use the reboot button or hold BOOTSEL while plugging in, then connect
  again.
- **"The board in BOOTSEL is an RP2040 but this project is built for
  RP2350"**: an older Unicorn with a Pico W aboard. Pick "Pico W aboard"
  in the dialog's **Real board revision** select and flash again.
- **"Could not claim the USB device"** on Windows with an RP2040: the
  Zadig step above. On Linux: the udev rule above.
- **The serial reboot did nothing**: a sketch built with the USB stack
  disabled cannot be rebooted over USB. Hold BOOTSEL while plugging in.

## Simulate first, flash second

This closes the loop that makes Velxio useful for real work: iterate
fast in the simulator (no cable, no wear on the hardware, instant
resets), then flash the exact same build artifact when it behaves.
