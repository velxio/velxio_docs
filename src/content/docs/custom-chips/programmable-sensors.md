---
title: Programmable sensors with live sliders
description: Build a sensor whose value you change with a slider while the simulation runs, using the controls section of chip.json.
sidebar:
  order: 3
---

A custom chip can be a **programmable sensor**: a part whose output you
drive from a slider *while the simulation runs*. Think a CO2 sensor whose
ppm you sweep to test thresholds, a temperature/humidity probe behind
I2C, a light sensor, a potentiometer with a mind of its own — anything
where "what if the value changes?" is the whole point.

## The recipe

Three ingredients, all in the chip you already know how to write:

1. **An attribute** — the tunable value: `vx_attr_register("ppm", 1000)`.
2. **A `controls` section** in `chip.json` — this is what puts the slider
   on screen during the simulation:

```json
{
  "name": "CO2 Sensor",
  "pins": ["VCC", "GND", "OUT"],
  "attributes": [
    { "name": "ppm", "label": "CO2 (ppm)", "type": "int",
      "default": 1000, "min": 400, "max": 5000, "step": 10 }
  ],
  "controls": [
    { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
      "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
  ]
}
```

3. **Re-read the attribute inside a callback or timer** — never cache it,
   the slider changes it mid-run:

```c
#include "velxio-chip.h"

typedef struct { vx_pin out; vx_attr ppm; vx_timer t; } chip_state_t;
static chip_state_t S;

static void on_tick(void *ud) {
  double ppm = vx_attr_read(S.ppm);              /* live slider value */
  double volts = (ppm - 400.0) / 4600.0 * 5.0;   /* 400..5000 -> 0..5 V */
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out = vx_pin_register("OUT", VX_ANALOG);
  S.ppm = vx_attr_register("ppm", 1000);
  S.t = vx_timer_create(on_tick, 0);
  vx_timer_start(S.t, 50000000ULL, true);        /* 50 ms, nanoseconds */
  on_tick(0);
}
```

Wire `OUT` to a board analog pin (say Arduino `A0`), press **Run**, and
click the chip: the slider panel opens. Drag it and `analogRead(A0)`
tracks in real time.

## How the pieces connect

- Each `controls` entry drives the **attribute with the same id** —
  `vx_attr_read` returns the new value the instant the slider moves.
- `type: "range"` is a slider; `type: "button"` sends a momentary
  `1 → 0` pulse (about 150 ms), for trigger/reset inputs.
- No `controls` section? Any attribute that declares both `min` and
  `max` gets a live slider automatically — most existing chips are
  tunable without touching their manifest.
- The `controls` shape is Wokwi-compatible; `unit` and `scale: "log"`
  are Velxio extensions Wokwi ignores.
- Design-time defaults live in the part inspector (right-click the
  chip while stopped).

## Ready-made templates

The examples gallery ships two sensors built exactly this way:

- **CO2 Sensor (live slider)** — the analog recipe above, verbatim.
- **I2C Env Sensor (live sliders)** — temperature + humidity behind an
  I2C register map at `0x44`, both driven by sliders; the pattern for
  any digital-protocol sensor.

Save your own variant to [My Chips](/docs/custom-chips/my-chips/) and
it's one click away in every project.
