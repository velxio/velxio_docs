---
title: Raspberry Pi (Linux)
description: Placas Raspberry Pi Linux completas — desde Zero hasta Pi 5 — con shell real, GPIO y Python.
sidebar:
  order: 7
  badge: PRO
---

La familia Linux Raspberry Pi arranca un **Raspberry Pi OS completo** en la
nube y te entrega la terminal — estos no son simuladores de microcontroladores, sino
computadoras completas.

| Placa                         | Perfil de CPU       |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | Clase ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

Todas las placas Pi son **Pro** — consulta los [planes](/docs/es/getting-started/plans/).

## Cómo funciona

1. Coloca la Pi, presiona **Start** (Iniciar) — la consola WebSocket se conecta en
   aproximadamente un segundo, luego Linux arranca (espera de 30 a 60 s para obtener un shell; un
   indicador de "Booting…" hace seguimiento del proceso).
2. Llegas a un shell real: `python3`, `pip`, `ls /sys/class/gpio` — un
   espacio de usuario genuino.
3. **El GPIO está conectado al lienzo**: controla un LED desde `gpiozero`, lee un
   botón, comunícate por I2C/SPI con los componentes que colocaste — los adaptadores de
   protocolo conectan el GPIO de Linux con el circuito simulado.
4. Un **panel de sistema de archivos virtual** sube tus scripts y archivos a
   la Pi en ejecución.

```python
from gpiozero import LED
from time import sleep

led = LED(17)
while True:
    led.toggle()
    sleep(0.5)
```

## La UNIHIKER M10

La SBC educativa de DFRobot (una placa Linux con pantalla táctil integrada) funciona
sobre la misma infraestructura y también es una placa Pro — encuéntrala en el
selector junto a la familia Pi.
