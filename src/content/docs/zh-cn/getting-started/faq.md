---
title: 常见问题
description: 关于 Velxio 的常见问题。
sidebar:
  order: 8
---

### 我需要安装任何东西吗？

不需要。Velxio 完全在浏览器中运行——包括编辑器、编译器（云端）和仿真。在桌面端使用最新版的 Chrome、Edge 或 Firefox 可获得最佳体验。

### 它真的在运行我的代码吗？

是的。您的草图由真实开发板所使用的相同工具链（arduino-cli、ESP-IDF、MicroPython）编译，生成的**真实二进制文件**由模拟 CPU 执行——而不是对源代码的逐行解释。启动日志、时序特性、寄存器行为：您所看到的就是真实芯片会表现出的行为。

### Velxio 是免费的吗？

核心仿真器是免费的，包括开放的开发板目录和示例库。专业开发板、AI 助手和私有项目需要付费计划——请参阅[计划](/docs/zh-cn/getting-started/plans/)。

### 我可以导入我的 Wokwi 项目吗？

可以——**打开项目**按钮接受 Wokwi 的 `.zip` 压缩包以及 Velxio 自己的 `.vlx` 文件。请参阅[保存和打开项目](/docs/zh-cn/getting-started/projects/)。

### 支持哪些开发板？

Arduino UNO/Nano/Mega、ESP32 系列（经典版、S3、C3）、Raspberry Pi Pico 和 Pico W、STM32、完整版 Linux Raspberry Pi、ATtiny85 等——完整列表及详细信息请参阅[开发板](/docs/zh-cn/boards/overview/)。

### WiFi 在仿真器中能工作吗？

在 ESP32 开发板上，可以——模拟的站点会关联网络，通过 DHCP 获取 IP，并且可以访问互联网网关以用于 MQTT/HTTP 项目。请参阅[WiFi 与 IoT](/docs/zh-cn/wifi-iot/overview/)。

### 我可以将我的项目烧录到真实硬件上吗？

可以。对于 ESP32 项目，**Web 烧录**可以直接从浏览器通过 USB 将编译后的固件写入真实开发板。请参阅[Web 烧录](/docs/zh-cn/wifi-iot/overview/)。

### 我应该在哪里报告错误或请求新功能？

可以通过编辑器中的**帮助**菜单、Velxio [Discord 社区](https://velxio.dev)或 GitHub 组织——选择您喜欢的方式即可。
