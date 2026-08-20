---
title: STM32
description: Blue Pill, Black Pill, F4 Discovery et autres — émulation ARM Cortex-M.
sidebar:
  badge: PRO
  order: 6
---

Les cartes STM32 classiques pour amateurs, émulées au niveau du SoC :

| Carte                            | MCU                  | Cœur           |
| -------------------------------- | -------------------- | -------------- |
| **Blue Pill**                    | STM32F103C8 (64 Ko)  | Cortex-M3      |
| **Blue Pill F103CB**             | STM32F103CB (128 Ko) | Cortex-M3      |
| **Black Pill**                   | STM32F411CE          | Cortex-M4      |
| **Black Pill F401**              | STM32F401CE          | Cortex-M4      |
| **STM32F4 Discovery**            | STM32F407VG          | Cortex-M4      |
| **Olimex STM32-H405**            | STM32F405RG          | Cortex-M4      |
| **Netduino Plus 2 / Netduino 2** | STM32F405 / F205     | Cortex-M4 / M3 |

**Langage :** Arduino C++ (le cœur STM32duino).

## Remarques

- Les GPIO, les temporisateurs, l'UART et la surface habituelle de l'API Arduino fonctionnent ; les exemples de cycle de couleurs RVB et d'affichage de la galerie constituent un bon test de ce qui est exercé.
- Les projets STM32 compilent avec le cœur Arduino `stm32` réel, donc le code au niveau des registres (`HAL_`, accès direct aux périphériques) se construit de la même manière que dans l'IDE.
- Choisissez la variante exacte que vous possédez — les différences de taille de flash et de brochage entre les F103C8 et F103CB, ou F401 et F411, sont modélisées.
