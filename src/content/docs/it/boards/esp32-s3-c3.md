---
title: ESP32-S3 e ESP32-C3
description: Le nuove famiglie Xtensa S3 e RISC-V C3, incluse le varianti XIAO e Nano.
sidebar:
  order: 4
---

## ESP32-S3 (Xtensa LX7, dual-core)

| Scheda                 | Caratteristiche principali                                |
| ---------------------- | --------------------------------------------------------- |
| **ESP32-S3 DevKit**    | La scheda S3 di riferimento — accelerazione AI, molta RAM |
| **XIAO ESP32-S3**      | La S3 delle dimensioni di un pollice di Seeed, 11 pin     |
| **Arduino Nano ESP32** | S3 nel classico formato Nano, LED RGB                     |

## ESP32-C3 (RISC-V, single-core)

| Scheda                 | Caratteristiche principali                          |
| ---------------------- | --------------------------------------------------- |
| **ESP32-C3 DevKit**    | La C3 di riferimento — piccola, economica, WiFi+BLE |
| **XIAO ESP32-C3**      | La minuscola C3 di Seeed                            |
| **ESP32-C3 SuperMini** | La popolare scheda C3 formato francobollo           |

**Linguaggi** per entrambe le famiglie: Arduino C++, MicroPython, ESP-IDF.

## Stessa piattaforma, diverso silicio

Tutto quanto riportato nella [pagina classica ESP32](/docs/it/boards/esp32/) si applica anche qui —
WiFi su `Velxio-GUEST`, il set di periferiche, il flash web — ma il firmware
è compilato ed eseguito sul core corretto: Xtensa LX7 per la S3,
RISC-V per la C3. Le differenze a livello di istruzioni sono fedelmente
emulate, motivo per cui un binario S3 e un binario C3 dello stesso sketch
si comportano esattamente come le loro controparti hardware.

Cerchi la **ESP32-C6**, la **XIAO ESP32S3 Sense** (fotocamera + microfono +
microSD) o la **XIAO ESP32C6**? Quelle sono
[schede Pro](/docs/it/boards/pro-boards/).
