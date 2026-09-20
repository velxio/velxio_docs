---
title: 树莓派（Linux）
description: 从 Zero 到 Pi 5 的树莓派开发板。Python 脚本直接作用于画布上的电路，默认在浏览器中运行，也可在 Velxio 服务器上的 Linux 客户机中运行，并逐一说明各部件在每种引擎下的支持情况。
sidebar:
  order: 7
  badge: PRO
---

树莓派系列可以**让 Python 脚本直接作用于画布上的电路**。与微控制器开发板不同，这里没有需要编译的内容：你编写脚本，按下 **Run**，Velxio 会选择两种引擎之一来执行它。两种引擎都不是 Raspberry Pi OS 桌面环境，因此在假设为真实硬件编写的教程可以原样运行之前，请先阅读本页。大多数教程确实可以：下表中的内容是在 2026-09-19 和 2026-09-20 针对线上产品逐一实测得出的。

| 开发板                        | CPU 配置            |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7 级别  |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

任何人都可以在画布上放置一块 Pi 并围绕它连接电路。**运行**它需要付费方案，或者使用每个已登录账户针对 Pi 系列获得的**三次 15 分钟免费试用会话**之一（参见[方案](/docs/zh-cn/getting-started/plans/)）。如果项目中没有 Pi 能运行的内容，例如在 Pi 开发板上运行 Arduino `.ino` 草图，系统会在消耗试用会话之前告知你。

![Velxio 画布上的 Raspberry Pi 5](../../../../assets/docs/boards/raspberry-pi-5.png)

## 两种引擎

### 即时引擎（在你的浏览器中）

默认选项。你的脚本在标签页内一个编译为 WebAssembly 的 Python 解释器上运行，几秒钟即可启动，且不需要 Velxio 服务器的任何支持。引脚写入直接作用于画布，因此 `led.on()` 一执行，LED 就会亮起。I2C、SPI 和 1-Wire 以 Pi 所拥有的设备文件形式存在（`/dev/i2c-1`、`/dev/spidev0.0`、`/sys/bus/w1/devices` 目录树），由画布上接线的部件来响应，因此真实的 `smbus2`、`w1thermsensor` 和 Adafruit Blinka 可以不加修改地运行。

它是一个普通的解释器，不是操作系统：没有 shell，没有 `subprocess`，没有原始套接字。如果脚本请求其中任何一项，就会被转交给 Linux 引擎；工具栏中的**引擎标签**会显示将由哪个引擎运行，当为 Linux 时，还会显示请求它的文件和行号。

### Linux 引擎（在 Velxio 的服务器上）

一个在 QEMU 中启动的真实 Linux 客户机（`-M virt`，使用你开发板的 CPU 配置），你可以通过工作区中的串口控制台访问它。请准确理解它是什么：

- **Alpine Linux**，不是 Raspberry Pi OS。已安装 `python3` 和 `pip`；没有 `apt`、`raspi-config`、桌面环境和 Pi 固件工具。
- 客户机内部**没有网络**，这是有意为之。里面的任何东西都无法访问 PyPI；项目在 `requirements.txt` 中声明的包在客户机启动时即可导入，`pip` 本身也可以离线针对本地 wheelhouse 工作（见下文）。
- **排针总线是真实的设备文件。** `/dev/i2c-0`、`/dev/i2c-1`、`/dev/spidev0.0` 和 `/dev/spidev0.1` 会响应与 Pi 上相同的系统调用，因此自行打开它们的库（Adafruit Blinka）、C 程序或你自己的 `ioctl` 代码都能与画布上的部件通信。无人持有的地址会像在硬件上一样失败，报错为 `OSError: [Errno 121] Remote I/O error`。
- **`smbus2` 和 `spidev` 是上游软件包**，不是 Velxio 的替代品：`import smbus2` 得到的是真正的 smbus2，`import spidev` 得到的是编译好的 py-spidev，两者都通过那些设备节点工作。因此内核的规则与在开发板上一样适用。超过 32 字节的 SMBus 块传输会报错失败，而不是被悄悄截断；打开一个不存在的总线，例如 `SMBus(2)`，会在打开调用时抛出异常，而不是在第一次读取时。
- **排针 UART 是真实的串口。** `/dev/serial0`（以及 `/dev/ttyAMA0` 和 `/dev/ttyS0`）是由未经修改的 pyserial 驱动的真正 tty：`serial.tools.list_ports`、对端口使用 `select()` 以及 `cat /dev/serial0` 都能工作，字节会发送到画布上连接到 GPIO14 和 GPIO15 的任何设备。
- **1-Wire 以 Pi 所拥有的 sysfs 目录树形式存在。** GPIO4 上的 DS18B20 会出现在 `/sys/bus/w1/devices/28-*/` 下，带有 `w1_slave` 和 `temperature`，因此 `cat`、`w1thermsensor` 风格的读取器以及你自己的代码都能工作（项目 `config.txt` 中的 `dtoverlay=w1-gpio,gpiopin=N` 可以移动引脚）。
- **`libcamera-jpeg`、`rpicam-jpeg`、`rpicam-still` 和 `libcamera-still`** 可以从画布上的摄像头部件拍摄静态照片，就像脚本用 `subprocess` 调用它们一样。除非你允许客户机使用你的网络摄像头，否则图片是该部件的**测试图案**；Velxio 会在程序第一次拍摄静态照片时询问（见下文）。
- **GPIO 有真实的字符设备。** `/dev/gpiochip0` 存在，已弃用的 `/sys/class/gpio` 也存在，此外还有 `RPi.GPIO` 和 `gpiozero`。仍然**没有** `/dev/gpiomem`，因此需要外设寄存器的 `pigpio` 没有可通信的对象（见下文）。
- 启动大约需要 20 到 30 秒，服务器繁忙时会更长；一个"Booting"覆盖层会跟踪进度。客户机会话最迟在 **2 小时**后结束。
- 客户机启动时会运行你项目中的 **`script.py`**。在 Linux 模式下请将主文件命名为该名称（即时引擎会运行它找到的第一个 `.py` 文件）。

当你需要 shell 时，工作区中的 **Linux terminal** 按钮会为本次会话的剩余时间固定使用此引擎，例如检查文件或手动运行脚本。该选择不会随项目保存：明天重新打开，Run 会回到检测器的判断结果。即时引擎能运行的一切，不用它都会更快。

## Linux 引擎中的 GPIO：gpiochip0 和 libgpiod

客户机注册了一个具有 Pi 自身身份的 GPIO 字符设备，因此 Bookworm 和 Pi 5 文档所教授的现代技术栈在这里可以工作。`gpiodetect` 会回答：

```text
gpiochip0 [pinctrl-bcm2835] (54 lines)
```

工具已安装（`gpiodetect`、`gpioinfo`、`gpioget`、`gpioset`、`gpiomon`），它们驱动的线路会到达画布上连接到该引脚的部件。

镜像附带的是 **libgpiod 版本 1**，因此请按版本 1 的方式编写命令：芯片是位置参数，而不是 `--chip` 选项。

```bash
gpioset gpiochip0 17=1     # drive GPIO17 high
gpioget gpiochip0 5        # read GPIO5, prints 0 or 1
gpiomon gpiochip0 5        # print edges on GPIO5 as they arrive
```

版本 2 的写法（`gpioset --chip gpiochip0 17=1`）无法识别。如果教程使用了它，请去掉该选项并单独传入芯片。

Python 绑定也已预装，同样是版本 1 的 API：

```python
import gpiod

chip = gpiod.Chip("gpiochip0")
line = chip.get_line(17)
line.request(consumer="velxio", type=gpiod.LINE_REQ_DIR_OUT)
line.set_value(1)
```

`RPi.GPIO` 和 `gpiozero` 不受此影响，仍然是编写脚本的最短途径。`/sys/class/gpio` 下已弃用的 sysfs 接口也能工作，因此通过写文件导出引脚的旧教程可以按其所写运行。仍然缺失的是 `/dev/gpiomem`，以及随之缺失的 `pigpio`：该库直接映射外设寄存器，而这里没有可映射的对象。

即时引擎没有字符设备：在浏览器中，GPIO 通过 `RPi.GPIO`、`gpiozero` 或 Blinka 实现。

## Linux 引擎中的摄像头

默认情况下，客户机的摄像头工具返回摄像头部件的**测试图案**，拍摄静态照片的脚本会得到一张图片，而无需询问任何人。

当程序在 Linux 引擎中、摄像头部件处于网络摄像头模式时第一次请求静态照片，Velxio 会询问是否可以使用你的真实网络摄像头。它必须询问，因为代码运行的位置不同：在即时引擎中，帧永远不会离开你的机器，而 Linux 客户机运行在 Velxio 的服务器上，因此允许它意味着帧会被发送到那里。

- 回答**否**，工具会继续返回测试图案。不会有任何东西损坏，也不需要修改任何脚本。
- 回答**是**，静态照片将来自你的真实网络摄像头，**仅限该页面会话**。该回答不会保存在项目中，重新加载后也不会记住，因此下次打开页面时会再次询问你。

`picamera2` 是另一回事：它仍然是即时引擎模块。在 Linux 客户机中，请使用命令行工具拍摄静态照片。

## 各部件支持情况

每一行都是按 Pi 教程方式编写的脚本，在 Raspberry Pi 4 上、部件已连接到画布的情况下通过线上产品运行。显示类行是在画布本身上检查的：面板必须亮起，而不仅仅是脚本运行完成。

| 内容 | 脚本使用的库 | 即时引擎 | Linux 引擎 |
| --- | --- | --- | --- |
| LED 和按钮 | `gpiozero` | 是 | 是 |
| 从 shell 控制 LED | `gpioset`（libgpiod 1） | 否 | 是 |
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
| 7.5" 电子纸（UC8179） | `spidev` + `RPi.GPIO`，Waveshare 风格驱动 | 是 | 是 |
| 直接接在 GPIO 上的电位器 | | 否（见下文） | 否 |

OLED 和 LCD 行也在 Linux 引擎中的 Raspberry Pi Zero 上运行过，那是一个拥有自己镜像的 32 位客户机。

## 不支持的内容

- **GPIO 上的模拟输入。** 树莓派**没有 ADC**，在真实硬件上也是如此。直接接到 GPIO 的电位器、LDR 或脉搏传感器只会读到高或低，运行控制台会说明这一点。请在传感器和 Pi 之间放置一个 **ADS1115**（I2C）或 **MCP3008**（SPI），就像你在实验台上会做的那样；两者都在目录中，图库中有一个带电位器的 MCP3008 示例。
- **Linux 引擎中的 `picamera2`。** 它在即时引擎中使用你的网络摄像头，因为脚本在你的浏览器中运行。在客户机中，静态照片改由 `rpicam-jpeg` 及其同类工具拍摄，基于测试图案或在你允许后基于你的网络摄像头（见上文）。
- **将图片发送到错误位置的电子纸驱动。** 在 UC8179 面板（7.5"）上，命令 `0x10` 是上一张图像，`0x13` 是玻璃显示的那张。只写 `0x10` 的驱动在这里只会得到空白刷新，与真实面板上完全一样，串口监视器（在该引擎中即 Linux 终端）会说明原因。BUSY 引脚也遵循控制器：UltraChip 面板工作时为 LOW，SSD168x 上为 HIGH。
- **`pigpio` 和 `/dev/gpiomem`。** `pigpio` 通过映射外设寄存器来访问引脚，而两种引擎都不提供该映射。请使用 `RPi.GPIO`、`gpiozero`，或在 Linux 引擎中使用 `libgpiod`（见上文）。
- **即时引擎中的 `libgpiod` / `gpiod`。** 字符设备是 Linux 引擎的东西；在浏览器中没有 `/dev/gpiochip0` 可打开。
- **从 MicroPython 教程复制的脚本。** `import machine`、`from gpio_lcd import GpioLcd` 之类存在于 Pico 或 ESP32 上，而不是运行完整 Python 的开发板上。控制台会指出 Pi 的对应物（`gpiozero`、`RPLCD`、`luma.oled`、`w1thermsensor`），而不是建议安装某个包。
- **PyTorch、TensorFlow。** 体积达数 GB，而且这里没有任何东西可以加速它们。它们会被拒绝并附上该说明。

## 各引擎中的 Python 模块

两种引擎都附带标准库。"预装"意味着仅凭 `import` 行即可工作，无需 `requirements.txt`，就像 Raspberry Pi OS 在镜像中带有其硬件库一样。

| 模块 | 即时引擎（浏览器） | Linux 引擎（客户机） |
| --- | --- | --- |
| `RPi.GPIO` | 预装 | 预装 |
| `gpiozero` | 预装 | 预装（2.0.1） |
| `gpiod`（libgpiod 1） | 浏览器中没有字符设备 | 预装，附带 `gpio*` 工具 |
| `smbus2` / `smbus` | 预装（真实库） | 预装（真实库） |
| `spidev` | 预装 | 预装（编译好的 py-spidev） |
| `serial`（pyserial） | 仅 Pi UART 路径 | 真实 tty 上的真实 pyserial 3.5 |
| `w1thermsensor` | 预装 | 通过 `requirements.txt`（1-Wire 目录树已存在） |
| `luma.core`、`luma.oled`、`luma.lcd` | 预装 | 预装 |
| `RPLCD` | 预装 | 预装 |
| `ST7789` | 预装 | 预装 |
| `board`、`busio`、`digitalio`（Adafruit Blinka） | 预装 | 预装 |
| `adafruit_ssd1306`、`adafruit_rgb_display` | 预装 | 预装 |
| `PIL`（Pillow）、`numpy` | 预装 | 预装（Pillow 10.3、numpy 1.25） |
| `cv2`（OpenCV） | 是 | 否（客户机没有构建版本） |
| `picamera2` | 是，通过你的网络摄像头 | 否（使用 `rpicam-jpeg` / `libcamera-jpeg`） |
| `velxio_screen` | 是 | 是 |
| `requests` / `urllib` | 是，通过 Velxio 带允许列表的出站代理 | 无网络 |
| 其他任何内容 | 通过 `requirements.txt` | 通过 `requirements.txt` |

DejaVu 字体位于客户机中 Raspberry Pi OS 使用的路径（`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`），因为显示类教程会硬编码该路径。

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

### 其他第三方包需要 `requirements.txt`

在脚本旁边添加一个 `requirements.txt` 文件，每行一个包；Velxio 会在运行前解析它，并在运行控制台中告诉你它安装了什么。当脚本导入一个缺失的包时，控制台会提供要添加的行，并有一个按钮为你写入。哪个引擎能接受某个包取决于它的构建方式：

- 纯 Python 包（`py3-none-any` wheel）在两种引擎中都能运行。
- 带编译代码的包，当浏览器运行时附带它时（其中包括 numpy、pillow、opencv-python、scikit-learn），可在**即时**引擎中运行；只有当 PyPI 有对应的 **musl aarch64** wheel 时（numpy、pandas、scipy 和 psutil 有），才能在 **Linux** 引擎中运行。只发布 glibc `manylinux` wheel 的包无法在客户机中安装。
- 在 Raspberry Pi Zero、1 或 2 上，客户机是 32 位的，而 PyPI 几乎没有为其提供的编译 wheel：在那里，请坚持使用预装内容或纯 Python 包。
- 客户机已提供的名称（`RPi.GPIO`、`smbus2`、`spidev`、`pyserial`、`gpiozero`、`gpiod`）永远不会被下载，因此教程中列出它们的 `requirements.txt` 不会造成任何损害。

Wheel 与 Arduino 库一样计入相同的存储配额。

### 在 Linux 客户机中手动运行 pip

你永远不必这样做。`requirements.txt` 声明的内容在客户机启动时即可导入，完全不需要安装步骤。对于遵循明确写出该命令的教程的人，真实命令也能工作：

```bash
python3 -m venv --system-site-packages ~/.venv
~/.venv/bin/pip install -r requirements.txt
```

客户机没有网络，因此 `pip` 会针对随项目包一起提供的本地 wheelhouse 进行解析；它会安装项目声明的内容，无法从 PyPI 获取其他任何东西。

开始之前请了解它的代价，不要把沉默当作卡死：在模拟 CPU 上，创建**带** pip 的 virtualenv 大约需要四分钟（不带它大约六秒），安装本身大约半分钟。这段等待不会给你带来任何你尚未拥有的东西，因为当你看到提示符时，你声明的包已经被导入了。它是为那些你想要真实工作流的时刻而存在的。

系统 Python 被标记为外部管理（PEP 668），与 Raspberry Pi OS Bookworm 上完全一样，因此在 virtualenv 之外直接运行 `pip install` 会拒绝，并给出与开发板上相同的消息。

## 文件

Pi 工作区中的**文件面板**可以将脚本和数据文件上传到项目中；在 Linux 模式下，它们会在 `script.py` 启动之前被复制到客户机的主目录中。

## UNIHIKER M10

DFRobot 的教育 SBC（一块带内置触摸屏的 Linux 开发板）在相同的两种引擎上运行，用其自己的 `pinpong` 和 `unihiker` 模块代替 Pi 库。它是一块付费开发板，有自己三次试用会话；可在 Pi 系列旁边的选择器中找到它。

## 开发板图形和引脚图

每块开发板的画布图形和完整引脚图，由模拟器生成：

[Raspberry Pi 3（图形也适用于 Zero/1/2）](/docs/zh-cn/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/zh-cn/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/zh-cn/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/zh-cn/boards/reference/unihiker-m10/)
