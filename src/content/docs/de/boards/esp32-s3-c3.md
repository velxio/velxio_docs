---
title: ESP32-S3 und ESP32-C3
description: "Die neueren Xtensa-S3- und RISC-V-C3-Familien, einschließlich der XIAO- und Nano-Varianten."
sidebar:
  order: 4
---

## ESP32-S3 (Xtensa LX7, Dual-Core)

| Board                  | Highlights                                          |
| ---------------------- | --------------------------------------------------- |
| **ESP32-S3 DevKit**    | Das Referenz-S3-Board – KI-Beschleunigung, viel RAM |
| **XIAO ESP32-S3**      | Seeeds daumengroßes S3, 11 Pins                     |
| **Arduino Nano ESP32** | S3 im klassischen Nano-Formfaktor, RGB-LED          |

## ESP32-C3 (RISC-V, Single-Core)

| Board                  | Highlights                                 |
| ---------------------- | ------------------------------------------ |
| **ESP32-C3 DevKit**    | Das Referenz-C3 – klein, günstig, WiFi+BLE |
| **XIAO ESP32-C3**      | Seeeds winziges C3                         |
| **ESP32-C3 SuperMini** | Das beliebte Briefmarken-C3-Board          |

**Sprachen** für beide Familien: Arduino C++, MicroPython, ESP-IDF.

## Gleiche Plattform, anderes Silizium

Alles von der [klassischen ESP32-Seite](/docs/de/boards/esp32/) gilt auch hier –
WiFi auf `Velxio-GUEST`, der Peripheriesatz, Web-Flash – aber die Firmware
wird für den richtigen Kern gebaut und darauf ausgeführt: Xtensa LX7 für das S3,
RISC-V für das C3. Unterschiede auf Befehlsebene werden originalgetreu
emuliert, weshalb sich ein S3-Binary und ein C3-Binary desselben Sketches
genau wie ihre Hardware-Gegenstücke verhalten.

Sie suchen das **ESP32-C6**, das **XIAO ESP32S3 Sense** (Kamera + Mikrofon +
microSD) oder das **XIAO ESP32C6**? Diese sind
[Pro-Boards](/docs/de/boards/pro-boards/).

```

```
