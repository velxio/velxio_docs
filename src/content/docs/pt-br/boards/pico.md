---
title: Raspberry Pi Pico e Pico W
description: As placas RP2040 — emulação no navegador com suporte a MicroPython e Arduino.
sidebar:
  order: 5
---

As placas RP2040 rodam **no seu navegador** com uma emulação fiel do
núcleo duplo Cortex-M0+.

| Placa                    | Destaques                                |
| ------------------------ | ---------------------------------------- |
| **Raspberry Pi Pico**    | A placa RP2040 padrão, 26 GPIO           |
| **Raspberry Pi Pico W**  | Mesma placa com o módulo WiFi            |

**Linguagens:** MicroPython (o habitat nativo do Pico) e Arduino C++
(o núcleo earlephilhower).

## O que funciona

- GPIO, PWM, ADC, I2C, SPI, UART — e **PIO**, os blocos de E/S programáveis
  característicos do RP2040, dos quais os exemplos de NeoPixel e protocolos
  incomuns dependem.
- O REPL do MicroPython pelo [monitor serial](/docs/pt-br/programming/serial-monitor/).
- Gravação de um Pico real via `.uf2` com
  [web flash](/docs/pt-br/wifi-iot/web-flash/).

## Onde está o RP2350?

O **Badger 2350** (crachá de e-paper RP2350 da Pimoroni) é uma
[placa Pro](/docs/pt-br/boards/pro-boards/) — ele inicializa o firmware completo
de fábrica do BadgeOS, incluindo o e-paper.

----- FIM DA PÁGINA -----
