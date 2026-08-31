---
title: "controls reference"
description: Every field of the controls section in chip.json, the automatic slider fallback, how values are stored, and what to check when a control does nothing.
sidebar:
  order: 6
---

The `controls` array in `chip.json` describes what the panel shows while
the simulation runs. Each entry drives the attribute whose `name` matches
the entry's `id`.

## Entry fields

| Field | Applies to | Meaning |
| --- | --- | --- |
| `id` | all | **Required.** The attribute this control drives. An entry with no `id` is skipped |
| `type` | all | `"range"` for a slider, `"button"` for a momentary trigger. Any other value is ignored and the entry produces nothing |
| `label` | all | Text beside the control. Falls back to the attribute's `label`, then to `id` |
| `min` | range | Lower bound. Falls back to the attribute's `min`, then `0` |
| `max` | range | Upper bound. Falls back to the attribute's `max`, then `100` |
| `step` | range | Increment. Falls back to the attribute's `step`, then to `1` when the span is wider than 20, otherwise `0.01` |
| `unit` | range | Printed after the value, for example `ppm` or `%`. Empty by default |
| `scale` | range | `"log"` gives a logarithmic slider. Ignored when `min` is negative, since the curve is undefined there |

The **starting position** of a slider is not taken from the control. It
comes from the attribute's `default`, falling back to `min`. Keep the
attribute's `default` inside the control's range or the panel opens with
the handle pinned at one end.

## The panel title

Taken from the chip's `name`. A chip with no `name` shows "Custom Chip".

## The automatic fallback

You do not have to write `controls` at all.

**Any attribute that declares both `min` and `max`, and that no explicit
control already claims, gets a slider.** Its label comes from the
attribute's `label`, its step from the attribute's `step`, or is inferred:
`1` for `type: "int"`, otherwise `1` when the span is wider than 20 and
`0.01` when it is not. It gets no unit.

So `controls` is only needed to rename a slider, add a unit, make it
logarithmic, or declare a button. Two practical consequences:

- Chips written before live controls existed are frequently tunable
  already, with no edit.
- A chip whose attributes have no `min`/`max` and no `controls` section
  shows **no panel at all**. That is the usual reason clicking a chip
  seems to do nothing.

## Buttons

A `"button"` entry renders a momentary trigger for reset lines, "simulate
motion" style events, and anything else that is an edge rather than a
level. Pressing it drives the attribute to `1` and back to `0` about
150 ms later, so your chip should treat a non-zero read as "the event
happened" rather than trying to catch a specific instant.

## Where values are stored

Slider positions are mirrored into the component's saved properties
(under `attrs`) about 250 ms after you stop moving them, with the pending
values merged. That is why dragging a slider does not write to the
project on every pixel, and why the position still survives a save and
reload.

The mirror is a *copy*. The value the running chip reads is the live one,
applied the moment the control moves.

## Engines

| Engine | How the value arrives |
| --- | --- |
| AVR, RP2040, in-browser ESP32 | Written directly into the attribute store the WebAssembly reads on every `vx_attr_read` |
| ESP32 on the QEMU backend | Forwarded to the worker and applied to the chip runtime's attribute store there |

Both are live: no recompile, no restart, no "apply" button. The only
latency is how often your own code calls `vx_attr_read`.

## Plan

Live controls are **free**, on every plan, as is writing, compiling and
running the chip that declares them. Two neighbouring features are paid:
having the AI author a chip or sensor for you (Maker and up), and the
[My Chips](/docs/custom-chips/my-chips/) library that keeps a chip on the
server for reuse across projects (Pro).

## When a control does nothing

| Symptom | Cause |
| --- | --- |
| Clicking the chip opens no panel | No `controls` entry and no attribute with both `min` and `max`, or the simulation is stopped |
| A specific entry is missing from the panel | Its `type` is neither `range` nor `button`, or it has no `id` |
| The slider moves but nothing changes | The chip cached `vx_attr_read` instead of calling it where the value is used |
| The slider starts at the wrong end | The attribute's `default` is outside the control's `min`/`max` |
| The value jumps in whole numbers | `step` was inferred as `1` because the span is wider than 20; set `step` explicitly |
| A logarithmic slider is linear | `scale: "log"` is ignored when `min` is negative |

## See also

- [Tutorial: an analog CO2 sensor](/docs/custom-chips/programmable-sensors/co2-analog/)
- [Tutorial: temperature and humidity over I2C](/docs/custom-chips/programmable-sensors/i2c-env/)
- [Custom chip API reference](/docs/custom-chips/api/)
