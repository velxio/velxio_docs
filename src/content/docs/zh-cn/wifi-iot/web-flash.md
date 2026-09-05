---
title: 从浏览器烧录真实硬件
description: 无需安装工具链，直接在浏览器中通过USB将编译好的项目写入实体开发板。
sidebar:
  order: 4
---

当您的项目在模拟器中运行正常后，您可以无需安装任何软件，直接将其烧录到**真实开发板**上：Velxio 通过USB将编译好的固件从浏览器直接写入开发板。

## 要求

- 基于 Chromium 的浏览器（Chrome 或 Edge）。烧录器使用浏览器的 Web Serial 和 WebUSB API，Firefox 和 Safari 不支持这些 API。Pico 系列开发板在这些浏览器中仍会显示**Download .uf2** 按钮（见下文）。
- 一根支持数据传输的USB线连接开发板。
- 先关闭其他占用该端口的程序（串口监视器、IDE、picotool）：浏览器需要独占访问权限。

![选择USB串口的烧录对话框](../../../../assets/docs/wifi-iot/flash-modal.png)

## 烧录步骤

1. 右键点击画布上的开发板，选择 **Flash to real board**（烧录到真实开发板）。
2. 点击 **Connect & flash**（连接并烧录）。浏览器会询问授权哪个USB设备；选择您的开发板。
3. Velxio 使用它已为该开发板构建的固件（与模拟器运行的二进制文件相同）。如果代码此后有更改，它会先重新编译，编译输出会实时显示在对话框中。
4. 观察进度条；完成后，开发板将重启并运行您的项目。

对话框会根据目标设备自动选择协议：

| 系列 | 写入方式 | 开发板必须处于 |
| --- | --- | --- |
| ESP32、S3、C3、C6 | 通过串口的 esptool，写入合并后的 `.bin` 文件 | 已连接；若无响应则按住 BOOT 键 |
| Arduino Uno、Nano、Mega、ATtiny85 | 通过 STK500 协议与开发板引导程序通信，写入 `.hex` 文件 | 已连接（ATtiny85：需通过运行 ArduinoISP 的 Arduino 连接） |
| Raspberry Pi Pico、Pico W、Pico 2、Pimoroni RP2040 / RP2350 开发板 | 通过 WebUSB 的 PICOBOOT 协议，写入 picotool 构建的 `.uf2` 文件 | **BOOTSEL** 模式（见下节） |

## Pico 系列开发板：先进入 BOOTSEL 模式

RP2040 或 RP2350 由其引导程序编程，这是芯片仅在 **BOOTSEL** 模式下才会显示的独立USB设备。有两种方式进入该模式：

- **手动操作**：按住 BOOTSEL 按钮的同时插入开发板，然后松开。开发板会挂载为一个名为 `RPI-RP2`（RP2040）或 `RP2350` 的USB驱动器。
- **通过对话框**：这些开发板的烧录对话框有一个 **Reboot into bootloader over USB**（通过USB重启至引导程序）按钮。当开发板正在运行 Velxio 构建的程序（Arduino 核心会在 1200 波特率打开时重启）或 MicroPython（REPL 执行 `machine.bootloader()`）时，此按钮有效。浏览器会请求访问开发板的串口，开发板会断开并重新以引导程序模式出现。然后点击 **Connect & flash**（连接并烧录）并选择 `RP2 Boot` / `RP2350 Boot` 设备。

两次点击，两次权限提示：一次是重启所需的串口权限，一次是写入所需的USB设备权限。一旦开发板进入 BOOTSEL 模式，后续烧录只需第二次授权。

对话框会在擦除任何内容之前，拒绝与所识别芯片不匹配的固件镜像（例如在 RP2040 上烧录 RP2350 的构建，或在 ARM 配置上烧录 RISC-V 构建），写入后会逐字节校验，并将开发板重启进入您的程序。

### Windows 和 RP2040：一次性安装 WinUSB

RP2040 引导程序不附带 Windows 驱动描述符，因此在 WinUSB 绑定到它之前，浏览器无法访问它。一次性设置步骤：

1. 将开发板置于 BOOTSEL 模式并插入。
2. 下载并运行 [Zadig](https://zadig.akeo.ie)。
3. 从列表中选择 `RP2 Boot (Interface 1)`（如果隐藏，请通过 Options（选项）菜单选择 List All Devices（列出所有设备）），选择 **WinUSB** 作为驱动程序，然后点击 **Install Driver**（安装驱动程序）。

RP2350 开发板（Pico 2、Pico 2 W、Pimoroni "Pico 2 W Aboard" Unicorns、Badger 2350）无需任何操作：它们的引导程序自带描述符，Windows 会自动绑定 WinUSB。macOS 对两种芯片均无需额外操作。

### Linux：udev 规则

Linux 默认将USB设备权限授予 root 用户。请创建 `/etc/udev/rules.d/99-velxio-rp2.rules`，内容如下：

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

然后执行 `sudo udevadm control --reload-rules && sudo udevadm trigger` 并重新插入开发板。用于重启步骤的串口还需要 `dialout` 用户组成员资格。

### 任何浏览器：下载 .uf2 文件

Pico 系列开发板的烧录对话框始终提供 **Download .uf2**（下载 .uf2）按钮（在 Firefox 和 Safari 中，由于浏览器无法烧录，该按钮是对话框的全部内容）。保存文件，将开发板置于 BOOTSEL 模式，然后将文件拖放到 `RPI-RP2` / `RP2350` 驱动器上：复制完成后开发板会立即重启并运行您的程序。

### Pico 上的 MicroPython 项目

对话框通过 REPL 上传项目的 `.py` 文件，然后重启进入 `main.py`。开发板上需要预先安装 MicroPython：

- **Pico 和 Pico W**：对话框会自动安装。如果没有 REPL 响应，它会要求您将开发板置于 BOOTSEL 模式并点击 Retry（重试）；该点击会写入与模拟器运行版本相同的 MicroPython 固件，再次点击 Retry（重试）即可上传您的文件。
- **Pimoroni RP2350 开发板**（Badger 2350、Pico Plus 2W）：它们出厂预装 Pimoroni 自家的 MicroPython。如果您的开发板丢失了固件，请从 [pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases) 下载 `.uf2` 文件并拖放到 BOOTSEL 驱动器上一次，然后即可从对话框进行烧录。

## 故障排除

- **"未找到处于 BOOTSEL 模式的开发板"**：设备选择器为空。请使用重启按钮或在插入时按住 BOOTSEL 键，然后重新连接。
- **"BOOTSEL 模式下的开发板是 RP2040，但此项目是为 RP2350 构建的"**：Pimoroni 在 2025 年 1 月之前销售的 Stellar 和 Galactic Unicorn 搭载 Pico W（RP2040），此后搭载 Pico 2 W（RP2350）。请检查您设备的标签，并在编辑器中选择匹配的开发板。
- **Windows 上 RP2040 出现 "无法声明USB设备"**：请执行上述 Zadig 步骤。Linux 上：请执行上述 udev 规则。
- **串口重启无反应**：使用禁用USB协议栈构建的程序无法通过USB重启。请在插入时按住 BOOTSEL 键。

## 先模拟，后烧录

这形成了使 Velxio 适用于实际工作的完整流程：在模拟器中快速迭代（无需线缆、不损耗硬件、即时重置），当行为正确时，再烧录完全相同的构建产物。
----- END PAGE -----
