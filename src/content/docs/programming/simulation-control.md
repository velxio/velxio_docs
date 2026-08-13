---
title: Controlling the simulation
description: Run, stop, reset, and interact with a live circuit.
sidebar:
  order: 6
---

## Run / Stop / Reset

The three transport buttons in the toolbar:

- **Run** — compile if needed, boot the firmware, start the world.
- **Stop** — halt the simulation. The circuit keeps its drawing but
  nothing executes.
- **Reset** — reboot the firmware from the beginning without recompiling.

The status dot next to the board's name in the file tree tracks the state:
Idle, Compiled, Running.

## Interacting while it runs

The canvas is live during simulation:

- **Buttons and switches** respond to clicks.
- **Potentiometers, encoders and sensors** expose controls to change their
  values — a DHT22's temperature, an LDR's light level — and the firmware
  sees the change immediately.
- **Displays, LEDs and motors** render their real driven state.

Property edits from the [part inspector](/docs/circuit-editor/part-inspector/)
also apply live.

## Multiple boards

A project can hold **more than one board**, each with its own code, serial
tab and Run state — the board selector in the toolbar chooses which one
the code editor and transport buttons target. Boards can talk to each
other through wired buses, which is how the multi-chip examples work.

## The analog engine

Digital pin activity and analog parts are solved together: the yellow
**SPICE badge** over the circuit shows the analog network size and solve
time. When a circuit would damage a part (an LED with no series resistor,
in electrical mode), the verifier flags it before the run starts — fix the
wiring or the value and Run again.
