---
title: Analog simulation
description: The SPICE-class engine behind the canvas — what it models and how to read its badge.
sidebar:
  order: 3
---

Velxio doesn't only propagate digital highs and lows. The analog parts of
your circuit — resistors, diodes, transistors, power sources — are solved
by a **SPICE-class engine** that runs coupled with the digital simulation,
the way mixed-mode simulators on the desktop do it.

## The SPICE badge

The yellow badge above the circuit reports the analog network:

- **nets** — how many electrical nodes the engine is solving.
- **solve time** — what the last analysis cost.

When a board pin drives an analog network (say, a GPIO through a resistor
into an LED), pin edges from the firmware feed the analog solve, and the
resulting voltages and currents drive what you see — LED brightness
included.

## What's modeled

- **Passives** — resistors, potentiometers, and the wiring itself.
- **Diodes and LEDs** — real exponential I/V behavior with per-color
  forward voltages.
- **Transistors** — bipolar transistors (NPN/PNP) with proper junction
  models; motor-driver and relay circuits behave realistically.
- **Logic families** — discrete logic ICs (74xx and friends) modeled with
  family-accurate levels.
- **Power** — supplies, regulators, batteries in the power category.

The engine keeps improving release by release; if an exotic analog corner
behaves unexpectedly, simplify the circuit or ask in the community.

## The circuit verifier

Before a run, Velxio checks the circuit for configurations that would
damage real parts — the classic being an LED across a supply **without a
series resistor**. In electrical mode the verifier blocks the run and
points at the problem; fix the wiring and run again. It's a feature: the
simulator teaches the habit that saves real LEDs.
