---
title: Raspberry Pi Pico 与 Pico W
description: RP2040 开发板——支持 MicroPython 和 Arduino 的浏览器内仿真。
sidebar:
  order: 5
---

RP2040 开发板**在您的浏览器中**运行，提供忠实的双核
Cortex-M0+ 仿真。

| 开发板                    | 亮点                                    |
| ------------------------- | --------------------------------------- |
| **Raspberry Pi Pico**     | 标准 RP2040 开发板，26 个 GPIO          |
| **Raspberry Pi Pico W**   | 同款开发板，带 WiFi 模块焊盘            |

**支持语言：** MicroPython（Pico 的原生环境）和 Arduino C++
（earlephilhower 内核）。

![Velxio 画布上的 Raspberry Pi Pico W](../../../../assets/docs/boards/pi-pico-w.png)

## 支持的功能

- GPIO、PWM、ADC、I2C、SPI、UART——以及 **PIO**，RP2040 标志性的
  可编程 I/O 模块，NeoPixel 和特殊协议示例均依赖于此。
- 通过[串口监视器](/docs/zh-cn/programming/serial-monitor/)使用 MicroPython 的 REPL。
- 从浏览器烧录真实 Pico：开发板进入 BOOTSEL 模式，
  对话框通过 WebUSB 写入 `.uf2` 文件，或者您可以下载文件并
  将其拖放到驱动器上。请参阅[网页烧录](/docs/zh-cn/wifi-iot/web-flash/)。

## RP2350 在哪里？

**Badger 2350**（Pimoroni 的 RP2350 电子纸徽章）是一款
[Pro 开发板](/docs/zh-cn/boards/pro-boards/)——它启动完整的 BadgeOS
出厂固件，包括电子纸显示等全部功能。

## 开发板外观与引脚定义

每块开发板的画布外观和完整引脚图，均由仿真器生成：

[Raspberry Pi Pico](/docs/zh-cn/boards/reference/raspberry-pi-pico/) ·
[Raspberry Pi Pico W](/docs/zh-cn/boards/reference/pi-pico-w/)
----- END PAGE -----
