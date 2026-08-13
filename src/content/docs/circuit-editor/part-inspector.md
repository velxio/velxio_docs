---
title: Part inspector and datasheets
description: Right-click any part for its properties, pinout, datasheet and example projects.
sidebar:
  order: 4
---

**Right-click any part** on the canvas to open its inspector:

![The part inspector: properties tab](../../../assets/docs/circuit-editor/part-inspector.png)

The left side shows the part with its numbered pins — **tap a pin to start
a wire** from it. The bottom bar has **Rotate** and **Delete**.

## Properties tab

Everything editable about the part: a resistor's value, an LED's color, a
sensor's I2C address, a display's variant. Below the properties, **Example
projects** links open ready-made circuits that use this part.

Property changes take effect immediately — change a resistor from 220 to
10k while the sim runs and watch the LED dim.

## Datasheet tab

![The part inspector: datasheet tab](../../../assets/docs/circuit-editor/datasheet.png)

A practical, condensed datasheet: what the part is, the pin roles in a
table, the electrical values that matter (forward voltage, typical
current, recommended series resistor…), and usage tips. The **Product
page** button links to the real part, so you can buy exactly what you
simulated.

The same content lives in this documentation's
[parts reference](/docs/parts/overview/) — both are generated from the
same source, so they never disagree.
