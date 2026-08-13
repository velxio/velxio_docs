---
title: ESP32（经典版）
description: ESP32 DevKit V1、DevKit-C V4、ESP32-CAM 和 Wemos Lolin32 Lite。
sidebar:
  order: 3
---

原始的双核 Xtensa ESP32——目录中的主力产品，模拟器中提供**WiFi 和蓝牙**功能。

| 开发板                  | 亮点                                        |
| ---------------------- | ------------------------------------------------- |
| **ESP32 DevKit V1**    | 标准 30 引脚开发套件；GPIO2 上内置 LED |
| **ESP32 DevKit-C V4**  | 乐鑫官方开发套件，38 个 GPIO                |
| **ESP32-CAM**          | ESP32 + 200 万像素摄像头模块 + microSD 卡槽         |
| **Wemos Lolin32 Lite** | 紧凑型，带锂聚合物充电器封装                   |

**语言：** Arduino C++、MicroPython、ESP-IDF——通过工具栏的[语言选择器](/docs/zh-cn/programming/languages/)切换。

## 支持的功能

- **WiFi**：连接 `Velxio-GUEST` 并访问真实互联网——参见 [ESP32 WiFi](/docs/zh-cn/wifi-iot/esp32-wifi/)。
- **外设**：GPIO、PWM（LEDC）、ADC、I2C、SPI、UART，以及定时器/中断机制——您的固件会以真实的 ROM 日志启动。
- **ESP32-CAM** 在模拟器的组件面板中暴露其摄像头和 microSD。
- **Web 烧录**：通过 USB 将相同的二进制文件推送到物理 ESP32——[方法](/docs/zh-cn/wifi-iot/web-flash/)。

## 注意事项

- 会话中首次 ESP-IDF/Arduino 编译较慢；后续构建会缓存。
- 内置的闪烁示例（[您的第一个项目](/docs/zh-cn/getting-started/first-project/)）以 DevKit V1 为目标。
