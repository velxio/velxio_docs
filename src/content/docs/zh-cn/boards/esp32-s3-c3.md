---
title: ESP32-S3 和 ESP32-C3
description: 较新的 Xtensa S3 和 RISC-V C3 系列，包括 XIAO 和 Nano 变体。
sidebar:
  order: 4
---

## ESP32-S3（Xtensa LX7，双核）

| 开发板                 | 亮点                                |
| ---------------------- | ----------------------------------- |
| **ESP32-S3 DevKit**    | 参考 S3 开发板——AI 加速，内存充足   |
| **XIAO ESP32-S3**      | Seeed 的拇指大小 S3，11 个引脚      |
| **Arduino Nano ESP32** | 经典 Nano 外形尺寸的 S3，带 RGB LED |

## ESP32-C3（RISC-V，单核）

| 开发板                 | 亮点                               |
| ---------------------- | ---------------------------------- |
| **ESP32-C3 DevKit**    | 参考 C3——小巧、便宜，支持 WiFi+BLE |
| **XIAO ESP32-C3**      | Seeed 的微型 C3                    |
| **ESP32-C3 SuperMini** | 广受欢迎的邮票大小 C3 开发板       |

**支持的语言**（两个系列）：Arduino C++、MicroPython、ESP-IDF。

## 同一平台，不同芯片

[经典 ESP32 页面](/docs/zh-cn/boards/esp32/)中的所有内容均适用——
`Velxio-GUEST` 上的 WiFi、外设集、网页烧录——但固件
是为正确的内核构建并在其上执行的：S3 使用 Xtensa LX7，
C3 使用 RISC-V。指令级差异被忠实地
模拟，这就是为什么同一程序的 S3 二进制文件和 C3 二进制文件
的行为与真实硬件完全一致。

正在寻找 **ESP32-C6**、**XIAO ESP32S3 Sense**（摄像头 + 麦克风 +
microSD）或 **XIAO ESP32C6**？这些是
[Pro 开发板](/docs/zh-cn/boards/pro-boards/)。
