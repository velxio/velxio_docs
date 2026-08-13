---
title: Tutor mode — learn electronics
description: A teacher that works over your live circuit — exercises, checks and theory.
sidebar:
  order: 4
---

**Tutor** mode turns the assistant into an electronics teacher that
teaches _over your circuit_ — not from a textbook in the abstract:

![The AI panel in Tutor mode](../../../assets/docs/ai/mode-tutor.png)

What tutoring looks like:

- Tell it where you are — _"I'm new, teach me how LEDs and resistors
  work"_ or _"I know Arduino, get me started with I2C"_.
- It proposes a **small exercise** on the canvas, you build it, and it
  **checks your actual circuit and code** — pointing at the wire you
  crossed or the pull-up you forgot.
- The theory arrives when it explains _why_ — Ohm's law when your LED is
  dim, debouncing when your counter jumps.

Because the simulator is real ([really running firmware](/docs/getting-started/faq/)),
everything the tutor teaches is verifiable on the spot: measure it with
the [oscilloscope](/docs/instruments/oscilloscope/), read it in the
[serial monitor](/docs/programming/serial-monitor/).

Tutor mode shares the same **cycles** quota as the other modes — see
[plans](/docs/getting-started/plans/).
