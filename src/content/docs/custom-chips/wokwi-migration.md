---
title: Bringing Wokwi chips to Velxio
description: Chips written for the Wokwi custom chips C API compile on Velxio unchanged, and Wokwi project zips import with their chips.
sidebar:
  order: 5
---

If you've written custom chips for Wokwi, they come along: Velxio is
**source-compatible** with the documented Wokwi custom chips C API.

## Same C, unchanged

`#include "wokwi-api.h"` resolves to a clean-room compatibility header
that adapts every documented symbol onto Velxio's native `vx_*` API at
compile time:

- `chip_init()` is the entry point, exactly as on Wokwi.
- `pin_init`, `pin_read`, `pin_write`, `pin_mode`, `pin_watch` (with its
  `pin_watch_config_t`), `pin_adc_read`, `pin_dac_write` — all there.
- `i2c_init`, `uart_init`, `spi_init` take their config structs; fields
  (`connect`/`read`/`write`/`disconnect`, `rx_data`/`write_done`,
  `done`) are translated one for one.
- `attr_init` / `attr_read` (and the `_float` and string variants),
  `timer_init` / `timer_start` (microseconds, converted for you) /
  `timer_start_ns` / `timer_stop`, `get_sim_nanos`,
  `framebuffer_init` / `buffer_write` / `buffer_read`.
- `INPUT`/`OUTPUT`/`INPUT_PULLUP`/`INPUT_PULLDOWN`/`ANALOG`,
  `OUTPUT_LOW`/`OUTPUT_HIGH`, `LOW`/`HIGH`, `RISING`/`FALLING`/`BOTH`,
  `NO_PIN` — identical values.

Compile it like any Velxio chip: paste the C into a Custom Chip's
`chip.c` and press Run.

## chip.json compatibility

`name`, the positional `pins` array (with `""` slot skips),
`attributes`, `controls` (live sliders) and `display` all work as on
Wokwi. `symbol` and custom SVG artwork are ignored — Velxio draws its
own generic chip body sized to your pin count.

## Project zips

**File → Open project** accepts a Wokwi project zip. A `chip-<name>`
part in `diagram.json` becomes a Custom Chip with its sources loaded
from the sibling `<name>.chip.c` / `<name>.chip.json`, wires intact.
Exports write the same layout back.

## What doesn't carry over

- **Precompiled `.wasm` binaries** — Velxio's import namespace differs;
  recompile from source (it takes seconds, and the zip import does it
  on the first Run).
- The experimental `_mcu_*` introspection API.

## Prefer the native API for new chips

The compatibility layer exists so your existing work runs. For new
chips, the native [`velxio-chip.h` API](/docs/custom-chips/api/) is the
same set of ideas with clearer types (voltages as `double`, nanosecond
timers) — and it's what the examples, the AI agent and
[My Chips](/docs/custom-chips/my-chips/) speak natively.
