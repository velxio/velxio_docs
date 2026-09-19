---
title: 场景
description: 通过 YAML 文件驱动仿真板——等待串口输出、发送字节、按下按钮、设置传感器、检查引脚——全部在仿真时钟上进行。
sidebar:
  order: 4
---

`--expect-text` 只回答一个问题：这一行是否曾经出现过？场景则回答其余的问题。它是一个 YAML 文件，列出了运行器按顺序执行的步骤，运行在主板卡的**仿真时钟**上。

字段名沿用 Wokwi 的命名，因此现有的 Wokwi 场景可以原样运行。

```yaml
# scenario.yaml
name: uno-ready boots and blinks
version: 1
steps:
  - wait-serial: READY
  - delay: 600ms
  - expect-pin:
      part-id: uno
      pin: 13
      expected: 1
```

```bash
velxio-cli run --scenario scenario.yaml .
```

当最后一步通过时，本次运行即通过；在第一个未通过的步骤处失败。每个步骤在执行时都会被报告：

```
ok   wait-serial "READY" at 0.004 s
ok   delay 600 ms at 0.604 s
ok   expect-pin uno:13 expected 1 at 0.604 s
PASS in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 0
```

## 步骤

| 步骤              | 字段                                                                                        | 作用                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delay`           | `500ms`、`2s`、`100us`；纯数字表示毫秒                                                      | 等待直到仿真时钟到达 `t0 + n`                                                                                                                                                 |
| `wait-serial`     | 一个字符串，最多 512 字节                                                                   | 子串匹配，字节精确，匹配自上一个 `wait-serial` 以来接收到的串口数据。如果预算先耗尽，运行以 `timeout` 结束                                                                     |
| `write-serial`    | 一个 UTF-8 字符串，或字节列表 `0..255`                                                      | 写入主板卡的 UART                                                                                                                                                             |
| `expect-pin`      | `part-id`、`pin`、`expected`（`0`/`1`、`high`/`low`、`true`/`false`；也接受 `value`）       | 立即读取一次引脚。不匹配则运行失败，并报告实际读取到的电平                                                                                                                    |
| `set-control`     | `part-id`、`control`、`value`（数字、字符串或布尔值）                                       | 按钮上的 `pressed` 会按下或释放它；其他控件是该部件的传感器控件和属性。未知控件会导致运行失败，并列出该部件拥有的控件                                                          |
| `take-screenshot` | `part-id`、`save-to` 和/或 `compare-with`、`tolerance`                                      | 在运行的该时刻捕获该部件的 PNG                                                                                                                                                |

任何步骤都可以在其键旁边带一个 `name:`，仅用于日志。

限制：每次运行最多 200 个步骤和 20 张截图。

## 一切都是仿真时间

`delay: 600ms` 是客户机时钟的 600 毫秒，而不是墙上时钟。同一个场景在负载繁重的运行器和空闲的运行器上花费相同的仿真时间，这正是结果可复现的原因——也是你被计费的原因。

:::caution
不要将引脚电平与串口线绑定。串口字节在 UART 中排队，并在排队它们的代码之后完成发送，因此对与 `digitalWrite` 在同一循环中打印的行的 `wait-serial` 可能会落在边沿的错误一侧——每次都会偏差零点几毫秒。使用 `wait-serial` 等待启动哨兵，然后用 `delay` 将读取放在你期望的窗口中间。
:::

## 驱动输入

```yaml
steps:
  - wait-serial: READY
  - set-control:
      part-id: btn1
      control: pressed
      value: 1
  - delay: 50ms
  - set-control:
      part-id: btn1
      control: pressed
      value: 0
  - wait-serial: "pressed"
```

`part-id` 是你的 `diagram.json`（或 `.vlx`）中的 id，绝不是内部 id。命名了不存在的部件的步骤会在运行开始前被拒绝，报 `scenario_part_missing` 并以退出码 2 结束——不计费。

字节通过 `write-serial` 反向传输，并字节精确地返回，包括高于 `0x7f` 的值：

```yaml
steps:
  - wait-serial: ECHO READY
  - write-serial: "hi\n"
  - wait-serial: "hi"
```

## 截图

```yaml
- take-screenshot:
    part-id: oled1
    save-to: shots/oled.png
```

该部件的 PNG 在运行的该时刻被捕获，并写入 `save-to`，相对于项目目录解析。一个仅以截图作为期望的运行，在最后一张截图拍摄后即通过。

:::note
`compare-with` 会被解析并上传，但比较功能**尚未实现**：截图会被捕获，运行会带有警告说明未进行比较，并且它永远不会导致运行失败。目前请在你自己的任务中比较 PNG。
:::

## 会变成步骤的标志

你可以在没有文件的情况下表达简单的情况，并且它们可以与文件组合使用：

| 标志                                      | 等价于                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--expect-text X`                         | 一个最终的 `wait-serial X`                                                                                                     |
| `--screenshot-part P --screenshot-time T` | `delay T` 然后 `take-screenshot P`                                                                                             |
| `--fail-text Y`                           | 不是步骤：在整个运行期间，每个板卡的每个串口数据块都会监视 `Y`，一旦出现就立即以 `failed` 结束运行                             |

## 在板卡上输入

`--interactive` 将你的 stdin 转发到主板卡的串口，每 20 毫秒合并一次。它可以与场景一起工作：两者都写入同一个 UART，按到达顺序。关闭 stdin 结束的是输入，而不是运行——预算或场景才会结束运行。

## 尚不支持

- **触摸步骤**（`touch-press`、`touch-move`、`touch-release`）。CLI 在 lint 阶段拒绝它们，而不是跳过它们。
- **截图比较**，如上所述。
- CI 运行中的**自定义芯片**：配置中的 `[[chip]]` 会被拒绝，报 `feature_unsupported`。

参见[退出码](/docs/zh-cn/ci/exit-codes/)了解每种失败返回给你的任务的内容，以及 [velxio.toml](/docs/zh-cn/ci/velxio-toml/) 了解场景如何默认附加到项目。
