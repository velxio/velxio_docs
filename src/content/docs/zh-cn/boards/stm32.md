---
title: STM32
description: Blue Pill、Black Pill、F4 Discovery 及同类开发板 — ARM Cortex-M 仿真。
sidebar:
  badge: PRO
  order: 6
---

经典的爱好者级 STM32 开发板，在 SoC 级别进行仿真：

| 开发板                           | MCU                  | 内核           |
| -------------------------------- | -------------------- | -------------- |
| **Blue Pill**                    | STM32F103C8 (64 KB)  | Cortex-M3      |
| **Blue Pill F103CB**             | STM32F103CB (128 KB) | Cortex-M3      |
| **Black Pill**                   | STM32F411CE          | Cortex-M4      |
| **Black Pill F401**              | STM32F401CE          | Cortex-M4      |
| **STM32F4 Discovery**            | STM32F407VG          | Cortex-M4      |
| **Olimex STM32-H405**            | STM32F405RG          | Cortex-M4      |
| **Netduino Plus 2 / Netduino 2** | STM32F405 / F205     | Cortex-M4 / M3 |

**语言：** Arduino C++（STM32duino 内核）。

## 说明

- GPIO、定时器、UART 以及常用的 Arduino API 接口均可正常工作；图库中的 RGB
  颜色循环和显示示例是检验所支持功能的好方法。
- STM32 项目使用真实的 `stm32` Arduino 内核编译，因此
  寄存器级代码（`HAL_`、直接外设访问）的构建方式与在 IDE 中完全相同。
- 请选择您实际拥有的确切型号——F103C8 与 F103CB、或 F401 与 F411 之间的
  闪存大小和引脚差异均已建模。
