---
title: Raspberry Pi (Linux)
description: Raspberry Pi boards, Zero through Pi 5 — Python against the circuit on the canvas, in the browser by default or in a Linux guest on Velxio's servers.
sidebar:
  order: 7
  badge: PRO
---

The Raspberry Pi family runs **Python scripts against the circuit on the
canvas**. Unlike the microcontroller boards there is nothing to compile:
you write a script, press **Run**, and Velxio picks one of two engines to
execute it. Neither engine is a Raspberry Pi OS desktop — read this page
before assuming a tutorial written for real hardware will work unchanged.

| Board                         | CPU profile         |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7 class |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

Anyone can place a Pi on the canvas and wire a circuit around it. **Running**
it needs a paid plan, or one of the **three free trial sessions of 15
minutes** every signed-in account gets for the Pi family — see
[plans](/docs/getting-started/plans/).

![Raspberry Pi 5 on the Velxio canvas](../../../assets/docs/boards/raspberry-pi-5.png)

## Two engines

### Instant (in your browser)

The default. Your script runs on a Python interpreter compiled to
WebAssembly inside the tab, starts in a few seconds, and needs nothing
from Velxio's servers. Pin writes reach the canvas directly, so an LED
lights the moment `led.on()` runs.

It is a plain interpreter, not an operating system: there is no shell, no
`subprocess`, no threads, no raw sockets, no `/dev` or `/sys`. A script
that asks for any of those is sent to the Linux engine instead; the **engine
chip** in the toolbar says which engine will run and, when it is Linux, the
file and line that asked for it.

### Linux (on Velxio's servers)

A real Linux guest booted in QEMU (`-M virt`, with the CPU profile of your
board) that you reach through the serial console in the workspace. Be
precise about what it is:

- **Alpine Linux**, not Raspberry Pi OS. `python3` and `pip` are installed;
  `apt`, `raspi-config`, the desktop and the Pi firmware tools are not
  there.
- **No network** from inside the guest, on purpose. `pip install` cannot
  reach PyPI; packages arrive through `requirements.txt` (below).
- **No kernel device nodes for the header.** There is no `/dev/gpiomem`,
  `/dev/i2c-1`, `/dev/spidev0.0` or `/sys/class/gpio`. The Python modules
  listed below are Velxio shims that forward to the canvas; tools that go
  around them (`i2cdetect`, `gpioinfo`, C libraries) have nothing to talk
  to.
- Booting takes roughly 30-90 seconds; a "Booting" overlay tracks it. A
  guest session ends after **2 hours** at the latest.
- The guest runs **`script.py`** from your project when it boots. Name your
  main file that way in Linux mode (the instant engine runs the first
  `.py` it finds). A `.ino` file inside a Pi project is not compiled.

The **Linux terminal** button in the workspace pins this engine for the
rest of the session when you want the shell, for example to inspect files
or run a script by hand. The choice is not saved with the project: reopen
it tomorrow and Run goes back to the detector's answer. Everything the
instant engine can run is faster without it.

## What works today

- **GPIO in and out**: `RPi.GPIO` (`setmode`, `setup`, `output`, `input`,
  `PUD_UP` / `PUD_DOWN`) and the `gpiozero` device classes — `LED`,
  `Button`, `Buzzer`, `RGBLED`, `MotionSensor` and their `on`, `off`,
  `toggle`, `blink`, `value`, `when_pressed` sugar. BCM and BOARD numbering
  both work. This is what every stock Pi example exercises.
- **PWM calls** (`GPIO.PWM`, `PWMLED`) run without error and report the
  duty cycle and frequency to the canvas, but **no catalog part follows them
  yet**: a servo, a dimmed LED or a buzzer wired to a Pi does not react to
  the duty cycle today.
- **UART**: `serial.Serial('/dev/serial0')` (also `/dev/ttyAMA0`,
  `/dev/ttyS0`) sends and receives through the header pins, so a Pi can
  talk to an Arduino or a Pico wired to it.
- **The display channel**: `import velxio_screen` paints frames on the
  display component wired to the board (an ILI9341 or SSD1306), and patches
  `cv2.imshow` to do the same. `waitKey()` returns immediately and no key
  is ever reported — there is no window system.
- **Console output**: `print()` and tracebacks land in the serial monitor.

```python
from gpiozero import LED
from time import sleep

led = LED(17)
while True:
    led.toggle()
    sleep(0.5)
```

## What does not work yet

The parts you wire to a Pi are the same models an Arduino or ESP32 uses,
but the Pi's bus paths to them are not finished. Read this list before
wiring a sensor: a script that catches its own `OSError` and prints a
fallback value will *look* like it works.

- **I2C** — in the **instant** engine, `import smbus2` or `smbus` sends the
  project to the Linux engine (there is no I2C bus in the browser yet). In
  the **Linux** engine the `smbus2` shim exists, but **no catalog sensor
  answers on the bus today**: the guest carries a BME280 model, yet the
  catalog BMP280 part is never attached to it (chip id `0x00` in the
  2026-09-11 baseline). Byte and word reads return `0` rather than raising
  an error, block reads return an empty list, so an MPU6050, DS3231,
  LCD1602, SSD1306 or BMP280 over I2C returns zeros, not data.
- **SPI** — `spidev` imports in the Linux engine, but no catalog part is
  attached to the Pi's SPI bus: every transfer returns zeros of the same
  length. The instant engine has no `spidev` at all (it escalates to
  Linux).
- **1-Wire** — nothing provides `/sys/bus/w1/devices` in either engine, so
  a DS18B20 always falls through to your script's `except` branch.
- **Analog input** — a Raspberry Pi has **no ADC**, on real hardware too. A
  potentiometer, LDR or pulse sensor wired straight to a GPIO cannot be
  read; the pin only ever reports high or low. On hardware you would put an
  MCP3008 (SPI) or ADS1115 (I2C) between the sensor and the Pi, and once
  the Pi's SPI and I2C paths above are finished that is how it will work
  here as well. Until then, analog sensors are not readable from a Pi in
  the simulator.
- **Camera, `pigpio`, `picamera2`** — no hardware behind them.

## Python modules in each engine

Both engines ship the standard library and the Velxio shims; the shims
carry the same protocol so a GPIO script runs identically in both.

| Module | Instant (browser) | Linux (guest) |
| --- | --- | --- |
| `RPi.GPIO` | Yes (shim) | Yes (shim) |
| `gpiozero` | `LED`, `PWMLED`, `Buzzer`, `RGBLED`, `Button`, `MotionSensor`, `LightSensor`; other classes raise `NotImplementedError` | Real gpiozero 2.0.1, bound to the Velxio pin factory |
| `serial` (pyserial) | Shim, the Pi UART paths only | Real pyserial, with the Pi UART paths redirected to the canvas |
| `velxio_screen` | Yes | Yes |
| `smbus2` / `smbus` | No — escalates to Linux | Shim (no parts attached, see above) |
| `spidev` | No — escalates to Linux | Shim (no parts attached, see above) |
| `requests` / `urllib` | Yes, through Velxio's egress proxy (`velxio_net`) with an allowlist | No network |
| `numpy` and other packages | Through `requirements.txt` | Through `requirements.txt` |

### Third-party packages need a `requirements.txt`

**Nothing beyond the list above is installed unless your project declares
it.** Add a `requirements.txt` file next to your script, one package per
line; Velxio resolves it before the run and tells you, in the run
console, what it installed. Which engine can take a package depends on how
it is built:

- A pure-Python package (a `py3-none-any` wheel), or one of the compiled
  packages served with the browser engine — **numpy, pillow and
  opencv-python** — runs in the **instant** engine.
- A package with compiled code runs in the **Linux** engine only if PyPI has
  a **musl aarch64** wheel for it (numpy, pandas, scipy, pillow and psutil
  do). Packages that only publish glibc `manylinux` wheels — opencv-python,
  matplotlib, scikit-learn among them — cannot be installed in the guest.
  opencv-python does work in the instant engine.
- A few packages are refused with an explanation (PyTorch and friends):
  they are gigabytes large and have nothing to accelerate them here.

Wheels count against the same storage quota as Arduino libraries. An
`import` of a package you did not declare fails with
`ModuleNotFoundError` in both engines.

## Files

A **file panel** in the Pi workspace uploads scripts and data files into
the project; in Linux mode they are copied into the guest's home directory
before `script.py` starts.

## The UNIHIKER M10

DFRobot's education SBC (a Linux board with a built-in touchscreen) runs
on the same two engines, with its own `pinpong` and `unihiker` modules in
place of the Pi shims. It is a paid board with its own three trial
sessions — find it in the picker next to the Pi family.

## Board art and pinouts

Each board's canvas art and full pin map, generated from the simulator:

[Raspberry Pi 3 (art also for Zero/1/2)](/docs/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/boards/reference/unihiker-m10/)
