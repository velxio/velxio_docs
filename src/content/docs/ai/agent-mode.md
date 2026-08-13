---
title: Agent mode — builds with you
description: The assistant places components, wires them, writes the sketch, compiles and runs.
sidebar:
  order: 3
---

**Agent** mode gives the assistant hands. Ask for a circuit and it will
add the components, wire them up, write the code, compile and run —
right on your canvas, while you watch:

![The AI panel in Agent mode](../../../assets/docs/ai/mode-agent.png)

Try prompts like:

- _"Build a traffic light with 3 LEDs."_
- _"Add an OLED display to this board and show a counter on it."_
- _"My button reads are bouncing — fix the sketch."_
- _"Convert this project to MicroPython."_

## You stay in control

Every action lands in your normal project: parts appear on the canvas,
edits show in the code editor, and the undo history is yours. Inspect
what it did, tweak it, or ask for the next step. If a run fails, the
agent reads the compiler output and the serial monitor the same way you
would, and iterates.

## Working well with the agent

- **Small steps beat essays** — "add a DHT22 and print the temperature"
  gets better results than a paragraph of requirements.
- **Let it finish** — an agent turn can be several actions (place, wire,
  code, compile, run); the panel narrates as it goes.
- Attach an image of a circuit you want reproduced — it can work from a
  photo or schematic.

Agent turns cost more **cycles** than chat replies; the quota counter at
the bottom of the panel tracks what's left today. See
[plans](/docs/getting-started/plans/).
