---
title: STM32
description: Blue Pill, Black Pill, F4 Discovery и другие — эмуляция ARM Cortex-M.
sidebar:
  order: 6
---

Классические платы STM32 для любителей, эмулируемые на уровне SoC:

| Плата                            | МК                   | Ядро           |
| -------------------------------- | -------------------- | -------------- |
| **Blue Pill**                    | STM32F103C8 (64 КБ)  | Cortex-M3      |
| **Blue Pill F103CB**             | STM32F103CB (128 КБ) | Cortex-M3      |
| **Black Pill**                   | STM32F411CE          | Cortex-M4      |
| **Black Pill F401**              | STM32F401CE          | Cortex-M4      |
| **STM32F4 Discovery**            | STM32F407VG          | Cortex-M4      |
| **Olimex STM32-H405**            | STM32F405RG          | Cortex-M4      |
| **Netduino Plus 2 / Netduino 2** | STM32F405 / F205     | Cortex-M4 / M3 |

**Язык:** Arduino C++ (ядро STM32duino).

## Примечания

- GPIO, таймеры, UART и обычный API Arduino работают; примеры с цветовым
  циклом RGB и дисплеем в галерее — хороший способ проверить,
  что задействовано.
- Проекты STM32 компилируются с настоящим ядром Arduino `stm32`, поэтому
  код на уровне регистров (`HAL_`, прямой доступ к периферии)
  собирается так же, как в IDE.
- Выбирайте точный вариант вашей платы — различия в размере флеш-памяти
  и назначении выводов между F103C8 и F103CB, или F401 и F411, учтены.

----- END PAGE -----
