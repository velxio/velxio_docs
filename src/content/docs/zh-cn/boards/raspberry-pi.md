---
title: Raspberry Pi（Linux）
description: 完整的 Linux Raspberry Pi 开发板——从 Zero 到 Pi 5——配备真实的 Shell、GPIO 和 Python。
sidebar:
  order: 7
  badge: PRO
---

Linux Raspberry Pi 系列在云端启动**完整的 Raspberry Pi OS**，并将终端交到您手中——这些不是微控制器仿真，而是完整的计算机。

| 开发板                        | CPU 配置           |
| ----------------------------- | ------------------ |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7 级别 |
| **Raspberry Pi 3**            | Cortex-A53         |
| **Raspberry Pi 4**            | Cortex-A72         |
| **Raspberry Pi 5**            | Cortex-A76         |

所有 Pi 开发板均为 **Pro** 功能——请参阅[套餐](/docs/zh-cn/getting-started/plans/)。

## 工作原理

1. 放置 Pi，按下 **Start**（启动）——WebSocket 控制台约在一秒内连接，然后 Linux 启动（预计 30-60 秒进入 Shell；屏幕上会显示“Booting…”（正在启动…）覆盖层跟踪进度）。
2. 您将进入一个真实的 Shell：`python3`、`pip`、`ls /sys/class/gpio`——一个真正的用户空间。
3. **GPIO 已连接到画布**：使用 `gpiozero` 驱动 LED、读取按钮、与您放置的组件进行 I2C/SPI 通信——协议桥接层将 Linux GPIO 连接到仿真电路。
4. **虚拟文件系统面板**可将您的脚本和文件上传到正在运行的 Pi 中。

```python
from gpiozero import LED
from time import sleep

led = LED(17)
while True:
    led.toggle()
    sleep(0.5)
```

## UNIHIKER M10

DFRobot 的教育型 SBC（一款带有内置触摸屏的 Linux 开发板）运行在相同的基础设施上，同样属于 Pro 开发板——您可以在选择器中 Pi 系列旁边找到它。

----- 页面结束 -----
