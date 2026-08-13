---
title: Raspberry Pi (Linux)
description: Schede Raspberry Pi Linux complete — da Zero a Pi 5 — con shell reale, GPIO e Python.
sidebar:
  order: 7
  badge: PRO
---

La famiglia Linux Raspberry Pi avvia un **sistema Raspberry Pi OS completo**
nel cloud e ti consegna il terminale — queste non sono simulazioni di
microcontrollori, ma computer completi.

| Scheda                         | Profilo CPU          |
| ------------------------------ | -------------------- |
| **Raspberry Pi Zero / 1 / 2**  | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**             | Cortex-A53           |
| **Raspberry Pi 4**             | Cortex-A72           |
| **Raspberry Pi 5**             | Cortex-A76           |

Tutte le schede Pi sono **Pro** — vedi [piani](/docs/it/getting-started/plans/).

## Come funziona

1. Posiziona il Pi, premi **Start** (Avvia) — la console WebSocket si collega
   in circa un secondo, poi Linux si avvia (prevedi 30-60 s per la shell;
   un overlay "Booting…" tiene traccia dell'avanzamento).
2. Ti ritrovi in una shell reale: `python3`, `pip`, `ls /sys/class/gpio` — un
   vero userland.
3. **La GPIO è collegata al canvas**: pilota un LED da `gpiozero`, leggi un
   pulsante, parla con I2C/SPI ai componenti che hai posizionato — gli shim
   di protocollo collegano la GPIO Linux al circuito simulato.
4. Un **pannello del file system virtuale** carica i tuoi script e file
   nel Pi in esecuzione.

```python
from gpiozero import LED
from time import sleep

led = LED(17)
while True:
    led.toggle()
    sleep(0.5)
```

## Il UNIHIKER M10

L'SBC educativo di DFRobot (una scheda Linux con touchscreen integrato)
funziona sulla stessa infrastruttura ed è anch'essa una scheda **Pro** —
la trovi nel selettore accanto alla famiglia Pi.

----- END PAGE -----
