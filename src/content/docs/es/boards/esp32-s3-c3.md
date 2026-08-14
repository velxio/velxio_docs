---
title: ESP32-S3 y ESP32-C3
description: "Las familias más nuevas Xtensa S3 y RISC-V C3, incluyendo las variantes XIAO y Nano."
sidebar:
  order: 4
---

## ESP32-S3 (Xtensa LX7, doble núcleo)

| Board                  | Características destacadas                              |
| ---------------------- | ------------------------------------------------------- |
| **ESP32-S3 DevKit**    | La placa S3 de referencia: aceleración de IA, mucha RAM |
| **XIAO ESP32-S3**      | La S3 del tamaño de un pulgar de Seeed, 11 pines        |
| **Arduino Nano ESP32** | La S3 en el formato clásico Nano, LED RGB               |

## ESP32-C3 (RISC-V, un solo núcleo)

| Board                  | Características destacadas                        |
| ---------------------- | ------------------------------------------------- |
| **ESP32-C3 DevKit**    | La C3 de referencia: pequeña, económica, WiFi+BLE |
| **XIAO ESP32-C3**      | La diminuta C3 de Seeed                           |
| **ESP32-C3 SuperMini** | La popular placa C3 del tamaño de un sello        |

**Lenguajes** para ambas familias: Arduino C++, MicroPython, ESP-IDF.

## Misma plataforma, diferente silicio

Todo lo de la [página clásica de ESP32](/docs/es/boards/esp32/) se aplica:
WiFi en `Velxio-GUEST`, el conjunto de periféricos, el flasheo web — pero
el firmware está compilado y se ejecuta en el núcleo correcto: Xtensa LX7
para la S3, RISC-V para la C3. Las diferencias a nivel de instrucciones
se emulan fielmente, por eso un binario para S3 y un binario para C3 del
mismo sketch se comportan exactamente igual que sus contrapartes de hardware.

¿Buscas la **ESP32-C6**, la **XIAO ESP32S3 Sense** (cámara + micrófono +
microSD) o la **XIAO ESP32C6**? Esas son
[placas Pro](/docs/es/boards/pro-boards/).
