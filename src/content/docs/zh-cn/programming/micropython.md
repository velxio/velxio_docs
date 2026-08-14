---
title: MicroPython 快速入门
description: 在 ESP32 和 Pico 开发板上运行真实的 MicroPython 固件——包含 REPL。
sidebar:
  order: 3
---

Velxio 并非模拟 MicroPython——它会在仿真芯片上启动**真实的 MicroPython
固件**。`import machine` 的行为与在真实硬件上一致，并且[串行监视器](/docs/zh-cn/programming/serial-monitor/)
兼作 REPL。

## 一键试用

打开示例库中的夜灯示例——一个光敏电阻（LDR）
控制一个 LED，使用纯 MicroPython 编写：

![MicroPython 夜灯示例](../../../../assets/docs/programming/micropython-editor.png)

注意工具栏：语言选择器显示为 **MicroPython**（MicroPython），文件树中显示的是 `main.py` 而不是草图。按下 **Run**（运行）：

![夜灯运行中——拖动 LDR 并观察 LED](../../../../assets/docs/programming/micropython-running.png)

运行时，点击**光敏电阻**并拖动其光照强度——ADC 读数会随之变化，LED 也会完全按照代码逻辑切换状态。

## 核心要点

```python
from machine import Pin, ADC
import time

led = Pin(4, Pin.OUT)
ldr = ADC(Pin(34))

while True:
    if ldr.read() < 1000:   # dark
        led.on()
    else:
        led.off()
    time.sleep_ms(200)
```

- **`machine.Pin` / `ADC` / `PWM` / `I2C` / `SPI`** — 驱动与 Arduino 草图相同的仿真外设。
- **REPL** — 停止脚本后，可在串行监视器中交互式输入 Python 代码；`help()` 可用，支持 Tab 补全。
- **WiFi** — 在 ESP32 开发板上，`network.WLAN` 可像在真实硬件上一样连接 `Velxio-GUEST`：参见 [ESP32 WiFi](/docs/zh-cn/wifi-iot/esp32-wifi/)。
- **附加模块** — 在 `main.py` 旁边添加纯 Python 文件并导入它们；参见[使用库](/docs/zh-cn/programming/libraries/)。

## 支持的开发板

MicroPython 可用于 Raspberry Pi **Pico / Pico W**（其原生平台）以及整个 **ESP32 系列**——完整支持矩阵见[语言](/docs/zh-cn/programming/languages/)。使用工具栏中的语言选择器可将任何受支持的开发板切换为 MicroPython；Velxio 会自动为您更换文件集。

----- END PAGE -----
