---
title: 退出码
description: velxio-cli 向你的作业返回什么、每个代码的含义，以及它们以分钟计的成本。
sidebar:
  order: 6
---

退出码是 Velxio CI 与你的作业之间的契约。它是稳定的；脚本可以依赖它。

| code  | meaning                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`   | **通过。** `--expect-text` 匹配成功、场景结束，或者唯一要求只是截图且截图已完成。                                                  |
| `1`   | **失败。** 出现了 `--fail-text`、某个 `expect-pin` 未匹配、某个步骤失败，或者 guest 崩溃。                                                                     |
| `2`   | **配置。** 用法或 lint 错误，或者服务器在运行开始前就拒绝了。不计费。                                                                     |
| `3`   | **认证。** token 缺失、格式错误、未知、已撤销或已过期；或者套餐无权使用 CI。                                                                  |
| `4`   | **配额。** 本月 CI 分钟数已用完，或者并发作业数超过套餐允许。不计费。                                                                     |
| `5`   | **服务器或 runner。** 被限流、CI 已禁用、没有空闲 runner 及时可用、runner 丢失、引擎停滞、墙钟时间上限、渲染器崩溃、连接中断。 |
| `42`  | **预算耗尽。** 在满足预期之前已达到模拟时间预算。用 `--timeout-exit-code` 修改它。                                         |
| `130` | **Ctrl-C。** CLI 取消运行，最多等待 5 秒以获取最终报告，然后退出。                                                                                        |

`--timeout-exit-code 0` 会把预算变成正常结束，这就是你表达“运行 N 个模拟秒并把串口给我”的方式：

```bash
velxio-cli run --timeout 5000 --timeout-exit-code 0 --serial-log-file serial.log .
```

## 状态与原因

一次运行的最后一行会同时给出两者：

```
FAIL (expect_pin_mismatch) in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 1
```

| status      | reasons                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `passed`    | `plan_complete`, `expect_text`, `screenshots_done`                                                                                             |
| `failed`    | `fail_text`, `expect_pin_mismatch`, `pin_not_connected`, `pin_unknown`, `control_unknown`, `step_failed`, `screenshot_mismatch`, `guest_crash` |
| `timeout`   | `budget_reached`                                                                                                                               |
| `error`     | `engine_stalled`, `wall_cap`, `renderer_crash`, `page_load_failed`, `runner_lost`, `no_runner`, `server_error`, `load_failed`                  |
| `cancelled` | `user`, `client_disconnected`                                                                                                                  |
| `lost`      | `heartbeat`, `api_restart`                                                                                                                     |

`screenshot_mismatch` 是保留的：截图比较尚未实现，所以如今 `compare-with` 永远不会让运行失败。参见[场景](/docs/zh-cn/ci/scenarios/)。

使用 `--json` 时，每一行都是一个对象，最后一行会携带全部信息：

```json
{
  "t": "end",
  "status": "failed",
  "reason": "expect_pin_mismatch",
  "exit_code": 1
}
```

在 GitHub Actions 中，相同的值会作为 [action](/docs/zh-cn/ci/github-action/) 的 `status` 和 `sim_time_ms` 输出到达。

## 为什么运行被拒绝（退出码 2）

这些会在任何计费发生之前返回，每条消息中都会带有出错的名称：

| code                                                                          | what to fix                                                                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `unknown_board_type`                                                          | 该板不是 Velxio 类型，也不是 CI 已知的板类型。`velxio-cli boards`。                                              |
| `board_not_supported_in_ci`                                                   | Velxio 尚无该板的 CI 模拟；消息中会指明阶段。参见[板卡表](/docs/zh-cn/ci/velxio-toml/)。 |
| `board_not_launched`                                                          | 该板存在但不可用于运行。                                                                              |
| `unsupported_part`                                                            | 图中的某个部件无法模拟；消息中会列出其 id。                                                             |
| `firmware_format_mismatch`                                                    | 该镜像不适用于该芯片——比如在 `esp32-s3` 板上使用 ESP32-C3 镜像。                                            |
| `firmware_too_large`, `bundle_too_large`, `blob_missing`, `blob_sha_mismatch` | 超过大小上限，或者上传未完整到达。                                                                  |
| `scenario_invalid`                                                            | 某个步骤未知，或者某个字段缺失或无法解析。                                                                    |
| `scenario_part_missing`                                                       | 某个步骤引用了电路中不存在的 `part-id`。                                                                        |
| `feature_unsupported`                                                         | 尚未构建的功能：`language = "micropython"`、`[[chip]]`、触摸步骤。                                           |
| `no_sim_clock`                                                                | 该板没有可读取的模拟时钟，因此无法按模拟时间计费。                                  |
| `too_many_parts`, `bad_request`                                               | 超过电路限制，或者请求格式错误。                                                                           |

退出码 4 是 `quota_exhausted`（消息中会带有重置日期）或 `concurrency`。退出码 5 是 `rate_limited`、`ci_disabled` 或 `server_error`。

先运行 `velxio-cli lint .`：它会在本地捕获大多数导致退出码 2 的原因，无需 token，也无需网络。

## 每种结束方式的成本

分钟数是**模拟**时间，向上取整到整秒，且绝不会超过该次运行预留的预算。

- **在开始前被拒绝**（退出码 2、3、4）——不计费。该次运行从未到达 runner。
- **没有空闲 runner** 及时可用，或者连接在固件启动前中断——不计费。
- **通过、失败或超时**——已流逝的模拟秒数。
- **运行中途出现服务器或 runner 错误**（退出码 5）——仅计已流逝的模拟秒数，而不是该次尝试所花费的墙钟时间。
- **Ctrl-C**——截至取消时的模拟秒数。

你的余额以及每次运行的状态、模拟时间、计费秒数和退出码都在 [velxio.dev/account/ci](https://velxio.dev/account/ci)。
