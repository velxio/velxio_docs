---
title: STM32
description: Blue Pill, Black Pill, F4 Discovery und weitere – ARM-Cortex-M-Emulation.
sidebar:
  badge: PRO
  order: 6
---

Die klassischen Hobby-STM32-Boards, auf SoC-Ebene emuliert:

| Board                            | MCU                  | Core           |
| -------------------------------- | -------------------- | -------------- |
| **Blue Pill**                    | STM32F103C8 (64 KB)  | Cortex-M3      |
| **Blue Pill F103CB**             | STM32F103CB (128 KB) | Cortex-M3      |
| **Black Pill**                   | STM32F411CE          | Cortex-M4      |
| **Black Pill F401**              | STM32F401CE          | Cortex-M4      |
| **STM32F4 Discovery**            | STM32F407VG          | Cortex-M4      |
| **Olimex STM32-H405**            | STM32F405RG          | Cortex-M4      |
| **Netduino Plus 2 / Netduino 2** | STM32F405 / F205     | Cortex-M4 / M3 |

**Sprache:** Arduino C++ (der STM32duino-Core).

## Hinweise

- GPIO, Timer, UART und die übliche Arduino-API-Oberfläche funktionieren; die
  RGB-Farbzyklus- und Display-Beispiele in der Galerie sind ein guter Test,
  was abgedeckt wird.
- STM32-Projekte werden mit dem echten `stm32`-Arduino-Core kompiliert, sodass
  Code auf Registerebene (`HAL_`, direkter Peripheriezugriff) genauso
  gebaut wird wie in der IDE.
- Wählen Sie die genaue Variante, die Sie besitzen – Flash-Größe und Pinbelegungs-
  unterschiede zwischen F103C8 und F103CB oder F401 und F411 werden modelliert.
