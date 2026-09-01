---
title: Create your first custom chip
description: Add a Custom Chip part, write a few lines of C, and Velxio compiles it to WebAssembly.
sidebar:
  order: 2
---

A **custom chip** is a component you program yourself. You write plain C
against the `velxio-chip.h` API, Velxio compiles it to WebAssembly in the
cloud, and the result behaves like any catalog part: it has pins you wire,
attributes you edit, and logic that runs inside the simulation.

## When to build one

- The IC you need isn't in the catalog (an obscure shift register, a
  proprietary sensor protocol).
- You want a test fixture — a pulse generator, a protocol exerciser, a
  fake sensor with scripted values.
- You're teaching digital logic and want students to _implement_ the
  chip, not just use it.

## The five-minute version

1. Open the [component picker](/docs/circuit-editor/placing-components/)
   and add a **Custom Chip** to the canvas.
2. The examples gallery opens — pick a starting point (or start blank).
3. You land in the regular code editor: the chip owns its own section in
   the file explorer with two ordinary files —
   - **`chip.c`** — the behavior;
   - **`chip.json`** — the manifest: name, pins, attributes (validated
     with completions as you type).
   This is the built-in **Inverter** example:

```c
#include "velxio-chip.h"
#include <stdlib.h>

typedef struct { vx_pin in, out; } chip_state_t;

static void on_in_change(void* ud, vx_pin pin, int value) {
  chip_state_t* s = ud;
  vx_pin_write(s->out, value ? VX_LOW : VX_HIGH);
}

void chip_setup(void) {
  chip_state_t* s = malloc(sizeof *s);
  s->in  = vx_pin_register("IN",  VX_INPUT);
  s->out = vx_pin_register("OUT", VX_OUTPUT);
  vx_pin_write(s->out, vx_pin_read(s->in) ? VX_LOW : VX_HIGH);
  vx_pin_watch(s->in, VX_EDGE_BOTH, on_in_change, s);
  vx_log("inverter ready");
}
```

with its manifest:

```json
{
  "schema": "velxio-chip/v1",
  "name": "Inverter",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

4. Wire `IN` to a button and `OUT` to an LED, then press **Run** — the
   chip compiles automatically whenever its source changed (the hammer
   button in the chip's file-explorer section compiles it on its own,
   with errors in the output console like any C compiler's).
5. Toggle away. Click the chip while the simulation is stopped to jump
   back to its `chip.c`; edit and Run again.

## Giving the chip a face

By default a chip is drawn as a dark body with its name on a silkscreen
band and its pin labels around the edge. You can replace that face with
your own artwork — a photo of the real breakout board, a datasheet
drawing, an icon:

Click the **image** button in the chip's file-explorer section (next to
Compile) and pick a **PNG, JPEG or SVG** up to 256 KB. It joins `chip.c`
and `chip.json` as another file in that chip's section — `chip.png`,
`chip.jpg` or `chip.svg` — so it travels with the project, exports inside
a `.vlx`, and rides along when you save the chip to
[My Chips](/docs/custom-chips/my-chips/).

The image is scaled to fit the chip's body, never cropped or stretched.
**Pins do not move**: their positions still come from `chip.json`, so
adding artwork to a wired chip leaves every wire exactly where it was.
Pin labels stay on top of the image, drawn in white with a dark outline so
they read over light and dark artwork alike, and the printed name gives
way to the artwork (it stays in the hover tooltip).

To remove it, use the button beside the image one, or delete the image
file from the chip's section.

:::tip
An SVG makes the sharpest chip face at any zoom, and you can paste raw
`<svg>` markup straight into a `chip.svg` file instead of uploading.
:::

## How chips execute

The host calls your `chip_setup()` once per chip instance. After that the
chip is **reactive**: your code only runs inside callbacks — a watched pin
changed, an I2C byte arrived, a timer fired. There is no main loop to
block, which is what keeps custom chips cheap enough to sprinkle around a
circuit.

## Built-in example chips

The chip editor ships working sources you can load and modify: logic
gates (inverter, XOR), shift registers (74HC595, CD4094), I2C parts
(PCF8574, DS3231 RTC, 24Cxx EEPROMs), an SPI ADC (MCP3008), a UART
ROT13 transformer, a pulse counter — and a **retro CPU collection**
(Intel 4004 and friends) for the truly adventurous.

Next: the [chips API reference](/docs/custom-chips/api/).
