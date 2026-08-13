---
title: Raspberry Pi Pico & Pico W
description: Le schede RP2040 — emulazione nel browser con supporto a MicroPython e Arduino.
sidebar:
  order: 5
---

Le schede RP2040 funzionano **nel tuo browser** con una fedele emulazione
dual-core Cortex-M0+.

| Scheda                   | Caratteristiche principali                |
| ------------------------ | ----------------------------------------- |
| **Raspberry Pi Pico**    | La scheda RP2040 standard, 26 GPIO        |
| **Raspberry Pi Pico W**  | La stessa scheda con il modulo WiFi       |

**Linguaggi:** MicroPython (l'habitat naturale del Pico) e Arduino C++
(il core earlephilhower).

## Cosa funziona

- GPIO, PWM, ADC, I2C, SPI, UART — e **PIO**, i caratteristici blocchi
  I/O programmabili dell'RP2040, da cui dipendono gli esempi con NeoPixel
  e protocolli particolari.
- Il REPL di MicroPython tramite il [monitor seriale](/docs/it/programming/serial-monitor/).
- Il flashing di un Pico reale tramite il suo `.uf2` con
  [web flash](/docs/it/wifi-iot/web-flash/).

## Dov'è l'RP2350?

Il **Badger 2350** (il badge e-paper RP2350 di Pimoroni) è una
[scheda Pro](/docs/it/boards/pro-boards/) — avvia il firmware completo
BadgeOS di fabbrica, e-paper e tutto il resto.
