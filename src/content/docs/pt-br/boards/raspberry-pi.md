---
title: Raspberry Pi (Linux)
description: Placas Raspberry Pi Linux completas — de Zero a Pi 5 — com shell real, GPIO e Python.
sidebar:
  order: 7
  badge: PRO
---

A família Linux Raspberry Pi inicializa um **Raspberry Pi OS completo** na
nuvem e entrega o terminal — estas não são simulações de microcontroladores, mas
computadores completos.

| Placa                         | Perfil de CPU        |
| ----------------------------- | -------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53           |
| **Raspberry Pi 4**            | Cortex-A72           |
| **Raspberry Pi 5**            | Cortex-A76           |

Todas as placas Pi são **Pro** — consulte [planos](/docs/pt-br/getting-started/plans/).

## Como funciona

1. Coloque a Pi, pressione **Start** (Iniciar) — o console WebSocket conecta em
   cerca de um segundo, então o Linux inicializa (espere 30-60 s até o shell; um
   overlay de "Inicializando…" acompanha o processo).
2. Você chega a um shell real: `python3`, `pip`, `ls /sys/class/gpio` — um
   userland genuíno.
3. **O GPIO está conectado ao canvas**: acione um LED com `gpiozero`, leia um
   botão, fale I2C/SPI com os componentes que você colocou — os shims de
   protocolo conectam o GPIO do Linux ao circuito simulado.
4. Um **painel de sistema de arquivos virtual** envia seus scripts e arquivos
   para a Pi em execução.

```python
from gpiozero import LED
from time import sleep

led = LED(17)
while True:
    led.toggle()
    sleep(0.5)
```

## O UNIHIKER M10

O SBC educacional da DFRobot (uma placa Linux com tela sensível ao toque integrada) roda
na mesma infraestrutura e também é uma placa Pro — encontre-a no
seletor ao lado da família Pi.
