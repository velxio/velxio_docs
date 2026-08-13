---
title: Raspberry Pi (Linux)
description: Full Linux Raspberry Pi boards — Zero through Pi 5 — with a real shell, GPIO and Python.
sidebar:
  order: 7
  badge: PRO
---

The Linux Raspberry Pi family boots a **complete Raspberry Pi OS** in the
cloud and hands you the terminal — these aren't microcontroller sims, but
full computers.

| Board                         | CPU profile         |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7 class |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

All Pi boards are **Pro** — see [plans](/docs/getting-started/plans/).

## How it works

1. Place the Pi, press **Start** — the WebSocket console attaches in about
   a second, then Linux boots (expect 30-60 s to a shell; a "Booting…"
   overlay tracks it).
2. You land in a real shell: `python3`, `pip`, `ls /sys/class/gpio` — a
   genuine userland.
3. **GPIO is wired to the canvas**: drive an LED from `gpiozero`, read a
   button, talk I2C/SPI to the components you placed — the protocol shims
   bridge the Linux GPIO to the simulated circuit.
4. A **virtual file system panel** uploads your scripts and files into
   the running Pi.

```python
from gpiozero import LED
from time import sleep

led = LED(17)
while True:
    led.toggle()
    sleep(0.5)
```

## The UNIHIKER M10

DFRobot's education SBC (a Linux board with a built-in touchscreen) runs
on the same infrastructure and is also a Pro board — find it in the
picker next to the Pi family.
