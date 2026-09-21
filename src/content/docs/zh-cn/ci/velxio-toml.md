---
title: velxio.toml
description: Velxio CI 读取的项目文件：开发板、固件、电路和场景，以及 CI 目前运行的开发板和每个路径的解析方式。
sidebar:
  order: 3
---

`velxio.toml` 告诉 CLI 要运行什么：哪块开发板、哪个编译好的固件、哪个电路、哪个场景。它位于你指向 CLI 的目录中。其中的每个路径都相对于该文件本身，正斜杠在所有操作系统上都可用。

```toml
[velxio]
version = 1                      # required
board = "esp32-s3"               # Velxio board kind
firmware = "build/app.bin"       # .hex | .bin | .uf2 | merged ESP32 image
diagram = "diagram.json"         # Wokwi-format circuit (the default when present)
scenario = "test.yaml"           # default scenario; --scenario overrides it
```

`velxio-cli init --board arduino-uno` 会写入一个初始的 `velxio.toml` 和一个包含一块开发板的 `diagram.json`。

## 键

| 键             | 含义                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | 必须为 `1`。                                                                                                                                 |
| `board`        | Velxio 开发板类型（见下表）。当 diagram 或 `.vlx` 已指明开发板时可选；当两者同时存在时，它们必须一致。                                        |
| `firmware`     | 编译好的镜像：`.hex`、`.bin`、`.uf2`，或合并的 ESP32 flash 镜像。                                                                            |
| `flasher_args` | 使用 ESP-IDF 的 `build/flasher_args.json` 代替 `firmware`。两者互斥。                                                                        |
| `elf`          | 当 `firmware` 缺失时使用的 ELF。会为 AVR 和 RP2040 开发板进行转换。                                                                          |
| `diagram`      | 电路，采用 Wokwi 的 `diagram.json` 格式。                                                                                                    |
| `project`      | Velxio `.vlx` 项目导出。优先于 `diagram`。                                                                                                   |
| `scenario`     | 默认运行的场景 YAML。参见[场景](/docs/zh-cn/ci/scenarios/)。                                                                                       |
| `language`     | `arduino`。`micropython` 会以退出码 2 被拒绝：CI 仅运行编译好的固件。                                                                        |

不会有任何内容被静默忽略。CLI 不认识的键会产生警告；尚未实现的功能会以 `feature_unsupported` 使运行失败，而不是悄悄运行一个与你所写不同的项目。`[[chip]]`（自定义芯片）就是其中之一：目前会被拒绝，并指明源文件。

## CI 目前运行的开发板

由服务器决定，而非 CLI。目前有三十六种可运行：每块拥有浏览器内引擎的开发板，每一种都通过启动真实固件得到验证。

### AVR

| 类型 | 开发板 | `diagram.json` 类型 | 固件 |
| ---- | ----- | ------------------- | -------- |
| `arduino-uno` | Arduino Uno | `wokwi-arduino-uno` | Intel HEX |
| `arduino-nano` | Arduino Nano | `wokwi-arduino-nano` | Intel HEX |
| `arduino-mega` | Arduino Mega | `wokwi-arduino-mega` | Intel HEX |
| `attiny85` | ATtiny85 | `wokwi-attiny85` | Intel HEX |

### RP2040 和 RP2350

| 类型 | 开发板 | `diagram.json` 类型 | 固件 |
| ---- | ----- | ------------------- | -------- |
| `raspberry-pi-pico` | Raspberry Pi Pico | `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | flash 镜像 |
| `pi-pico-w` | Raspberry Pi Pico W | `board-pi-pico-w` | flash 镜像 |
| `xiao-rp2040` | XIAO RP2040 | `board-velxio-xiao-rp2040` | flash 镜像 |
| `xiao-rp2350` | XIAO RP2350 | `board-velxio-xiao-rp2350` | flash 镜像 |
| `pimoroni-pico-plus-2w` | Pimoroni Pico Plus 2 W | `board-velxio-pimoroni-pico-plus-2w` | flash 镜像 |
| `badger-2350` | Pimoroni Badger 2350 | `board-velxio-badger-2350` | flash 镜像 |
| `stellar-unicorn` | Pimoroni Stellar Unicorn | `board-velxio-stellar-unicorn` | flash 镜像 |

### XIAO ARM

| 类型 | 开发板 | `diagram.json` 类型 | 固件 |
| ---- | ----- | ------------------- | -------- |
| `xiao-nrf52840-sense` | XIAO nRF52840 Sense | `board-velxio-xiao-nrf52840-sense` | Intel HEX |
| `xiao-samd21` | XIAO SAMD21 | `board-velxio-xiao-samd21` | Intel HEX |
| `xiao-ra4m1` | XIAO RA4M1 | `board-velxio-xiao-ra4m1` | Intel HEX |
| `xiao-mg24-sense` | XIAO MG24 Sense | `board-velxio-xiao-mg24-sense` | Intel HEX |
| `xiao-nrf54l15-sense` | XIAO nRF54L15 Sense | `board-velxio-xiao-nrf54l15-sense` | Intel HEX |

### ESP32

| 类型 | 开发板 | `diagram.json` 类型 | 固件 |
| ---- | ----- | ------------------- | -------- |
| `esp32` | ESP32 DevKit v1 | `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | 合并的 ESP32 镜像 |
| `esp32-s3` | ESP32-S3 DevKitC-1 | `board-esp32-s3-devkitc-1` | 合并的 ESP32 镜像 |
| `esp32-c3` | ESP32-C3 DevKitM-1 | `board-esp32-c3-devkitm-1` | 合并的 ESP32 镜像 |
| `esp32-c6` | ESP32-C6 DevKitC-1 | `board-esp32-c6-devkitc-1` | 合并的 ESP32 镜像 |
| `esp32-devkit-c-v4` | ESP32 DevKitC v4 | `board-esp32-devkit-c-v4` | 合并的 ESP32 镜像 |
| `esp32-cam` | ESP32-CAM | `board-esp32-cam` | 合并的 ESP32 镜像 |
| `wemos-lolin32-lite` | WEMOS LOLIN32 Lite | `board-wemos-lolin32-lite` | 合并的 ESP32 镜像 |
| `xiao-esp32-s3` | XIAO ESP32-S3 | `board-xiao-esp32-s3` | 合并的 ESP32 镜像 |
| `arduino-nano-esp32` | Arduino Nano ESP32 | `board-arduino-nano-esp32` | 合并的 ESP32 镜像 |
| `xiao-esp32-c3` | XIAO ESP32-C3 | `board-xiao-esp32-c3` | 合并的 ESP32 镜像 |
| `aitewinrobot-esp32c3-supermini` | ESP32-C3 SuperMini | `board-aitewinrobot-esp32c3-supermini` | 合并的 ESP32 镜像 |
| `xiao-esp32c6` | XIAO ESP32-C6 | `board-xiao-esp32-c6` | 合并的 ESP32 镜像 |
| `esp32-p4` | ESP32-P4 Function EV | `board-esp32-p4-function-ev` | 合并的 ESP32 镜像 |
| `m5stack-core` | M5Stack Core | `board-velxio-m5stack-core` | 合并的 ESP32 镜像 |
| `esp32-c3-lcdkit` | ESP32-C3-LCDkit | `board-velxio-esp32-c3-lcdkit` | 合并的 ESP32 镜像 |
| `cardputer-adv` | M5Stack Cardputer ADV | `board-velxio-cardputer-adv` | 合并的 ESP32 镜像 |
| `xiao-esp32s3-sense` | XIAO ESP32-S3 Sense | `board-velxio-xiao-esp32s3-sense` | 合并的 ESP32 镜像 |
| `esp-vocat` | ESP-VoCat | `board-velxio-esp-vocat` | 合并的 ESP32 镜像 |
| `esp32-s3-eye` | ESP32-S3-EYE | `board-velxio-esp32-s3-eye` | 合并的 ESP32 镜像 |
| `esp-sensairshuttle` | ESP-SensAirShuttle | `board-velxio-esp-sensairshuttle` | 合并的 ESP32 镜像 |

其中任何一块也可以在 diagram 中写作 `board-velxio-<kind>`，例如 `board-velxio-esp32-c6`；那些没有自己 Wokwi 类型的开发板没有其他写法。

`velxio-cli boards` 会打印实时列表，包含每块开发板的状态、其 `diagram.json` 类型以及它接受的固件格式。

:::caution
其余的开发板可在编辑器中运行，但尚不能在 CI 中运行：STM32 开发板（它们需要 QEMU 通道）、Raspberry Pi 和 UNIHIKER 开发板、ESP32-P4 预览开发套件，以及 DFRobot 系列（仍处于其发布标志之后）。每一种都会在运行开始前被拒绝，并给出 `board_not_supported_in_ci` 及其计划所属的阶段。不会产生费用，也不会静默替换为相近的开发板。
:::

Pico W 可以运行，但 CI 没有网络：WiFi 和套接字永远不会连接，运行会带有 `no_network` 警告。

## 路径如何解析

- **配置文件：** `velxio.toml`，然后是 `wokwi.toml`，然后是目录中恰好一个 `*.vlx`。都没有则为退出码 2。
- **电路：** `--project-file`，然后是 `[velxio] project`，然后是 `--diagram-file`，然后是 `[velxio] diagram`，然后是配置文件旁边的 `diagram.json`。
- **固件：** `--firmware`，然后是 `--elf`，然后是 `[velxio] firmware` 或 `flasher_args`，然后是 `[velxio] elf`，然后是 `[wokwi] firmware`，然后是 `[wokwi] elf`。
- **开发板：** `[velxio] board`，然后是 diagram 中的开发板部分（或 `.vlx` 的活动开发板）。

命令行中给出的相对路径相对于项目目录解析，而不是相对于你 shell 的工作目录。

## diagram.json

Wokwi 的格式，按原样读取：`version: 1`，`parts` 为 `{id, type, left, top, attrs, rotate, hide}`，`connections` 为 `[from, to, color, path]`。diagram 中的部件 id 就是你的场景步骤所使用的 id。

```json
{
  "version": 1,
  "parts": [
    {
      "type": "wokwi-arduino-uno",
      "id": "uno",
      "top": 0,
      "left": 0,
      "attrs": {}
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": -40,
      "left": 300,
      "attrs": { "value": "220" }
    },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": -100,
      "left": 420,
      "attrs": { "color": "red" }
    }
  ],
  "connections": [
    ["uno:13", "r1:1", "green", ["v0"]],
    ["r1:2", "led1:A", "green", ["v0"]],
    ["led1:C", "uno:GND.1", "black", ["v0"]]
  ]
}
```

部件是 `wokwi-*` 元素（`wokwi-led`、`wokwi-pushbutton`、`wokwi-dht22` 等等）。CLI 不认识的部件类型是警告，而不是错误：由服务器决定，它无法模拟的部件会按 id 报告，而不是被静默丢弃。

## .vlx

从 Velxio 编辑器导出的项目（`format: "velxio-project"`，`version: 1`）可以代替 diagram 作为电路。将单个 `.vlx` 放入目录，或用 `project =` 或 `--project-file` 指定它。导出的主开发板即为本次运行的开发板；固件仍来自 toml 或 `--firmware`。

## 限制

| 项目                       | 上限                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| 每块开发板的固件           | 16 MiB                                                                                             |
| 每次运行上传的所有文件     | 20 MiB                                                                                             |
| 电路                       | 300 个部件，2,000 条连线                                                                           |
| 场景                       | 200 个步骤，20 张截图，每个 `wait-serial` 文本 512 字节                                            |
| `--timeout`                | 你套餐的上限（Maker 为 5 分钟，Pro 为 10 分钟），且绝不超过你剩余的分钟数                          |

`--timeout` 超过上限不是错误：它会被钳制，运行会报告一个 `timeout_clamped` 警告，并给出实际获得的预算。

## 在花费数分钟之前先检查

```bash
velxio-cli lint .
```

`lint` 不需要令牌，也不需要网络。它解析 toml，解析每个路径，检查文件存在且符合上限，检查部件 id 唯一且连线引用了存在的部件，检查开发板是 CI 可运行的，检查固件格式与开发板系列匹配，并检查每个场景步骤都是已知的、具有其字段、引用了存在的部件且其持续时间可解析。大多数 `exit 2` 失败在这里发现成本更低。
