---
title: Raspberry Pi Pico y Pico W
description: "Las placas RP2040: emulación en el navegador con soporte para MicroPython y Arduino."
sidebar:
  order: 5
---

Las placas RP2040 funcionan **en tu navegador** con una emulación fiel de
doble núcleo Cortex-M0+.

| Placa                    | Características destacadas                  |
| ------------------------ | ------------------------------------------- |
| **Raspberry Pi Pico**    | La placa RP2040 estándar, 26 GPIO           |
| **Raspberry Pi Pico W**  | La misma placa con el módulo WiFi integrado |

**Idiomas:** MicroPython (el hábitat nativo de la Pico) y Arduino C++
(el núcleo earlephilhower).

![Raspberry Pi Pico W en el lienzo de Velxio](../../../../assets/docs/boards/pi-pico-w.png)

## Qué funciona

- GPIO, PWM, ADC, I2C, SPI, UART — y **PIO**, los bloques de E/S
  programables característicos del RP2040, de los que dependen los
  ejemplos de NeoPixel y protocolos poco comunes.
- El REPL de MicroPython a través del [monitor serie](/docs/es/programming/serial-monitor/).
- Flasheo de una Pico real desde el navegador: la placa entra en BOOTSEL y
  el diálogo escribe el `.uf2` mediante WebUSB, o descargas el archivo y
  lo sueltas en la unidad. Consulta [web flash](/docs/es/wifi-iot/web-flash/).

## ¿Dónde está el RP2350?

La **Badger 2350** (la placa de tinta electrónica RP2350 de Pimoroni) es una
[placa Pro](/docs/es/boards/pro-boards/) — arranca el firmware completo de fábrica
de BadgeOS, incluida la tinta electrónica.

## Arte de la placa y distribución de pines

El arte de cada placa en el lienzo y el mapa completo de pines, generados
desde el simulador:

[Raspberry Pi Pico](/docs/es/boards/reference/raspberry-pi-pico/) ·
[Raspberry Pi Pico W](/docs/es/boards/reference/pi-pico-w/)
