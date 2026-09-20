---
title: 树莓派（Linux）
description: 从 Zero 到 Pi 5 的树莓派开发板。Python 脚本直接控制画布上的电路，默认在浏览器中运行，也可在 Velxio 服务器上的 Linux 客户机中运行，并逐部件说明每种方式下可用的功能。
sidebar:
  order: 7
  badge: PRO
---

树莓派系列可以**让 Python 脚本直接控制画布上的电路**。与微控制器开发板不同，这里无需编译：你编写脚本，按下 **Run**（运行），Velxio 会选择两种引擎之一来执行它。两种引擎都不是 Raspberry Pi OS 桌面环境，因此在假定为真实硬件编写的教程能原样运行之前，请先阅读本页。大多数教程确实可以运行：下表中的内容是在 2026-09-19 针对线上产品逐部件实测得出的。

| 开发板                        | CPU 配置            |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7 级别  |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

任何人都可以在画布上放置一块 Pi 并围绕它连接电路。**运行**它需要付费方案，或者使用每个已登录账户在 Pi 系列上获得的**三次 15 分钟免费试用会话**之一（参见[方案](/docs/zh-cn/getting-started/plans/)）。如果项目中没有 Pi 能运行的内容，例如在 Pi 开发板上运行 Arduino `.ino` 草图，系统会在消耗试用会话之前告知你。

![Velxio 画布上的 Raspberry Pi 5](../../../../assets/docs/boards/raspberry-pi-5.png)

## 两种引擎

### 即时引擎（在浏览器中）

默认选项。你的脚本在标签页内一个编译为 WebAssembly 的 Python 解释器上运行，几秒钟即可启动，无需 Velxio 服务器的任何支持。引脚写入直接作用于画布，因此 `led.on()` 一执行 LED 就会亮起。I2C、SPI 和 1-Wire 以 Pi 所拥有的设备文件形式存在（`/dev/i2c-1`、`/dev/spidev0.0`、`/sys/bus/w1/devices` 目录树），由画布上连接的部件响应，因此真实的 `smbus2`、`w1thermsensor` 和 Adafruit Blinka 可以不加修改地运行。

它是一个纯解释器，不是操作系统：没有 shell，没有 `subprocess`，没有原始套接字。如果脚本请求其中任何一项，它会被转交给 Linux 引擎；工具栏中的**引擎标签**会显示将由哪个引擎运行，当使用 Linux 时，还会显示请求它的文件和行号。

### Linux 引擎（在 Velxio 服务器上）

一个在 QEMU 中启动的真实 Linux 客户机（`-M virt`，使用你开发板的 CPU 配置），你可以通过工作区中的串口控制台访问它。请准确理解它是什么：

- **Alpine Linux**，不是 Raspberry Pi OS。已安装 `python3` 和 `pip`；没有 `apt`、`raspi-config`、桌面环境和 Pi 固件工具。
- 客户机内部**没有网络**，这是有意为之。`pip install` 无法访问 PyPI；软件包通过 `requirements.txt`（见下文）提供。
- **排针总线是真实的设备文件。** `/dev/i2c-1`、`/dev/spidev0.0` 和 `/dev/spidev0.1` 响应与 Pi 上相同的系统调用，因此自行打开它们的库（Adafruit Blinka）、C 程序或你自己的 `ioctl` 代码都能与画布上的部件通信。访问无人持有的地址会像在硬件上一样失败，报错为 `OSError: [Errno 121] Remote I/O error`。
- **排针 UART 是真实的串口。** `/dev/serial0`（以及 `/dev/ttyAMA0` 和 `/dev/ttyS0`）是由未经修改的 pyserial 驱动的真正 tty：`serial.tools.list_ports`、对端口使用 `select()` 以及 `cat /dev/serial0` 都能工作，字节会发送到画布上连接到 GPIO14 和 GPIO15 的任何设备。
- **1-Wire 以 Pi 所拥有的 sysfs 目录树形式存在。** GPIO4 上的 DS18B20 会出现在 `/sys/bus/w1/devices/28-*/` 下，带有 `w1_slave` 和 `temperature`，因此 `cat`、`w1thermsensor` 风格的读取器以及你自己的代码都能工作（在项目的 `config.txt` 中设置 `dtoverlay=w1-gpio,gpiopin=N` 可以更改引脚）。
- **`libcamera-jpeg`、`rpicam-jpeg`、`rpicam-still`** 可以从画布上的摄像头部件拍摄静态照片，就像脚本通过 `subprocess` 调用它们一样。在此引擎中，图像是该部件的**测试图案**：客户机运行在 Velxio 的服务器上，你网络摄像头的像素永远不会离开你的浏览器。
- **没有** `/dev/gpiomem`、`/dev/gpiochip0` 或 `/sys/class/gpio`。GPIO 通过 `RPi.GPIO` 和 `gpiozero` 进行，它们都已提供；`libgpiod`、`gpioinfo` 和 `pigpio` 没有可通信的对象。
- 启动大约需要 20 到 30 秒，服务器繁忙时会更长；"Booting" 覆盖层会跟踪进度。客户机会话最迟在 **2 小时**后结束。
- 客户机启动时会运行你项目中的 **`script.py`**。在 Linux 模式下请将主文件命名为该名称（即时引擎会运行它找到的第一个 `.py` 文件）。

当你需要 shell 时，工作区中的 **Linux terminal**（Linux 终端）按钮会在本次会话剩余时间内固定使用此引擎，例如检查文件或手动运行脚本。该选择不会随项目保存：明天重新打开时，Run 会回到检测器的判断结果。即时引擎能运行的一切，不用它都会更快。

## 逐部件说明哪些功能可用

每一行都是一个按照 Pi 教程方式编写的脚本，在 Raspberry Pi 4 上通过线上产品运行，部件连接在画布上。显示类行是在画布本身上检查的：面板必须亮起，而不仅仅是脚本执行完毕。

| 功能 | 脚本使用的库 | 即时引擎 | Linux |
| --- | --- | --- | --- |
| LED 和按钮 | `gpiozero` | 是 | 是 |
| 舵机（PWM） | `gpiozero.Servo` | 是 | 是 |
| MPU6050 加速度计 | `smbus2` | 是 | 是 |
| DS3231 实时时钟 | `smbus2` | 是 | 是 |
| BMP280 气压传感器 | `smbus2` | 是 | 是 |
| SHT31 温湿度传感器 | `smbus2` | 是 | 是 |
| PCA9685 16 通道 PWM 驱动器 | `smbus2` | 是 | 是 |
| ADS1115 ADC | `smbus2` | 是 | 是 |
| 16x2 LCD，I2C 背板 | `smbus2` 或 `RPLCD.i2c` | 是 | 是 |
| 16x2 LCD，并行（RS、E、D4 到 D7） | `RPLCD.gpio` | 是 | 是 |
| SSD1306 OLED | `smbus2` | 是 | 是 |
| SSD1306 OLED | `luma.oled` | 是 | 是 |
| SSD1306 OLED | Adafruit Blinka + `adafruit_ssd1306` | 是 | 是 |
| ILI9341 TFT | `spidev` | 是 | 是 |
| microSD 卡（SPI 模式） | `spidev` | 是 | 是 |
| DS18B20 温度探头 | 1-Wire sysfs、`w1thermsensor` | 是 | 是 |
| 排针 UART 上的 GPS 模块 | `/dev/serial0` 上的 `pyserial` | 是 | 是 |
| 7.5 英寸电子纸（UC8179） | `spidev` + `RPi.GPIO`，Waveshare 风格驱动 | 是 | 是 |
| 电位器直接接 GPIO | | 否（见下文） | 否 |

OLED 和 LCD 行也在 Linux 引擎中的 Raspberry Pi Zero 上运行过，那是一个使用独立镜像的 32 位客户机。

## 哪些功能不可用

- **GPIO 上的模拟输入。** 树莓派**没有 ADC**，真实硬件上也是如此。电位器、光敏电阻或脉搏传感器直接连接到 GPIO 只能读到高电平或低电平，运行控制台会说明这一点。请在传感器和 Pi 之间加一个 **ADS1115**（I2C）或 **MCP3008**（SPI），就像在实验台上一样；两者都在目录中，示例库中有一个带电位器的 MCP3008 示例。
- **Linux 引擎中的网络摄像头。** 即时引擎中的 `picamera2` 可以使用你的网络摄像头，因为脚本在你的浏览器中运行。客户机运行在我们的服务器上，因此其摄像头工具只能获得测试图案。
- **将图像发送到错误位置的电子纸驱动。** 在 UC8179 面板（7.5 英寸）上，命令 `0x10` 是上一幅图像，`0x13` 是玻璃显示的那一幅。只写入 `0x10` 的驱动在这里只会得到空白刷新，与真实面板上完全一样，串口监视器（在该引擎中为 Linux 终端）会说明原因。BUSY 引脚也跟随控制器：UltraChip 面板工作时为 LOW，SSD168x 上为 HIGH。
- **`pigpio`、`libgpiod` / `gpiod`、`/dev/gpiomem`。** 两种引擎中都没有守护进程，也没有 GPIO 字符设备。请使用 `RPi.GPIO` 或 `gpiozero`。
- **从 MicroPython 教程复制的脚本。** `import machine`、`from gpio_lcd import GpioLcd` 之类存在于 Pico 或 ESP32 上，而不存在于运行完整 Python 的开发板上。控制台会指出 Pi 上的对应项（`gpiozero`、`RPLCD`、`luma.oled`、`w1thermsensor`），而不是建议安装某个软件包。
- **PyTorch、TensorFlow。** 体积达数 GB，而且这里没有任何东西可以加速它们。它们会被拒绝并给出该说明。

## 各引擎中的 Python 模块

两种引擎都附带标准库。"预装"意味着仅凭 `import` 语句即可工作，无需 `requirements.txt`，就像 Raspberry Pi OS 在镜像中自带其硬件库一样。

| 模块 | 即时引擎（浏览器） | Linux（客户机） |
| --- | --- | --- |
| `RPi.GPIO` | 预装 | 预装 |
| `gpiozero` | 预装 | 预装（2.0.1） |
| `smbus2` / `smbus` | 预装（真实库） | 预装 |
| `spidev` | 预装 | 预装 |
| `serial`（pyserial） | 仅 Pi UART 路径 | 真实 tty 上的真实 pyserial 3.5 |
| `w1thermsensor` | 预装 | 通过 `requirements.txt`（1-Wire 目录树已存在） |
| `luma.core`、`luma.oled`、`luma.lcd` | 预装 | 预装 |
| `RPLCD` | 预装 | 预装 |
| `ST7789` | 预装 | 预装 |
| `board`、`busio`、`digitalio`（Adafruit Blinka） | 预装 | 预装 |
| `adafruit_ssd1306`、`adafruit_rgb_display` | 预装 | 预装 |
| `PIL`（Pillow）、`numpy` | 预装 | 预装（Pillow 10.3、numpy 1.25） |
| `cv2`（OpenCV） | 是 | 否（客户机无构建版本） |
| `picamera2` | 是，通过你的网络摄像头 | 否（使用 `rpicam-jpeg` / `libcamera-jpeg`） |
| `velxio_screen` | 是 | 是 |
| `requests` / `urllib` | 是，通过 Velxio 带允许列表的出站代理 | 无网络 |
| 其他任何内容 | 通过 `requirements.txt` | 通过 `requirements.txt` |

DejaVu 字体位于客户机中 Raspberry Pi OS 使用的路径下（`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`），因为显示类教程会硬编码该路径。

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

在脚本旁边添加一个 `requirements.txt` 文件，每行一个软件包；Velxio 会在运行前解析它，并在运行控制台中告知你安装了哪些内容。当脚本导入缺失的软件包时，控制台会提供要添加的行，并有一个按钮为你写入。哪个引擎能接受某个软件包取决于它的构建方式：

- 纯 Python 软件包（`py3-none-any` wheel）在两种引擎中都能运行。
- 含编译代码的软件包，当浏览器运行时附带它时（包括 numpy、pillow、opencv-python、scikit-learn 等）可在**即时**引擎中运行；只有在 PyPI 有对应的 **musl aarch64** wheel 时（numpy、pandas、scipy 和 psutil 有）才能在 **Linux** 引擎中运行。只发布 glibc `manylinux` wheel 的软件包无法在客户机中安装。
- 在 Raspberry Pi Zero、1 或 2 上，客户机是 32 位的，PyPI 几乎没有对应的编译 wheel：在那里请坚持使用预装内容或纯 Python 软件包。
- 客户机已提供的名称（`RPi.GPIO`、`smbus2`、`spidev`、`pyserial`、`gpiozero`）永远不会被下载，因此教程中列出它们的 `requirements.txt` 不会造成任何问题。

wheel 与 Arduino 库计入相同的存储配额。

## 文件

Pi 工作区中的**文件面板**可将脚本和数据文件上传到项目中；在 Linux 模式下，它们会在 `script.py` 启动前被复制到客户机的主目录中。

## UNIHIKER M10

DFRobot 的教育单板计算机（一块带内置触摸屏的 Linux 开发板）运行在相同的两种引擎上，用其自有的 `pinpong` 和 `unihiker` 模块替代 Pi 的兼容层。它是一块付费开发板，有自己独立的三次试用会话；可在选择器中 Pi 系列旁边找到它。

## 开发板图形和引脚定义

每块开发板的画布图形和完整引脚图，由模拟器生成：

[Raspberry Pi 3（图形也适用于 Zero/1/2）](/docs/zh-cn/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/zh-cn/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/zh-cn/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/zh-cn/boards/reference/unihiker-m10/)
