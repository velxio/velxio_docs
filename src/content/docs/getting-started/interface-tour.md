---
title: Interface tour
description: The editor at a glance — canvas, code editor, toolbar, consoles and the AI panel.
sidebar:
  order: 3
---

This is the Velxio editor with a project running:

![The Velxio editor, annotated by region](../../../assets/docs/getting-started/first-project-running.png)

## The menu bar

**File · Edit · View · Account · Help** — project operations, undo/redo,
panel visibility, your account and plan, and help resources.

## The toolbar

From left to right:

| Control              | What it does                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| Layout toggles       | Show the **Code** editor, the **Circuit** canvas, or **Both** side by side                                 |
| Language selector    | **Arduino C++**, **MicroPython** or **ESP-IDF** — per board, see [Languages](/docs/programming/languages/) |
| **Compile** (Ctrl+B) | Build without running                                                                                      |
| **Run**              | Compile if needed, then start the simulation                                                               |
| **Stop** / **Reset** | Halt the simulation / restart the firmware from the top                                                    |
| **Libraries**        | Search and install Arduino libraries                                                                       |
| Output toggle        | Show/hide the compiler output console                                                                      |
| Board selector       | Which board the code editor and Run apply to (projects can have several)                                   |
| **Serial**           | Toggle the [serial monitor](/docs/programming/serial-monitor/)                                             |
| **Scope**            | Toggle the [oscilloscope / logic analyzer](/docs/instruments/oscilloscope/)                                |
| **Add**              | Open the [component picker](/docs/circuit-editor/placing-components/)                                      |

## The workspace panel (left)

Your project's file tree: each board has its own files (`sketch.ino`,
`libraries.json`, anything you add). The icons above it create a new
workspace from a [starter template](/docs/getting-started/projects/), open
a project file, and save.

## The canvas (center)

Where the circuit lives. Scroll to pan, use the zoom controls at the bottom
right, click parts to select them, right-click for their
[inspector](/docs/circuit-editor/part-inspector/). The yellow **SPICE**
badge reports the analog engine's state for the selected circuit.

## The consoles (bottom)

- **Output** — compiler and system messages.
- **Serial monitor** — one tab per running board; input box to send data
  back. See [Serial monitor](/docs/programming/serial-monitor/).
- **Oscilloscope** — when toggled on. See
  [Oscilloscope](/docs/instruments/oscilloscope/).

## The AI panel (right)

The assistant in its three modes — **Basic**, **Agent**, **Tutor** — with
your remaining daily quota at the bottom. See
[AI assistant](/docs/ai/overview/). Minimize it with the arrow button when
you want the full canvas.
