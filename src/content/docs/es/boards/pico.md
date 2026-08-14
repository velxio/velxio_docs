---
title: Raspberry Pi Pico y Pico W
description: "Las placas RP2040: emulación en el navegador con soporte para MicroPython y Arduino."
sidebar:
  order: 5
---

Las placas RP2040 funcionan **en tu navegador** con una fiel emulación
de doble núcleo Cortex-M0+.

| Placa                   | Características destacadas                  |
| ----------------------- | ------------------------------------------- |
| **Raspberry Pi Pico**   | La placa RP2040 estándar, 26 GPIO           |
| **Raspberry Pi Pico W** | La misma placa con el módulo WiFi integrado |

**Idiomas:** MicroPython (el hábitat natural de la Pico) y Arduino C++
(el núcleo earlephilhower).

## Qué funciona

- GPIO, PWM, ADC, I2C, SPI, UART — y **PIO**, los bloques de E/S
  programables característicos del RP2040, de los que dependen los
  ejemplos de NeoPixel y protocolos poco convencionales.
- El REPL de MicroPython a través del [monitor serie](/docs/es/programming/serial-monitor/).
- Flashear una Pico real mediante su archivo `.uf2` con
  [web flash](/docs/es/wifi-iot/web-flash/).

## ¿Dónde está la RP2350?

La **Badger 2350** (la placa de tinta electrónica RP2350 de Pimoroni) es una
[placa Pro](/docs/es/boards/pro-boards/) — arranca el firmware de fábrica
completo de BadgeOS, incluida la tinta electrónica.
