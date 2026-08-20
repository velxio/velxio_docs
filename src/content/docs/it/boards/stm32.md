---
title: STM32
description: Blue Pill, Black Pill, F4 Discovery e affini — emulazione ARM Cortex-M.
sidebar:
  badge: PRO
  order: 6
---

Le classiche schede STM32 per hobbisti, emulate a livello di SoC:

| Scheda                           | MCU                  | Core           |
| -------------------------------- | -------------------- | -------------- |
| **Blue Pill**                    | STM32F103C8 (64 KB)  | Cortex-M3      |
| **Blue Pill F103CB**             | STM32F103CB (128 KB) | Cortex-M3      |
| **Black Pill**                   | STM32F411CE          | Cortex-M4      |
| **Black Pill F401**              | STM32F401CE          | Cortex-M4      |
| **STM32F4 Discovery**            | STM32F407VG          | Cortex-M4      |
| **Olimex STM32-H405**            | STM32F405RG          | Cortex-M4      |
| **Netduino Plus 2 / Netduino 2** | STM32F405 / F205     | Cortex-M4 / M3 |

**Linguaggio:** Arduino C++ (il core STM32duino).

## Note

- GPIO, timer, UART e la consueta superficie API di Arduino funzionano; gli
  esempi con ciclo di colori RGB e display nella galleria sono un buon test
  di ciò che viene esercitato.
- I progetti STM32 vengono compilati con il vero core Arduino `stm32`, quindi
  il codice a livello di registro (`HAL_`, accesso diretto alle periferiche)
  viene compilato nello stesso modo in cui avverrebbe nell'IDE.
- Scegli la variante esatta che possiedi — le differenze di dimensione della
  flash e di pinout tra F103C8 e F103CB, o tra F401 e F411, sono modellate.
