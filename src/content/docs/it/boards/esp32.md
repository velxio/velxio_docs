---
title: ESP32 (classico)
description: ESP32 DevKit V1, DevKit-C V4, ESP32-CAM e Wemos Lolin32 Lite.
sidebar:
  order: 3
---

L'originale Xtensa ESP32 dual-core — il cavallo di battaglia del catalogo, con
**WiFi e Bluetooth** disponibili nel simulatore.

| Scheda                 | Caratteristiche principali                          |
| ---------------------- | --------------------------------------------------- |
| **ESP32 DevKit V1**    | Il devkit standard a 30 pin; LED integrato su GPIO2 |
| **ESP32 DevKit-C V4**  | Devkit ufficiale Espressif, 38 GPIO                 |
| **ESP32-CAM**          | ESP32 + modulo fotocamera da 2 MP + slot microSD    |
| **Wemos Lolin32 Lite** | Compatta, con footprint per caricabatteria LiPo     |

**Linguaggi:** Arduino C++, MicroPython, ESP-IDF — cambia con il
selettore della lingua nella barra degli strumenti ([selettore lingua](/docs/it/programming/languages/)).

## Cosa funziona

- **WiFi**: connettiti a `Velxio-GUEST` e raggiungi Internet reale — vedi
  [ESP32 WiFi](/docs/it/wifi-iot/esp32-wifi/).
- **Periferiche**: GPIO, PWM (LEDC), ADC, I2C, SPI, UART e il
  meccanismo di timer/interrupt — il tuo firmware si avvia con il log ROM reale.
- **ESP32-CAM** espone la sua fotocamera e il microSD nei pannelli dei
  componenti del simulatore.
- **Flash web**: invia lo stesso binario a un ESP32 fisico tramite USB —
  [come fare](/docs/it/wifi-iot/web-flash/).

## Note

- La prima compilazione ESP-IDF/Arduino di una sessione è quella lenta; le
  successive vengono memorizzate nella cache.
- L'esempio di blink integrato
  ([il tuo primo progetto](/docs/it/getting-started/first-project/)) è pensato
  per il DevKit V1.
