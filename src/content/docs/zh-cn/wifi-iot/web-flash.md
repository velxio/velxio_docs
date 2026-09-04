---
title: 从浏览器烧录真实硬件
description: 无需安装工具链，直接在浏览器中通过 USB 将编译好的项目写入实体开发板。
sidebar:
  order: 4
---

当您的项目在模拟器中运行正常后，无需安装任何软件即可将其烧录到**真实开发板**上：Velxio 通过 USB 直接 从浏览器烧录编译好的固件。

## 要求

- 基于 Chromium 的浏览器（Chrome 或 Edge）。烧录器使用浏览器的 Web Serial 和 WebUSB API，Firefox 和 Safari 不支持这些 API。Pico 系列开发板在这些浏览器中仍会显示**Download .uf2** 按钮（见下文）。
- 一根支持数据传输的 USB 线缆，用于连接开发板。
- 请先关闭其他占用该端口的所有程序（串口监视器、IDE、picotool）：浏览器需要独占访问权限。

![选择 USB 串口的烧录对话框](../../../../assets/docs/wifi-iot/flash-modal.png)

## 烧录步骤

1. 右键点击画布上的开发板，选择 **Flash to real board**。
2. 点击 **Connect & flash**。浏览器会询问您要授权哪个 USB 设备；请选择您的开发板。
3. Velxio 使用它已为该开发板构建的产物（即模拟器正在运行的同一二进制文件）。如果代码自上次构建后有更改，它会先重新编译，编译输出会实时显示在对话框中。
4. 观察进度条；完成后，开发板将重启并运行您的项目。

对话框会根据目标设备自动选择烧录协议：

| 设备系列 | 写入方式 | 开发板必须处于的状态 |
| --- | --- | --- |
| ESP32、S3、C3、C6 | 通过串口使用 esptool，写入合并后的 `.bin` 文件 | 已连接；若无响应请按住 BOOT 键 |
| Arduino Uno、Nano、Mega、ATtiny85 | 通过 STK500 协议与开发板引导程序通信，写入 `.hex` 文件 | 已连接（ATtiny85：需通过运行 ArduinoISP 的 Arduino 板连接） |
| Raspberry Pi Pico、Pico W、Pico 2、Pimoroni RP2040 / RP2350 系列开发板 | 通过 WebUSB 使用 PICOBOOT 协议，写入 picotool 生成的 `.uf2` 文件 | 处于 **BOOTSEL** 模式（见下节） |

## Pico 系列开发板：先进入 BOOTSEL 模式

RP2040 或 RP2350 芯片由其引导程序进行编程，这是芯片仅在 **BOOTSEL** 模式下才会呈现的一种独立 USB 设备形态。有两种方法可以进入该模式：

- **手动操作**：在插入开发板时按住 BOOTSEL 按钮，然后松开。开发板会挂载为一个名为 `RPI-RP2`（RP2040）或 `RP2350` 的 USB 驱动器。
- **通过对话框操作**：这些开发板的烧录对话框有一个 **Reboot into bootloader over USB** 按钮。当开发板正在运行 Velxio 构建的程序（Arduino 核心会在 1200 波特率下重启）或 MicroPython（REPL 会执行 `machine.bootloader()`）时，此按钮有效。浏览器会请求访问开发板的串口，开发板会断开连接并以引导程序模式重新出现。然后点击 **Connect & flash** 并选择 `RP2 Boot` / `RP2350 Boot` 设备。

两次点击，两次权限提示：一次是用于重启的串口权限，一次是用于写入的 USB 设备权限。一旦开发板进入 BOOTSEL 模式，后续烧录只需第二次授权。

对话框会在擦除任何内容之前，拒绝与所识别芯片不匹配的固件镜像（例如在 RP2040 上烧录 RP2350 的构建，或在 ARM 配置上烧录 RISC-V 的构建），并在写入后逐字节校验，最后将开发板重启进入您的程序。

### Windows 系统与 RP2040：一次性安装 WinUSB 驱动

RP2040 的引导程序不包含 Windows 驱动描述符，因此浏览器无法直接使用它，除非为其绑定 WinUSB 驱动。一次性设置步骤：

1. 将开发板置于 BOOTSEL 模式并插入电脑。
2. 下载并运行 [Zadig](https://zadig.akeo.ie)。
3. 从列表中选择 `RP2 Boot (Interface 1)`（如果被隐藏，请通过 Options 菜单选择 List All Devices），选择 **WinUSB** 作为驱动程序，然后点击 **Install Driver**。

RP2350 系列开发板（Pico 2、Pico 2 W、Pimoroni "Pico 2 W Aboard" Unicorns、Badger 2350）则无需任何操作：它们的引导程序自带描述符，Windows 会自动绑定 WinUSB。macOS 系统对两种芯片均无需额外操作。

### Linux 系统：添加 udev 规则

Linux 默认将 USB 设备权限授予 root 用户。请创建 `/etc/udev/rules.d/99-velxio-rp2.rules` 文件，内容如下：

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

然后执行 `sudo udevadm control --reload-rules && sudo udevadm trigger` 并重新插拔开发板。用于重启步骤的串口还需要 `dialout` 用户组成员权限。

### 任意浏览器：下载 .uf2 文件

Pico 系列开发板的烧录对话框始终提供 **Download .uf2** 选项（在 Firefox 和 Safari 中，由于浏览器无法直接烧录，该选项是对话框的全部内容）。保存文件，将开发板置于 BOOTSEL 模式，然后将文件拖放到 `RPI-RP2` / `RP2350` 驱动器上：复制完成后开发板会立即重启并运行您的程序。

### Pico 上的 MicroPython 项目

对话框会通过 REPL 上传项目的 `.py` 文件，并重启运行 `main.py`。MicroPython 本身需要预先烧录到开发板上：它是一个 `.uf2` 文件，您需要将其拖放到 BOOTSEL 驱动器上一次（Pimoroni 开发板已预装；可从 [pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases) 和 [micropython.org](https://micropython.org/download/) 下载）。

## 故障排除

- **"未找到处于 BOOTSEL 模式的开发板"**：设备选择列表为空。请使用重启按钮或在插入时按住 BOOTSEL 键，然后重新连接。
- **"BOOTSEL 模式下的开发板是 RP2040，但此项目是为 RP2350 构建的"**：Pimoroni 在 2025 年 1 月之前销售的 Stellar 和 Galactic Unicorn 搭载的是 Pico W（RP2040），之后销售的搭载的是 Pico 2 W（RP2350）。请检查您设备的标签，并在编辑器中选 择匹配的开发板。
- **Windows 系统上出现 "无法声明 USB 设备"**：请执行上述 Zadig 步骤。Linux 系统上：请执行上述 udev 规则。
- **串口重启无反应**：使用禁用 USB 协议栈构建的程序无法通过 USB 重启。请在插入时按住 BOOTSEL 键。

## 先模拟，后烧录

这形成了一个闭环，使 Velxio 能够胜任实际工作：在模拟器中快速迭代（无需线缆、不损耗硬件、即时重置），当行为符合预期后，再烧录完全相同的构建产物。
