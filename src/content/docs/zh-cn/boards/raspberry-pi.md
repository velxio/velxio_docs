---
title: 树莓派（Linux）
description: 从 Zero 到 Pi 5 的树莓派开发板。用 Python 针对画布上的电路运行，默认在浏览器中运行，也可在 Velxio 服务器上的 Linux 客户机中运行，并逐部件说明每种方式下哪些功能可用。
sidebar:
  order: 7
  badge: PRO
---

树莓派系列可以**用 Python 脚本针对画布上的电路运行**。与微控制器开发板不同，这里没有需要编译的内容：你编写脚本，按下 **Run**（运行），Velxio 会选择两种引擎之一来执行它。两种引擎都不是 Raspberry Pi OS 桌面环境，因此在假设为真实硬件编写的教程能原样运行之前，请先阅读本页。大多数教程确实可以运行：下表中的内容是在 2026-09-19 针对线上产品逐部件实测得出的。

| 开发板                        | CPU 配置            |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7 级别  |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

任何人都可以在画布上放置一块 Pi 并围绕它连接电路。**运行**它需要付费方案，或者使用每个已登录账户在 Pi 系列上获得的**三次 15 分钟免费试用会话**之一（参见[方案](/docs/zh-cn/getting-started/plans/)）。如果项目中没有 Pi 能运行的内容，例如在 Pi 开发板上运行 Arduino `.ino` 草图，系统会在消耗试用会话之前告知你。

![Velxio 画布上的 Raspberry Pi 5](../../../../assets/docs/boards/raspberry-pi-5.png)

## 两种引擎

### 即时引擎（在你的浏览器中）

默认选项。你的脚本在标签页内一个编译为 WebAssembly 的 Python 解释器上运行，几秒钟即可启动，不需要 Velxio 服务器的任何支持。引脚写入直接到达画布，因此 `led.on()` 一执行 LED 就会亮起。I2C、SPI 和 1-Wire 以 Pi 所拥有的设备文件形式存在（`/dev/i2c-1`、`/dev/spidev0.0`、`/sys/bus/w1/devices` 目录树），由画布上连接的部件来响应，因此真实的 `smbus2`、`w1thermsensor` 和 Adafruit Blinka 可以不加修改地运行。

它是一个普通的解释器，不是操作系统：没有 shell，没有 `subprocess`，没有原始套接字。如果脚本请求其中任何一项，它会被转交给 Linux 引擎；工具栏中的**引擎标签**会显示将由哪个引擎运行，当是 Linux 时，还会显示请求它的文件和行号。

### Linux（在 Velxio 的服务器上）

一个在 QEMU 中启动的真实 Linux 客户机（`-M virt`，使用你开发板的 CPU 配置），你可以通过工作区中的串口控制台访问它。请准确理解它是什么：

- **Alpine Linux**，不是 Raspberry Pi OS。已安装 `python3` 和 `pip`；没有 `apt`、`raspi-config`、桌面环境和 Pi 固件工具。
- 客户机内部**没有网络**，这是有意为之。`pip install` 无法访问 PyPI；软件包通过 `requirements.txt`（见下文）提供。
- **排针总线是真实的设备文件。** `/dev/i2c-1`、`/dev/spidev0.0` 和 `/dev/spidev0.1` 响应与 Pi 上相同的系统调用，因此自行打开它们的库（Adafruit Blinka）、C 程序或你自己的 `ioctl` 代码都能与画布上的部件通信。无人持有的地址会像在硬件上一样失败，报错为 `OSError: [Errno 121] Remote I/O error`。
- **排针 UART 是真实的串口。** `/dev/serial0`（以及 `/dev/ttyAMA0` 和 `/dev/ttyS0`）是由未经修改的 pyserial 驱动的真正 tty：`serial.tools.list_ports`、端口上的 `select()` 和 `cat /dev/serial0` 都能工作，字节会发送到画布上连接到 GPIO14 和 GPIO15 的任何设备。
- **没有** `/dev/gpiomem`、`/dev/gpiochip0`、`/sys/class/gpio` 或 1-Wire 目录树。GPIO 通过 `RPi.GPIO` 和 `gpiozero` 进行，它们都已提供；`libgpiod`、`gpioinfo` 和 `pigpio` 没有可通信的对象。
- 启动大约需要 20 到 30 秒，服务器繁忙时更长；一个"Booting"（启动中）覆盖层会跟踪进度。客户机会话最迟在 **2 小时**后结束。
- 客户机启动时会运行你项目中的 **`script.py`**。在 Linux 模式下请将主文件命名为该名称（即时引擎会运行它找到的第一个 `.py` 文件）。

当你需要 shell 时，工作区中的 **Linux terminal**（Linux 终端）按钮会在本次会话剩余时间内固定使用此引擎，例如检查文件或手动运行脚本。该选择不会随项目保存：明天重新打开它，Run 会回到检测器的判断结果。即时引擎能运行的一切，不用它都会更快。

## 逐部件说明哪些功能可用

每一行都是一个按照 Pi 教程方式编写的脚本，在 Raspberry Pi 4 上通过线上产品运行，部件连接在画布上。显示相关的行是在画布本身上检查的：面板必须亮起，而不仅仅是脚本执行完毕。

| 内容 | 脚本使用的库 | 即时引擎 | Linux |
| --- | --- | --- | --- |
| LED 和按钮 | `gpiozero` | 是 | 是 |
| 舵机（PWM） | `gpiozero.Servo` | 是 | 是 |
| MPU6050 加速度计 | `smbus2` | 是 | 是 |
| DS3231 实时时钟 | `smbus2` | 是 | 是 |
| BMP280 气压传感器 | `smbus2` | 是 | 是 |
| SHT31 温度和湿度 | `smbus2` | 是 | 是 |
| PCA9685 16 通道 PWM 驱动器 | `smbus2` | 是 | 是 |
| ADS1115 ADC | `smbus2` | 是 | 是 |
| 16x2 LCD，I2C 背板 | `smbus2` 或 `RPLCD.i2c` | 是 | 是 |
| 16x2 LCD，并行（RS、E、D4 到 D7） | `RPLCD.gpio` | 是 | 是 |
| SSD1306 OLED | `smbus2` | 是 | 是 |
| SSD1306 OLED | `luma.oled` | 是 | 是 |
| SSD1306 OLED | Adafruit Blinka + `adafruit_ssd1306` | 是 | 是 |
| ILI9341 TFT | `spidev` | 是 | 是 |
| microSD 卡（SPI 模式） | `spidev` | 是 | 是 |
| DS18B20 温度探头 | 1-Wire sysfs、`w1thermsensor` | 是 | **否** |
| 电位器直接接在 GPIO 上 | | 否（见下文） | 否 |

OLED 和 LCD 相关的行也在 Linux 引擎中的 Raspberry Pi Zero 上运行过，那是一个拥有自己镜像的 32 位客户机。

## 哪些功能不可用

- **GPIO 上的模拟输入。** 树莓派**没有 ADC**，在真实硬件上也是如此。电位器、LDR 或脉冲传感器直接连接到 GPIO 只会读到高电平或低电平，运行控制台会说明这一点。请在传感器和 Pi 之间放置一个 **ADS1115**（I2C）或 **MCP3008**（SPI），就像你在实验台上会做的那样；两者都在目录中，图库中有一个带电位器的 MCP3008 示例。
- **Linux 引擎中的 1-Wire。** 客户机内核不支持 1-Wire，因此 DS18B20 脚本在那里找不到 `/sys/bus/w1/devices`。它在即时引擎中可以工作，而只导入 `w1thermsensor` 的脚本本来就会在那里运行。
- **Linux 引擎中的摄像头。** `picamera2` 在即时引擎中可以工作，由你的网络摄像头或测试图案提供输入；客户机没有摄像头。
- **`pigpio`、`libgpiod` / `gpiod`、`/dev/gpiomem`。** 两种引擎中都没有守护进程，也没有 GPIO 字符设备。请使用 `RPi.GPIO` 或 `gpiozero`。
- **从 MicroPython 教程复制的脚本。** `import machine`、`from gpio_lcd import GpioLcd` 之类存在于 Pico 或 ESP32 上，而不存在于运行完整 Python 的开发板上。控制台会指出 Pi 的等效方案（`gpiozero`、`RPLCD`、`luma.oled`、`w1thermsensor`），而不是建议安装某个软件包。
- **PyTorch、TensorFlow。** 体积达数 GB，而且这里没有任何东西可以加速它们。它们会被拒绝并附上该说明。

## 每种引擎中的 Python 模块

两种引擎都附带标准库。"预装"意味着仅凭 `import` 语句即可工作，无需 `requirements.txt`，就像 Raspberry Pi OS 在镜像中自带其硬件库一样。

| 模块 | 即时引擎（浏览器） | Linux（客户机） |
| --- | --- | --- |
| `RPi.GPIO` | 预装 | 预装 |
| `gpiozero` | 预装 | 预装（2.0.1） |
| `smbus2` / `smbus` | 预装（真实库） | 预装 |
| `spidev` | 预装 | 预装 |
| `serial`（pyserial） | 仅 Pi UART 路径 | 真实 tty 上的真实 pyserial 3.5 |
| `w1thermsensor` | 预装 | 不可用（无 1-Wire） |
| `luma.core`、`luma.oled`、`luma.lcd` | 预装 | 预装 |
| `RPLCD` | 预装 | 预装 |
| `ST7789` | 预装 | 预装 |
| `board`、`busio`、`digitalio`（Adafruit Blinka） | 预装 | 预装 |
| `adafruit_ssd1306`、`adafruit_rgb_display` | 预装 | 预装 |
| `PIL`（Pillow）、`numpy` | 预装 | 预装（Pillow 10.3、numpy 1.25） |
| `cv2`（OpenCV） | 是 | 否（客户机无构建版本） |
| `picamera2` | 是，通过你的网络摄像头 | 否 |
| `velxio_screen` | 是 | 是 |
| `requests` / `urllib` | 是，通过 Velxio 带允许列表的出站代理 | 无网络 |
| 其他任何内容 | 通过 `requirements.txt` | 通过 `requirements.txt` |

DejaVu 字体位于客户机中 Raspberry Pi OS 使用的路径下（`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`），因为显示相关的教程会硬编码该路径。

```python
from luma.core.interface.serial import i2c
from luma.core.render import canvas
from luma.oled.device import ssd1306

import time

device = ssd1306(i2c(port=1, address=0x3C))
with canvas(device) as draw:
    draw.text((10, 20), "Hello from a Pi", fill="white")

# luma clears the panel when the script ends, as it does on hardware,
# so keep the script alive for as long as the text should stay up.
while True:
    time.sleep(1)
```

### 其他第三方软件包需要 `requirements.txt`

在你的脚本旁边添加一个 `requirements.txt` 文件，每行一个软件包；Velxio 会在运行前解析它，并在运行控制台中告诉你它安装了什么。当脚本导入一个缺失的软件包时，控制台会提供要添加的行，并有一个按钮为你写入。哪个引擎能接受某个软件包取决于它的构建方式：

- 纯 Python 软件包（`py3-none-any` wheel）在两种引擎中都能运行。
- 含编译代码的软件包，当浏览器运行时附带它时（其中包括 numpy、pillow、opencv-python、scikit-learn 等）可在**即时**引擎中运行，而只有在 PyPI 有对应的 **musl aarch64** wheel 时才能在 **Linux** 引擎中运行（numpy、pandas、scipy 和 psutil 有）。只发布 glibc `manylinux` wheel 的软件包无法在客户机中安装。
- 在 Raspberry Pi Zero、1 或 2 上，客户机是 32 位的，而 PyPI 几乎没有为其提供的编译 wheel：在那里，请坚持使用预装的内容或纯 Python 软件包。
- 客户机已提供的名称（`RPi.GPIO`、`smbus2`、`spidev`、`pyserial`、`gpiozero`）永远不会被下载，因此教程中列出它们的 `requirements.txt` 不会造成任何损害。

Wheel 与 Arduino 库计入相同的存储配额。

## 文件

Pi 工作区中的**文件面板**可将脚本和数据文件上传到项目中；在 Linux 模式下，它们会在 `script.py` 启动之前被复制到客户机的主目录中。

## UNIHIKER M10

DFRobot 的教育单板计算机（一块带内置触摸屏的 Linux 开发板）在相同的两种引擎上运行，用它自己的 `pinpong` 和 `unihiker` 模块代替 Pi 的兼容层。它是一块付费开发板，有自己独立的三次试用会话；可在 Pi 系列旁边的选择器中找到它。

## 开发板图形和引脚定义

每块开发板的画布图形和完整引脚图，由模拟器生成：

[Raspberry Pi 3（图形也适用于 Zero/1/2）](/docs/zh-cn/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/zh-cn/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/zh-cn/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/zh-cn/boards/reference/unihiker-m10/)
