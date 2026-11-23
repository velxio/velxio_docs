---
title: 支持的开发板
description: Velxio 中可仿真的所有开发板，按系列分类。
sidebar:
  order: 1
---

Velxio 可仿真来自八个系列的开发板。部分开发板完全在浏览器中运行；较大的开发板运行在 Velxio 的云端仿真器上。你无需做任何额外操作，按下 Play 即可正常工作。

| 系列                 | 开发板                                                                                                                                                                                              | 语言                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Arduino / AVR        | UNO、Nano、Mega、ATtiny85                                                                                                                                                                           | Arduino C++                                                   |
| ESP32 经典版         | ESP32 DevKit、DevKit-C v4、ESP32-CAM、Lolin32 Lite                                                                                                                                                  | Arduino C++、MicroPython、ESP-IDF                             |
| ESP32-S3             | ESP32-S3、XIAO ESP32-S3、Arduino Nano ESP32                                                                                                                                                         | Arduino C++、MicroPython、ESP-IDF                             |
| ESP32-C3             | ESP32-C3、XIAO ESP32-C3、C3 SuperMini                                                                                                                                                               | Arduino C++、MicroPython、ESP-IDF                             |
| RP2040 / RP2350      | Raspberry Pi Pico、Pico W、Badger 2350 (Pro)                                                                                                                                                        | Arduino C++、MicroPython                                      |
| Seeed XIAO           | ESP32S3 Sense、ESP32C6、RP2040、RP2350、nRF52840 Sense、SAMD21、RA4M1、MG24 Sense、nRF54L15 Sense、IPS Display 系列开发板                                                                           | Arduino C++（ESP32 和 RP2040/RP2350 型号支持 MicroPython）    |
| BBC micro:bit        | micro:bit V2，可单独使用，也可安装在七款 DFRobot 扩展板上：Maqueen Lite 和 Lite V5、micro:Driver、micro:IO-BOX、IO Extender、micro:Mate、Robotics & Power IO Extender（[页面](/docs/zh-cn/boards/microbit/)） | MicroPython                                                   |
| STM32                | Blue Pill、Black Pill、F4 Discovery、Olimex H405、Netduino                                                                                                                                          | Arduino C++                                                   |
| Raspberry Pi (Linux) | Zero、1、2、3、4、5                                                                                                                                                                                 | 完整 Linux 终端上的 Python                                    |

**STM32** 和 **Raspberry Pi (Linux)** 系列运行在 Velxio 的仿真服务器上，需要付费方案；它们在元件选择器中带有 PRO 徽章。其他所有开发板（包括 M5Stack Cardputer 和 Badger 2350 等品牌开发板）均可在免费方案下运行，详见[方案](/docs/zh-cn/getting-started/plans/)。

本节中每款开发板都有独立页面，介绍其引脚定义、支持的语言及特殊注意事项。
