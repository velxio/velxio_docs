---
title: STM32
description: Blue Pill, Black Pill, F4 Discovery and friends — ARM Cortex-M emulation.
sidebar:
  order: 6
---

The classic hobbyist STM32 boards, emulated at the SoC level:

| Board                            | MCU                  | Core           |
| -------------------------------- | -------------------- | -------------- |
| **Blue Pill**                    | STM32F103C8 (64 KB)  | Cortex-M3      |
| **Blue Pill F103CB**             | STM32F103CB (128 KB) | Cortex-M3      |
| **Black Pill**                   | STM32F411CE          | Cortex-M4      |
| **Black Pill F401**              | STM32F401CE          | Cortex-M4      |
| **STM32F4 Discovery**            | STM32F407VG          | Cortex-M4      |
| **Olimex STM32-H405**            | STM32F405RG          | Cortex-M4      |
| **Netduino Plus 2 / Netduino 2** | STM32F405 / F205     | Cortex-M4 / M3 |

**Language:** Arduino C++ (the STM32duino core).

## Notes

- GPIO, timers, UART and the usual Arduino API surface work; the RGB
  color-cycle and display examples in the gallery are a good check of
  what's exercised.
- STM32 projects compile with the real `stm32` Arduino core, so
  register-level code (`HAL_`, direct peripheral access) builds the same
  way it would in the IDE.
- Pick the exact variant you own — flash size and pinout differences
  between the F103C8 and F103CB, or F401 and F411, are modeled.
