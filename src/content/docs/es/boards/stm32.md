---
title: STM32
description: Blue Pill, Black Pill, F4 Discovery y similares: emulación de ARM Cortex-M.
sidebar:
  order: 6
---

Las placas STM32 clásicas para aficionados, emuladas a nivel de SoC:

| Placa                            | MCU                  | Núcleo         |
| -------------------------------- | -------------------- | -------------- |
| **Blue Pill**                    | STM32F103C8 (64 KB)  | Cortex-M3      |
| **Blue Pill F103CB**             | STM32F103CB (128 KB) | Cortex-M3      |
| **Black Pill**                   | STM32F411CE          | Cortex-M4      |
| **Black Pill F401**              | STM32F401CE          | Cortex-M4      |
| **STM32F4 Discovery**            | STM32F407VG          | Cortex-M4      |
| **Olimex STM32-H405**            | STM32F405RG          | Cortex-M4      |
| **Netduino Plus 2 / Netduino 2** | STM32F405 / F205     | Cortex-M4 / M3 |

**Lenguaje:** Arduino C++ (el núcleo STM32duino).

## Notas

- GPIO, temporizadores, UART y la superficie habitual de la API de Arduino funcionan; los
  ejemplos de ciclo de color RGB y de pantalla en la galería son una buena comprobación de
  lo que se ejercita.
- Los proyectos STM32 se compilan con el núcleo real `stm32` de Arduino, por lo que
  el código a nivel de registros (`HAL_`, acceso directo a periféricos) se compila de la misma
  manera que lo haría en el IDE.
- Elige la variante exacta que tengas: las diferencias de tamaño de flash y de distribución
  de pines entre la F103C8 y la F103CB, o entre la F401 y la F411, están modeladas.

----- END PAGE -----
