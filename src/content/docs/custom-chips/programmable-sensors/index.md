---
title: Programmable sensors
description: Build a sensor whose reading you change with a slider while the simulation runs, and understand exactly how the slider reaches your running chip.
sidebar:
  order: 3
---

A **programmable sensor** is an ordinary custom chip whose readings you
drive from a slider *while the simulation runs*. A CO2 sensor whose ppm
you sweep to test an alarm threshold. A temperature probe you push past
85 C to see what the firmware does. A light sensor you dim by hand.

Nothing about the chip changes: it is the same WebAssembly component
described in [Getting started](/docs/custom-chips/getting-started/). What
this page adds is the wire that carries a slider value into a chip that is
already running, without recompiling or restarting anything.

## The contract, in three parts

Every programmable sensor is these three pieces and nothing else.

**1. An attribute** holds the tunable value.

```c
S.ppm = vx_attr_register("ppm", 1000);
```

**2. A `controls` entry** in `chip.json` puts a slider on screen. It
addresses the attribute **by the same id**:

```json
"controls": [
  { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
    "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
]
```

**3. Your code re-reads the attribute** every time it needs the value:

```c
double ppm = vx_attr_read(S.ppm);   /* the slider's value right now */
```

Press **Run**, click the chip, and this opens:

![The live control panel of a running CO2 sensor chip: one slider from 400 to 5000 ppm](../../../../assets/docs/custom-chips/sensor-slider-panel.png)

That third point is the one that trips people up. Read the attribute once
in `chip_setup()` and cache it in a variable, and the slider will appear,
move, and do absolutely nothing. `vx_attr_read` is cheap; call it inside
your timer callback, your I2C read handler, wherever the value is
actually needed.

:::tip[You may already have sliders]
If you skip the `controls` section entirely, **any attribute that declares
both `min` and `max` still gets a slider**. Chips you wrote before this
existed are often tunable already. `controls` is how you rename a slider,
give it a unit, make it logarithmic, or turn it into a button.
:::

## How the value reaches your chip

Worth understanding, because the two simulation engines take different
routes and the failure modes differ.

| Step | What happens |
| --- | --- |
| You drag the slider | The panel writes to the sensor update registry, keyed by this chip instance |
| Browser engine (AVR, RP2040, in-browser ESP32) | The value is written straight into the attribute map that the running WebAssembly reads on every `vx_attr_read`. No message passing, no restart |
| ESP32 under QEMU | The chip lives in a worker, so the value is forwarded to it as an attribute update and applied there |
| Every 250 ms of quiet | The last values are mirrored into the component's saved properties, so the slider position survives a save and reload |

Two consequences worth knowing:

- **There is no "apply" step.** The next `vx_attr_read` returns the new
  value. If your chip only reads the attribute once per second, that is
  how long the slider takes to visibly do anything.
- **The panel is per instance.** Two copies of the same chip on one canvas
  have independent sliders, because the controls are synthesized from each
  instance's own manifest.

## Design-time defaults versus live values

They are different surfaces and people mix them up:

- **Stopped**: right-click the chip to open the part inspector. What you
  set there is the attribute's saved default, the value the chip starts
  with.
- **Running**: click the chip. The slider panel opens. What you set there
  is the live value, applied immediately.

## Try one first

Every pattern has a runnable circuit in the gallery. Press Run, then
click the chip:

| Example | What it teaches |
| --- | --- |
| [CO2 Sensor (live slider)](https://velxio.dev/example/co2-sensor-live-slider) | The analog recipe: slider to voltage to `analogRead` |
| [I2C Env Sensor (live sliders)](https://velxio.dev/example/i2c-env-sensor-live-sliders) | Two sliders behind a register map at `0x44` |
| [Motion Sensor (simulate button)](https://velxio.dev/example/motion-sensor-sim-button) | The `button` control: momentary trigger plus a hold slider |
| [Night Light (log lux slider)](https://velxio.dev/example/night-light-log-slider) | `scale: "log"`: five decades of lux on one slider, lamp trips below 50 lx |
| [SPI Thermometer (live slider)](https://velxio.dev/example/spi-thermometer-live-slider) | SPI slave timing: latch on the falling edge of CS |
| [UART Air Sensor (live slider)](https://velxio.dev/example/uart-air-sensor-live-slider) | Push-style serial sensor into SoftwareSerial |

## Where to go next

- [Tutorial: an analog CO2 sensor](/docs/custom-chips/programmable-sensors/co2-analog/)
  — the shortest complete example, from empty chip to `analogRead` tracking
  a slider.
- [Tutorial: temperature and humidity over I2C](/docs/custom-chips/programmable-sensors/i2c-env/)
  — the pattern for any digital-protocol sensor, with two sliders and a
  register map.
- [`controls` reference](/docs/custom-chips/programmable-sensors/reference/)
  — every field, the automatic fallback rules, and what to check when a
  slider does nothing.

:::note[Free]
Everything on this page is free, on every plan: writing a chip, compiling
it, running it, and dragging its sliders. What is paid is having the AI
write a chip for you (Maker and up) and the
[My Chips](/docs/custom-chips/my-chips/) server-side library (Pro).
:::
