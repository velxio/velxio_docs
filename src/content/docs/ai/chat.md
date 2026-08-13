---
title: Basic mode — chat
description: A support chat that knows your project — errors, concepts, wiring questions.
sidebar:
  order: 2
---

**Basic** mode is a chat with your project as context: the assistant sees
the circuit on the canvas and the code in the editor, so you can ask
questions the way you'd ask a colleague at the next bench:

![The AI panel in Basic mode](../../../assets/docs/ai/mode-basic.png)

Good Basic-mode questions:

- *"Why is my LED not blinking?"*
- *"What does this compile error mean?"* (paste it, or just ask — it can
  read the output)
- *"Which pin should I use for I2C on this board?"*
- *"Explain what this sketch does line by line."*

## Mechanics

- **Enter** sends, **Shift+Enter** makes a newline.
- **Attach an image** with the paperclip (PNG/JPEG/WebP/GIF up to 4 MB) —
  a photo of a real breadboard, a schematic, a screenshot.
- **Sessions**: start a fresh conversation with **+**, revisit old ones
  from the history button.
- The counter at the bottom shows your **cycles** quota for the day and
  the month — see [plans](/docs/getting-started/plans/).

Basic mode only talks. When you want the assistant to *do* things on the
canvas, switch to [Agent mode](/docs/ai/agent-mode/).
