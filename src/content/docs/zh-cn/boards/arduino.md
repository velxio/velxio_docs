---
title: Arduino 与 AVR
description: Arduino UNO、Nano、Mega 2560 以及裸片 ATtiny85。
sidebar:
  order: 2
---

AVR 系列**完全在您的浏览器中运行** — 即时启动，无需云端往返 — 并具备周期精确的 AVR 仿真。

| 开发板                 | MCU                | Flash  | 说明                                                  |
| --------------------- | ------------------ | ------ | ------------------------------------------------------ |
| **Arduino UNO**       | ATmega328P，16 MHz | 32 KB  | 默认的入门开发板；14 个数字 + 6 个模拟引脚 |
| **Arduino Nano**      | ATmega328P，16 MHz | 32 KB  | 与 UNO 相同的芯片，采用面包板友好的条状设计    |
| **Arduino Mega 2560** | ATmega2560，16 MHz | 256 KB | 54 个数字 I/O，4 个 UART — 适用于引脚需求高的项目      |
| **ATtiny85**          | ATtiny85，8 MHz    | 8 KB   | 裸 8 引脚 DIP 芯片，可直接插面包板使用        |

**语言：** Arduino C++。

## 行为与真实硬件一致的细节

- `analogWrite` PWM、定时器、中断（`attachInterrupt`）、EEPROM 以及任意波特率下的 `Serial` 均与硅片上的行为一致。
- ADC 读取模拟电路提供的任何值 — 连接一个电位器分压器，`analogRead` 即可跟踪其变化。
- 经典扩展板级别的元器件（LCD、74HC595、舵机、矩阵键盘）均包含在元件库中，并附有示例。

## 推荐的入门示例

图库中的 **Arduino Uno** 筛选器列出了数十个示例 — 二进制计数器、OLED 显示屏、带 A4988 驱动器的步进电机、电池监测器。请参阅[示例图库](/docs/zh-cn/getting-started/examples-gallery/)。
