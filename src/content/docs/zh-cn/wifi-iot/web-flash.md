---
title: 从浏览器烧录真实硬件
description: 无需安装工具链，直接在浏览器中通过 USB 将编译好的项目写入实体开发板。
sidebar:
  order: 4
---

当您的项目在模拟器中运行时，您可以将其烧录到**真实开发板**上，无需安装任何软件：Velxio 通过 USB 直接通过浏览器烧录编译后的固件。

## 要求

- 基于 Chromium 的浏览器（Chrome 或 Edge）。烧录器使用浏览器的 Web Serial 和 WebUSB API，Firefox 和 Safari 不支持这些 API。Pico 系列开发板在这些浏览器中仍会显示**Download .uf2** 按钮（见下文）。
- 一根支持数据传输的 USB 线连接到您的开发板。
- 首先关闭其他占用该端口的程序（串口监视器、IDE、picotool）：浏览器需要独占访问权限。

![选择 USB 串行端口的烧录对话框](../../../../assets/docs/wifi-iot/flash-modal.png)

## 烧录

1. 右键点击画布上的开发板，选择 **Flash to real board**。
2. 点击 **Connect & flash**。浏览器会询问授予哪个 USB 设备权限；选择您的开发板。
3. Velxio 使用它已为该开发板构建的固件（与模拟器运行的二进制文件相同）。如果代码自上次以来有更改，它会先重新编译，编译输出会流入对话框。
4. 观察进度条；完成后，开发板将重启并运行您的项目。

对话框会根据目标选择协议：

| 系列 | 写入方式 | 开发板必须处于 |
| --- | --- | --- |
| ESP32、S3、C3、C6 | 通过串口使用 esptool，写入合并后的 `.bin` | 已连接；若无响应则按住 BOOT |
| Arduino Uno、Nano、Mega、ATtiny85 | 通过 STK500 协议与开发板的引导程序通信，写入 `.hex` | 已连接（ATtiny85：通过运行 ArduinoISP 的 Arduino） |
| Raspberry Pi Pico、Pico W、Pico 2、Pimoroni RP2040 / RP2350 开发板 | 通过 WebUSB 使用 PICOBOOT，写入 picotool 构建的 `.uf2` | 处于 **BOOTSEL** 模式（下一节） |

## Pico 系列开发板：先进入 BOOTSEL 模式

RP2040 或 RP2350 由其引导程序编程，这是芯片仅在 **BOOTSEL** 模式下显示的独立 USB 设备。有两种方法进入该模式：

- **手动**：按住 BOOTSEL 按钮插入开发板，然后松开。开发板会挂载为一个名为 `RPI-RP2`（RP2040）或 `RP2350` 的 USB 驱动器。
- **从对话框**：这些开发板的烧录对话框有一个 **Reboot into bootloader over USB** 按钮。当开发板正在运行 Velxio 构建的程序（Arduino 核心在 1200 波特率打开时重启）或 MicroPython（REPL 运行 `machine.bootloader()`）时，此按钮有效。浏览器会请求开发板的串行端口，开发板断开连接并以引导程序模式重新出现。然后点击 **Connect & flash** 并选择 `RP2 Boot` / `RP2350 Boot` 设备。

两次点击，两次权限提示：一次是重启所需的串行端口，一次是写入所需的 USB 设备。一旦开发板进入 BOOTSEL 模式，后续烧录只需第二次授权。

### 同一开发板的两个版本

Pimoroni 在 2025 年 1 月之前销售的 Stellar 和 Galactic Unicorn 搭载 Pico W (RP2040)，此后销售的搭载 Pico 2 W (RP2350)。模拟器运行当前版本；这些开发板的烧录对话框中有一个 **Real board revision** 选择器。为旧版选择“Pico W aboard”：对话框会为该芯片构建第二个镜像，进行烧录或下载，而模拟器继续运行自己的构建。该选择会按开发板记忆。开发板背面的标签（或 BOOTSEL 模式下的驱动器名称，`RPI-RP2` 与 `RP2350`）会告诉您拥有的是哪个版本。

在擦除任何内容之前，对话框会拒绝与响应芯片不匹配的镜像（例如在 RP2040 上烧录 RP2350 构建，或在 ARM 配置上烧录 RISC-V 构建），写入后会验证每个字节，然后将开发板重启到程序中。

### Windows 和 RP2040：安装一次 WinUSB

RP2040 引导程序不附带 Windows 驱动程序描述符，因此在绑定 WinUSB 之前，浏览器无法声明它。一次性设置：

1. 将开发板置于 BOOTSEL 模式并插入。
2. 下载并运行 [Zadig](https://zadig.akeo.ie)。
3. 从列表中选择 `RP2 Boot (Interface 1)`（如果隐藏，请使用“选项，列出所有设备”），选择 **WinUSB** 作为驱动程序，然后点击 **Install Driver**。

RP2350 开发板（Pico 2、Pico 2 W、Pimoroni“Pico 2 W Aboard”Unicorns、Badger 2350）无需任何操作：它们的引导程序带有描述符，Windows 会自动绑定 WinUSB。macOS 在两种芯片上都不需要任何操作。

### Linux：udev 规则

Linux 默认将 USB 设备分配给 root。创建 `/etc/udev/rules.d/99-velxio-rp2.rules`，内容如下：

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

然后运行 `sudo udevadm control --reload-rules && sudo udevadm trigger` 并重新插入开发板。用于重启步骤的串行端口也需要通常的 `dialout` 组权限。

### 任何浏览器：下载 .uf2，或将其复制到驱动器

Pico 系列开发板的烧录对话框始终提供 **Download .uf2** 选项（在 Firefox 和 Safari 中，由于浏览器无法烧录，这是对话框的全部内容）。保存文件，将开发板置于 BOOTSEL 模式，然后将文件拖放到 `RPI-RP2` / `RP2350` 驱动器上：复制结束时开发板会立即重启进入您的程序。

在 Chrome 和 Edge 中，还有 **Copy to the board's drive** 选项：浏览器要求您选择驱动器并自行将文件写入其中。不涉及驱动程序，因此这是在 Windows 上无需安装 WinUSB 即可对 RP2040 编程的方法。对话框在写入任何内容之前会检查您选择的文件夹是否为 BOOTSEL 驱动器（其中包含 `INFO_UF2.TXT`）。

### Pico 上的 MicroPython 项目

对话框通过 REPL 上传项目的 `.py` 文件，然后重启进入 `main.py`。MicroPython 本身必须首先在开发板上：

- **Pico 和 Pico W**：对话框会安装它。如果没有 REPL 响应，它会要求您将开发板置于 BOOTSEL 模式并点击重试；该点击会写入模拟器运行的相同 MicroPython 构建，再次重试会上传您的文件。
- **Pimoroni RP2350 开发板**（Badger 2350、Pico Plus 2W）：它们出厂时带有 Pimoroni 自己的 MicroPython。如果您的开发板丢失了它，请从 [pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases) 下载 `.uf2` 文件并拖放到 BOOTSEL 驱动器上一次，然后从对话框进行烧录。

## 故障排除

- **“未找到处于 BOOTSEL 模式的开发板”**：设备选择器为空。使用重启按钮或在插入时按住 BOOTSEL，然后重新连接。
- **“BOOTSEL 中的开发板是 RP2040，但此项目是为 RP2350 构建的”**：较旧的 Unicorn 搭载 Pico W。在对话框的 **Real board revision** 选择器中选择“Pico W aboard”并重新烧录。
- **Windows 上使用 RP2040 时出现“无法声明 USB 设备”**：执行上述 Zadig 步骤。在 Linux 上：执行上述 udev 规则。
- **串口重启无反应**：使用禁用 USB 协议栈构建的程序无法通过 USB 重启。在插入时按住 BOOTSEL。

## 先模拟，后烧录

这完成了使 Velxio 对实际工作有用的闭环：在模拟器中快速迭代（无需线缆，不磨损硬件，即时重置），然后在行为正确时烧录完全相同的构建产物。
----- END PAGE -----
