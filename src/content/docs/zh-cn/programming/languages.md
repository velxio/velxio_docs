---
title: 语言 — Arduino、MicroPython、ESP-IDF
description: 哪种语言运行在哪种开发板上，以及如何切换。
sidebar:
  order: 2
---

工具栏中的**语言选择器**用于切换当前开发板代码的编写和构建方式。切换语言会替换工作区的文件集（例如，`sketch.ino` 变为 `main.py`，依此类推）。

## Arduino C++

几乎所有地方的默认选项：经典的 `setup()` / `loop()` 草图，使用针对目标平台的真实 Arduino 工具链进行编译。使用**Libraries**（库）按钮添加任何已发布的 Arduino 库——参见 [Libraries](/docs/zh-cn/programming/libraries/)。

适用于除 Linux Raspberry Pi 系列之外的所有开发板。

## MicroPython

在模拟芯片上运行真实的 MicroPython 固件——REPL 可通过串行监视器工作，`import machine` 等操作与在硬件上的行为一致。

适用于：

- **Raspberry Pi Pico / Pico W**（RP2040）
- **ESP32 经典版** — DevKit V1、DevKit-C v4、ESP32-CAM、Lolin32 Lite
- **ESP32-S3** — DevKit、XIAO ESP32-S3、Arduino Nano ESP32
- **ESP32-C3** — DevKit、XIAO ESP32-C3、C3 SuperMini

## ESP-IDF

纯 ESP-IDF 项目（`app_main()` 入口点、IDF API，无 Arduino 核心），使用相同的 ESP-IDF 工具链编译。适用于编写你将在生产环境中烧录的代码。

适用于与上述 MicroPython 相同的 ESP32 系列开发板。

## Linux 上的 Python（Raspberry Pi）

Linux Raspberry Pi 开发板（Zero 至 5）不使用语言选择器：它们启动完整的 Linux 系统，你在真实的 shell 中工作——使用 `gpiozero`/`RPi.GPIO` 针对模拟 GPIO 运行 Python，与在实体 Pi 上完全一致。参见[开发板页面](/docs/zh-cn/boards/overview/)。
