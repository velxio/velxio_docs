---
title: ESP32-S3 e ESP32-C3
description: As famílias mais novas Xtensa S3 e RISC-V C3, incluindo as variantes XIAO e Nano.
sidebar:
  order: 4
---

## ESP32-S3 (Xtensa LX7, dual-core)

| Placa                   | Destaques                                              |
| ----------------------- | ------------------------------------------------------ |
| **ESP32-S3 DevKit**     | A placa S3 de referência — aceleração de IA, bastante RAM |
| **XIAO ESP32-S3**       | O S3 do tamanho de um polegar da Seeed, 11 pinos       |
| **Arduino Nano ESP32**  | S3 no formato clássico Nano, LED RGB                   |

## ESP32-C3 (RISC-V, single-core)

| Placa                   | Destaques                                |
| ----------------------- | ---------------------------------------- |
| **ESP32-C3 DevKit**     | O C3 de referência — pequeno, barato, WiFi+BLE |
| **XIAO ESP32-C3**       | O minúsculo C3 da Seeed                  |
| **ESP32-C3 SuperMini**  | A popular placa C3 do tamanho de um selo  |

**Linguagens** para ambas as famílias: Arduino C++, MicroPython, ESP-IDF.

## Mesma plataforma, silício diferente

Tudo da [página clássica do ESP32](/docs/pt-br/boards/esp32/) se aplica —
WiFi em `Velxio-GUEST`, o conjunto de periféricos, flash via web — mas o firmware
é compilado e executado no núcleo correto: Xtensa LX7 para o S3,
RISC-V para o C3. As diferenças no nível de instruções são fielmente
emuladas, e é por isso que um binário do S3 e um binário do C3 do mesmo esboço
se comportam exatamente como seus equivalentes de hardware.

Procurando pelo **ESP32-C6**, pelo **XIAO ESP32S3 Sense** (câmera + microfone +
microSD) ou pelo **XIAO ESP32C6**? Esses são
[placas Pro](/docs/pt-br/boards/pro-boards/).
