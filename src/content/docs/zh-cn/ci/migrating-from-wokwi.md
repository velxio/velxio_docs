---
title: 从 Wokwi CI 迁移
description: 当 wokwi-cli 任务迁移到 Velxio CI 时会发生哪些变化：uses 行、密钥名称，以及哪些保持不变。
sidebar:
  order: 7
---

Velxio CI 可以直接读取 Wokwi CI 项目已有的文件：`wokwi.toml`、
`diagram.json` 和 Wokwi 的场景 YAML。整个过程不涉及 Wokwi 的任何代码；
我们自己的解析器读取这些格式。实际上迁移只需要改两行。

```diff
-      - uses: wokwi/wokwi-ci-action@v1
+      - uses: velxio/velxio-ci-action@v1
         with:
-          token: ${{ secrets.WOKWI_CLI_TOKEN }}
+          token: ${{ secrets.VELXIO_CLI_TOKEN }}
           path: /
           timeout: 10000
           expect_text: 'Hello, World!'
           fail_text: 'Error'
           scenario: 'test.scenario.yaml'
```

action 的输入名称刻意保持不变：`path`、`timeout`、
`expect_text`、`fail_text`、`scenario`、`serial_log_file`、`diagram_file`、
`elf`。使用 `velxio-cli login --ci --name "<repo>"` 获取密钥（它会在
浏览器中确认并只打印一次 token），然后将其存储为仓库密钥。完整列表见
[GitHub Actions](/docs/zh-cn/ci/github-action/)。

## 命令行

`wokwi-cli` 的标志以相同的名称存在：`--elf`、
`--diagram-file`、`--scenario`、`--expect-text`、`--fail-text`、
`--timeout`、`--timeout-exit-code`、`--interactive`、`--serial-log-file`、
`--screenshot-part`、`--screenshot-time`、`--screenshot-file`、`--quiet`。
两者的 `--timeout` 都是模拟毫秒。

`WOKWI_CLI_TOKEN` 永远不会被读取。请设置 `VELXIO_CLI_TOKEN`（或
`VELXIO_CI_TOKEN`），或者运行一次 `velxio-cli login`。

## wokwi.toml

按原样读取，你不需要将其重命名为 `velxio.toml`：

```toml
[wokwi]
version = 1
firmware = "build/firmware.bin"   # used
elf = "build/firmware.elf"        # used when firmware is absent (AVR, RP2040)
gdbServerPort = 3333              # warning: not supported
rfc2217ServerPort = 4000          # warning: not supported
vcdFile = "trace.vcd"             # warning: not supported

[[net.forward]]                   # warning: CI runs have no network
from = "localhost:8080"
to = "target:80"

[[chip]]                          # refused: custom chips do not run in CI yet
name = "inverter"
binary = "chips/inverter.chip.wasm"
```

不支持的键会按名称报告。它们是警告，而不是静默忽略，但 `[[chip]]`
除外，它会停止运行，这样你就不会因为电路缺少被测芯片而得到通过结果。
目前 Velxio CI 中没有 GDB 服务器、没有 RFC2217 端口、没有 VCD 导出，
也没有网络转发。

Velxio 新增的键（`board`、`diagram`、`project`、`scenario`、
`flasher_args`）位于 `[velxio]` 下。参见
[velxio.toml](/docs/zh-cn/ci/velxio-toml/)。

## 开发板

Wokwi 的部件类型映射到 Velxio 的种类。以下这些目前可以运行：

| Wokwi `diagram.json` 类型 | Velxio 种类 |
| ------------------------- | ----------- |
| `wokwi-arduino-uno` | `arduino-uno` |
| `wokwi-arduino-nano` | `arduino-nano` |
| `wokwi-arduino-mega` | `arduino-mega` |
| `wokwi-attiny85` | `attiny85` |
| `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | `raspberry-pi-pico` |
| `board-pi-pico-w` | `pi-pico-w`（CI 中无网络：警告） |
| `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | `esp32` |
| `board-esp32-s3-devkitc-1` | `esp32-s3` |
| `board-esp32-c3-devkitm-1` | `esp32-c3` |
| `board-esp32-c6-devkitc-1` | `esp32-c6` |
| `board-esp32-devkit-c-v4` | `esp32-devkit-c-v4` |
| `board-esp32-cam` | `esp32-cam` |
| `board-wemos-lolin32-lite` | `wemos-lolin32-lite` |
| `board-xiao-esp32-s3` | `xiao-esp32-s3` |
| `board-arduino-nano-esp32` | `arduino-nano-esp32` |
| `board-xiao-esp32-c3` | `xiao-esp32-c3` |
| `board-aitewinrobot-esp32c3-supermini` | `aitewinrobot-esp32c3-supermini` |
| `board-xiao-esp32-c6` | `xiao-esp32c6` |
| `board-esp32-p4-function-ev` | `esp32-p4` |
| `board-velxio-<kind>` | CI 可运行的任何开发板，以 Velxio 方式书写 |

Velxio 在 CI 中运行三十六种开发板，其中大多数是 Wokwi 没有对应类型的
开发板：RP2350 系列、XIAO ARM 开发板、M5Stack 和 Seeed 套件。将这些
写为 `board-velxio-<kind>`；完整列表见
[开发板表](/docs/zh-cn/ci/velxio-toml/)。

其他所有 Wokwi 开发板会在运行开始前失败，报错为
`board_not_supported_in_ci` 或 `unknown_board_type`，并会指明类型以及
计划中的阶段。这包括 `board-pi-pico-2` 和 `-2w`、STM32 开发板、
Nucleo、ESP32-S2/H2/C61 开发板、ESP32-P4 预览开发套件和显示套件。
只有在某个相近的 Velxio 开发板目前可以运行时才会被建议，并且绝不会
自动替换。被拒绝的运行不计费。

`velxio-cli boards` 会打印实时列表以及每个开发板的状态。

## 场景

Wokwi 的场景 YAML 可以原样运行：`delay`、`wait-serial`、
`write-serial`、`expect-pin`、`set-control`、`take-screenshot`，字段名
相同（`part-id`、`save-to`、`compare-with`、`value`）。所有计时都是
模拟时间，与 Wokwi 上一致。有两处不同：

- **触摸步骤**（`touch-press`、`touch-move`、`touch-release`）尚未实现；
  CLI 会在 lint 阶段拒绝它们。
- **`compare-with` 会被捕获但尚未进行比较**：你会得到 PNG 和一个警告，
  运行不会因此失败。

详情见[场景](/docs/zh-cn/ci/scenarios/)。

## 固件

CLI 会将你的工具链生成的产物转换为开发板引擎所加载的内容：

- Arduino ESP32 的 "Export compiled binary" 文件夹可用：
  `<sketch>.ino.bin` 会与 `<sketch>.ino.bootloader.bin` 和
  `<sketch>.ino.partitions.bin` 合并（如果存在 `boot_app0.bin` 也会
  一并合并）。
- PlatformIO 的 `firmware.bin` + `bootloader.bin` + `partitions.bin`
  以相同方式合并。ESP-IDF 项目可以将 `flasher_args` 指向
  `build/flasher_args.json`。
- 单独的 ESP32 `app.bin` 且没有同级文件会被拒绝，并给出
  `esptool.py merge_bin` 提示。
- Pico 的 `.uf2` 和 `.elf` 会被展平为 flash 镜像；AVR 的 `.elf`
  会转换为 Intel HEX。
- 引导加载程序的芯片 id 必须与开发板匹配：在 `esp32-s3` 开发板上使用
  ESP32-C3 镜像会报 `firmware_format_mismatch`，退出码 2。

不支持 MicroPython：CI 运行的是编译后的固件，
`language = "micropython"` 会被拒绝，而不会当作其他东西运行。

## 计费

分钟数是模拟时间，向上取整到整秒，按日历月（UTC）计算：Maker 每月
200 分钟，Pro 每月 2,000 分钟。在开始前被拒绝的运行不产生费用，引擎
卡住或墙钟时间上限只消耗已经过去的模拟秒数。完整表格见
[退出码](/docs/zh-cn/ci/exit-codes/)。

## 在你已有的项目上试试

```bash
velxio-cli lint .        # no token, no network: does Velxio understand this project?
export VELXIO_CLI_TOKEN=vlxci_...
velxio-cli run --scenario test.scenario.yaml --timeout 10000 .
```

如果 `lint` 通过，运行就能到达开发板。
