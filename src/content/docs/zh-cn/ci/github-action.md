---
title: GitHub Actions
description: velxio-ci-action——每个输入和输出及其默认值——以及使用它的工作流。
sidebar:
  order: 5
---

`velxio/velxio-ci-action` 在运行器上安装 CLI 并运行一个项目。它是一个复合 action：没有容器，没有 Docker 拉取，并且二进制文件在作业之间会被缓存。

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
    fail_text: "Guru Meditation"
```

在更早的步骤中编译，使用你已有的任何工具链。该 action 只运行它产出的结果。

## 一个完整的工作流

```yaml
name: firmware
on: [push, pull_request]

jobs:
  simulate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: |
          arduino-cli core install arduino:avr
          arduino-cli compile -b arduino:avr:uno --output-dir build sketch

      - name: Run it on a simulated Uno
        uses: velxio/velxio-ci-action@v1
        with:
          token: ${{ secrets.VELXIO_CLI_TOKEN }}
          path: .
          scenario: scenario.yaml
          timeout: 10000
```

该作业需要一个 secret，因为运行器没有浏览器来批准登录。使用以下命令生成它

```bash
velxio-cli login --ci --name "my-firmware"
```

它会打印一次 token，然后将其存储为仓库 secret（**Settings, Secrets and variables, Actions**）。账户页面（[velxio.dev/account/ci](https://velxio.dev/account/ci)）也可以生成一个，并且也是你撤销任一 token 的地方。

## 输入

| input               | default              | meaning                                                                    |
| ------------------- | -------------------- | -------------------------------------------------------------------------- |
| `token`             | required             | 你的 Velxio CI token                                                       |
| `path`              | `.`                  | 项目目录：`velxio.toml`（或 `wokwi.toml`）加上 `diagram.json`              |
| `timeout`           | `10000`              | 模拟时间预算，以毫秒为单位                                                 |
| `expect_text`       |                      | 一旦此文本出现在串口上，运行即通过                                         |
| `fail_text`         |                      | 一旦此文本出现在串口上，运行即失败                                         |
| `scenario`          |                      | 场景 YAML，相对于 `path`                                                   |
| `serial_log_file`   |                      | 将运行的每个串口字节写入此处，相对于 `path`                                |
| `diagram_file`      | `diagram.json`       | 电路文件，相对于 `path`                                                    |
| `elf`               |                      | ELF 固件，覆盖配置文件                                                     |
| `firmware`          |                      | `.hex`、`.bin`、`.uf2` 或合并的 ESP32 镜像，覆盖配置文件                   |
| `screenshot_part`   |                      | 要截图的部件 id                                                            |
| `screenshot_time`   |                      | 截图时的模拟时间，以毫秒为单位                                             |
| `screenshot_file`   | `screenshot.png`     | 写入位置                                                                   |
| `timeout_exit_code` | `42`                 | 达到预算时该步骤的退出码                                                   |
| `server`            | `https://velxio.dev` | Velxio 服务器                                                              |
| `cli_version`       | `latest`             | 要安装的 `velxio-cli` 发行版，例如 `v0.1.1`                                |

每个输入都一一对应到 `velxio-cli` 的一个标志。该 action 未暴露的任何内容——`--project-file`、`--interactive`、`--json`、`--screenshot-tolerance`、`--allow-unsupported`——都是改为在 `run:` 步骤中直接调用 CLI 的理由。

## 输出

| output        | value                                                         |
| ------------- | ------------------------------------------------------------- |
| `run_id`      | 服务器端的运行 id                                             |
| `run_url`     | 你账户页面上的该次运行                                        |
| `status`      | `passed`、`failed`、`timeout`、`error`、`cancelled` 或 `lost` |
| `sim_time_ms` | 运行持续的模拟毫秒数                                          |

即使运行失败，它们也会被发布，因此后续步骤可以链接到它：

```yaml
- name: Run it
  id: sim
  continue-on-error: true
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    expect_text: "READY"

- name: Report
  run: |
    echo "status=${{ steps.sim.outputs.status }}"
    echo "run: ${{ steps.sim.outputs.run_url }}"
    echo "simulated: ${{ steps.sim.outputs.sim_time_ms }} ms"
```

如果没有 `continue-on-error`，CLI 的非零退出会使该步骤和作业失败。这通常正是你想要的：请参阅[退出码](/docs/zh-cn/ci/exit-codes/)了解每个退出码的含义。

## 同时运行多个开发板

每个步骤一个项目，或者使用矩阵——但要注意你计划的并发数：Maker 一次运行 1 个作业，Pro 运行 2 个。第三个并发运行会以退出码 4 被拒绝，且不产生费用，所以请自行限制矩阵：

```yaml
jobs:
  simulate:
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 2
      matrix:
        project: [uno-ready, esp32s3-boot]
    steps:
      - uses: actions/checkout@v4
      - uses: velxio/velxio-ci-action@v1
        with:
          token: ${{ secrets.VELXIO_CLI_TOKEN }}
          path: test/ci/projects/${{ matrix.project }}
          expect_text: "READY"
```

## 运行器

支持 Linux、macOS 和 Windows 运行器，涵盖 x64 和 ARM64（Windows 仅限 x64）。该 action 会解析发行标签，根据发行版的 `SHA256SUMS` 验证二进制文件，并将其缓存在 `actions/cache` 下，以版本和平台为键——因此只有新 CLI 版本的第一个作业才会下载任何内容。

## 上传运行产生的内容

串口日志和截图是项目目录中的普通文件：

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: velxio-run
    path: |
      firmware/blink/serial.log
      firmware/blink/*.png
```

在运行步骤上使用 `serial_log_file: serial.log`。

## 其他 CI 系统

在其他任何地方都没有 action 可安装——安装 CLI 并调用它：

```yaml
script:
  - curl -fsSL https://velxio.dev/ci/install.sh | sh
  - ~/.velxio/bin/velxio-cli run --expect-text 'READY' --timeout 10000 .
```

在作业的 secret 环境中使用 `VELXIO_CLI_TOKEN`。退出码就是全部契约，并且在任何地方都一样。
