---
title: Serial monitor
description: See your program's serial output and send data back to it.
sidebar:
  order: 5
---

Toggle the serial monitor with the **Serial** button in the toolbar. It
opens as a bottom panel, with **one tab per board** in the project:

![The serial monitor during a run](../../../assets/docs/programming/serial-monitor.png)

Everything your firmware prints (`Serial.println`, MicroPython's `print`,
the boot ROM log) appears here in real time — including the chip's own
boot messages, because the emulator boots the real firmware.

## Controls

- **Baud rate** — matches your `Serial.begin(...)`; 115200 is the usual.
- **Autoscroll** — follow the newest output; untick to scroll back.
- **Clear** — empty the buffer.
- **Hardware serial** — indicates the tab is attached to the board's UART.

## Sending input

Type in the **message box** at the bottom and press **Send**. The line
ending selector (Newline / Carriage return / both / none) matters for
sketches that parse `Serial.read()` — the same way it does in the Arduino
IDE's monitor.

On MicroPython boards the serial monitor doubles as the **REPL**: stop
your script with Ctrl+C style interrupts and type Python interactively.
