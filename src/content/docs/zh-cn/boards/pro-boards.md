---
title: 专业开发板
description: 高级开发板目录 — M5Stack、Badger 2350、XIAO Sense、ESP32-C6、Galactic Unicorn、UNIHIKER。
sidebar:
  order: 8
  badge: PRO
---

专业开发板是目录中的高级层级：品牌硬件，内置丰富外设，并经过深度仿真，能够启动其**出厂固件**。它们是 velxio.dev 上托管目录的一部分。

:::note[它们需要哪种套餐？]
**只有 UNIHIKER M10 需要付费套餐。** 本页上的所有其他开发板 — M5Stack、Pimoroni、XIAO 和 ESP32-C6 DevKit — **均可使用免费套餐运行**。仅限付费的开发板正是 STM32 系列和 Raspberry Pi Linux 系列（UNIHIKER 属于后者）。请参阅[套餐](/docs/zh-cn/getting-started/plans/)。
:::

## M5Stack

*免费套餐。*

### M5 Cardputer ADV

![M5 Cardputer ADV 在 Velxio 画布上](../../../../assets/docs/boards/cardputer-adv.png)

带键盘和 TFT 屏幕的 ESP32-S3 口袋电脑。可启动真实的 M5 启动器固件；在屏幕键盘上输入，运行应用程序，使用扬声器。

### M5Stack Core

![M5Stack Core 在 Velxio 画布上](../../../../assets/docs/boards/m5stack-core.png)

经典的模块化 ESP32，配备 320x240 TFT 屏幕和三个按钮。

## Pimoroni

*免费套餐。*

### Badger 2350

![Pimoroni Badger 2350 在 Velxio 画布上](../../../../assets/docs/boards/badger-2350.png)

RP2350 电子墨水徽章。它可启动完整的 **BadgeOS 出厂固件**：使用 A/B/C/UP/DOWN 按钮浏览启动器，打开时钟、徽章和图库应用，并观看电子墨水屏以真实的方式刷新。

### Galactic Unicorn

![Pimoroni Galactic Unicorn 在 Velxio 画布上](../../../../assets/docs/boards/galactic-unicorn.png)

由板载 Pico 2 W (RP2350) 驱动的 53x11 RGB LED 矩阵（583 像素），带有 A/B/C/D 和音量/亮度按钮。

### Pico Plus 2 W

![Pimoroni Pico Plus 2 W 在 Velxio 画布上](../../../../assets/docs/boards/pimoroni-pico-plus-2w.png)

Pimoroni 的 RP2350B 开发板，采用标准 Pico 外形（GP0..GP28 加电源），因此任何 Pico 接线都可以直接使用。GPIO、UART、USB 串口、I2C 和 SPI 均可运行；CYW43 WiFi 协处理器和 PSRAM 未被仿真。

## Seeed Studio XIAO

*免费套餐。*

### XIAO ESP32S3 Sense

![XIAO ESP32S3 Sense 在 Velxio 画布上](../../../../assets/docs/boards/xiao-esp32s3-sense.png)

带有摄像头模块、PDM 麦克风和 microSD 卡的 S3。

### XIAO ESP32C6

![XIAO ESP32C6 在 Velxio 画布上](../../../../assets/docs/boards/xiao-esp32c6.png)

支持 WiFi 6 的 RISC-V C6，采用 XIAO 外形。

### XIAO RP2040

![XIAO RP2040 在 Velxio 画布上](../../../../assets/docs/boards/xiao-rp2040.png)

带有 NeoPixel 的 RP2040 XIAO。

## Espressif ESP32-C6

*免费套餐。*

![ESP32-C6 DevKit 在 Velxio 画布上](../../../../assets/docs/boards/esp32-c6.png)

**ESP32-C6 DevKit** — RISC-V WiFi-6 芯片，与 ESP32 系列其他产品一样支持三种语言（Arduino / MicroPython / ESP-IDF）。

## DFRobot UNIHIKER M10

*需要付费套餐。*

![DFRobot UNIHIKER M10 在 Velxio 画布上](../../../../assets/docs/boards/unihiker-m10.png)

带有内置触摸屏的 Linux 单板计算机 — 与 [Raspberry Pi 系列](/docs/zh-cn/boards/raspberry-pi/) 一起记录，因为它共享完整的 Linux 工作流程。与该系列的其他产品一样，它是本页上唯一**需要付费套餐**才能运行的开发板。

---

专业开发板会出现在[组件选择器](/docs/zh-cn/circuit-editor/placing-components/)中，并带有 **PRO 徽章**；[入门模板](/docs/zh-cn/getting-started/projects/)包含每个开发板的即用项目。

## 开发板外观和引脚图

每块开发板的画布外观和完整引脚图，均由仿真器生成：

[Badger 2350](/docs/zh-cn/boards/reference/badger-2350/) ·
[Galactic Unicorn](/docs/zh-cn/boards/reference/galactic-unicorn/) ·
[Pico Plus 2 W](/docs/zh-cn/boards/reference/pimoroni-pico-plus-2w/) ·
[M5 Cardputer ADV](/docs/zh-cn/boards/reference/cardputer-adv/) ·
[M5Stack Core](/docs/zh-cn/boards/reference/m5stack-core/) ·
[ESP32-C6 DevKit](/docs/zh-cn/boards/reference/esp32-c6/) ·
[XIAO ESP32S3 Sense](/docs/zh-cn/boards/reference/xiao-esp32s3-sense/) ·
[XIAO ESP32C6](/docs/zh-cn/boards/reference/xiao-esp32c6/) ·
[XIAO RP2040](/docs/zh-cn/boards/reference/xiao-rp2040/) ·
[UNIHIKER M10](/docs/zh-cn/boards/reference/unihiker-m10/)
