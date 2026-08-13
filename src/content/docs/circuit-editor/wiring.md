---
title: Wiring
description: Connect pins with wires, route them, and color-code them like a real jumper kit.
sidebar:
  order: 3
---

## Making a connection

Click a **pin** on any part — a wire starts following your cursor. Click
the destination pin to finish it. Wires route orthogonally (right-angle
bends), the way schematics and breadboard photos read best.

- Press **Escape** to cancel a wire you started.
- Click a wire to select it; **Delete** removes it.
- You can also start wiring from the [part inspector](/docs/circuit-editor/part-inspector/):
  right-click a part and "tap a pin to wire".

## Wire colors

While a wire is in progress (or with a wire selected), press a key to set
its color — the same palette convention Wokwi users know:

| Key | Color | Key | Color |
| --- | --- | --- | --- |
| `0` | Black | `6` | Blue |
| `1` | Brown | `7` | Violet |
| `2` | Red | `8` | Gray |
| `3` | Orange | `9` | White |
| `4` | Gold | `c` / `l` / `m` / `p` / `y` | Cyan / Lime / Magenta / Purple / Yellow |
| `5` | Green | | |

New wires get automatic jumper-kit coloring: neighbouring wires pick
visibly different colors, with red and black reserved for power rails.

## Breadboards

When a part's pins sit in breadboard holes, **green dots** appear on the
seated pins — "plugged in and connected" is visible at a glance, without
hovering. The breadboard's internal rails (rows and power strips) conduct
exactly like the real thing.

## Electrical reality

Wires are not just drawings: the analog engine solves the circuit you
actually wired. A missing series resistor, a short, a floating input — all
behave (and misbehave) like on the bench. If a connection would burn out a
part in electrical mode, the circuit verifier warns you before Run.
