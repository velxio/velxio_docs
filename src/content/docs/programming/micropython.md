---
title: MicroPython quickstart
description: Run real MicroPython firmware — REPL included — on ESP32 and Pico boards.
sidebar:
  order: 3
---

Velxio doesn't approximate MicroPython — it boots the **real MicroPython
firmware** on the emulated chip. `import machine` behaves like on
hardware, and the [serial monitor](/docs/programming/serial-monitor/)
doubles as the REPL.

## Try it in one click

Open the gallery's night-light example — an LDR (photoresistor)
controlling an LED, in pure MicroPython:

![The MicroPython night-light example](../../../assets/docs/programming/micropython-editor.png)

Note the toolbar: the language selector reads **MicroPython** and the file
tree shows `main.py` instead of a sketch. Press **Run**:

![The night-light running — drag the LDR and watch the LED](../../../assets/docs/programming/micropython-running.png)

While it runs, click the **photoresistor** and drag its light level — the
ADC reading changes and the LED flips exactly as the code decides.

## The essentials

```python
from machine import Pin, ADC
import time

led = Pin(4, Pin.OUT)
ldr = ADC(Pin(34))

while True:
    if ldr.read() < 1000:   # dark
        led.on()
    else:
        led.off()
    time.sleep_ms(200)
```

- **`machine.Pin` / `ADC` / `PWM` / `I2C` / `SPI`** — drive the same
  simulated peripherals Arduino sketches do.
- **The REPL** — stop your script and type Python interactively in the
  serial monitor; `help()` works, tab-completion works.
- **WiFi** — on ESP32 boards, `network.WLAN` joins `Velxio-GUEST` like on
  hardware: see [ESP32 WiFi](/docs/wifi-iot/esp32-wifi/).
- **Extra modules** — add pure-Python files next to `main.py` and import
  them; see [Using libraries](/docs/programming/libraries/).

## Which boards

MicroPython is available on the Raspberry Pi **Pico / Pico W** (its native
home) and across the **ESP32 family** — the full matrix is in
[Languages](/docs/programming/languages/). Switch any supported board to
MicroPython with the toolbar's language selector; Velxio swaps the file
set for you.
