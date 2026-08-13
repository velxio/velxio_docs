---
title: WiFi 与物联网概述
description: ESP32 开发板上的模拟 WiFi、MQTT/HTTP 项目，以及从浏览器直接烧录真实硬件。
sidebar:
  order: 1
---

Velxio 中的 ESP32 开发板自带**模拟 WiFi**：您的固件可以看到网络、关联接入、通过 DHCP 获取 IP 地址，并能与互联网通信——在您桌面上运行的同一份代码，在模拟器中同样可以运行。

本部分内容包括：

- **ESP32 WiFi** — 模拟网络的工作原理、支持的芯片，以及 Arduino 和 MicroPython 中的 WiFi 使用。
- **MQTT 和 HTTP** — 将您的模拟开发板连接到真实的代理服务器和 API。
- **Web 烧录** — 当您对项目满意后，无需安装任何工具链，即可通过 USB 直接从浏览器将固件烧录到真实的 ESP32 开发板上。

----- END PAGE -----
