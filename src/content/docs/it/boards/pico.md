---
title: Raspberry Pi Pico & Pico W
description: Le schede RP2040 — emulazione nel browser con supporto MicroPython e Arduino.
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

![Raspberry Pi Pico W sul canvas di Velxio](../../../../assets/docs/boards/pi-pico-w.png)

## Cosa funziona

- GPIO, PWM, ADC, I2C, SPI, UART — e **PIO**, i blocchi I/O programmabili
  che contraddistinguono l'RP2040, su cui si basano gli esempi con NeoPixel
  e protocolli particolari.
- La REPL di MicroPython tramite il [monitor seriale](/docs/it/programming/serial-monitor/).
- Flash di un Pico reale dal browser: la scheda entra in modalità BOOTSEL e
  la finestra di dialogo scrive il file `.uf2` tramite WebUSB, oppure puoi
  scaricare il file e trascinarlo sull'unità. Vedi [web flash](/docs/it/wifi-iot/web-flash/).

## Dov'è l'RP2350?

Il **Badger 2350** (il badge e-paper RP2350 di Pimoroni) è una
[scheda Pro](/docs/it/boards/pro-boards/) — avvia il firmware completo di fabbrica
BadgeOS, e-paper incluso.

## Grafica delle schede e pinout

La grafica canvas di ciascuna scheda e la mappa completa dei pin, generate dal simulatore:

[Raspberry Pi Pico](/docs/it/boards/reference/raspberry-pi-pico/) ·
[Raspberry Pi Pico W](/docs/it/boards/reference/pi-pico-w/)
