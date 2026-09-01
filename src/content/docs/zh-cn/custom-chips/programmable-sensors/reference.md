---
title: "控件参考"
description: chip.json 中控件部分的每个字段、自动滑块回退机制、值的存储方式，以及控件无效时应检查的内容。
sidebar:
  order: 6
---

`chip.json` 中的 `controls` 数组描述了仿真运行期间面板显示的内容。每个条目驱动其 `name` 与该条目 `id` 匹配的属性。

## 条目字段

| 字段 | 适用范围 | 含义 |
| --- | --- | --- |
| `id` | 全部 | **必填。** 此控件驱动的属性。没有 `id` 的条目将被跳过 |
| `type` | 全部 | `"range"` 表示滑块，`"button"` 表示瞬时触发器。任何其他值都会被忽略，该条目不产生任何内容 |
| `label` | 全部 | 控件旁边的文本。回退到属性的 `label`，然后是 `id` |
| `min` | range | 下限。回退到属性的 `min`，然后是 `0` |
| `max` | range | 上限。回退到属性的 `max`，然后是 `100` |
| `step` | range | 增量。回退到属性的 `step`，当跨度大于 20 时回退到 `1`，否则回退到 `0.01` |
| `unit` | range | 打印在数值之后，例如 `ppm` 或 `%`。默认为空 |
| `scale` | range | `"log"` 提供对数滑块。当 `min` 为负数时被忽略，因为该曲线在该处未定义 |

滑块的**起始位置**不取自控件。它来自属性的 `default`，回退到 `min`。请将属性的 `default` 保持在控件的范围内，否则面板打开时手柄会卡在一端。

## 面板标题

取自芯片的 `name`。没有 `name` 的芯片显示“Custom Chip”。

## 自动回退

您完全不必编写 `controls`。

**任何同时声明了 `min` 和 `max`、且没有显式控件声明的属性，都会自动获得一个滑块。** 其标签来自属性的 `label`，步长来自属性的 `step`，或按以下方式推断：对于 `type: "int"` 为 `1`，否则当跨度大于 20 时为 `1`，否则为 `0.01`。它没有单位。

因此，只有在需要重命名滑块、添加单位、使其成为对数滑块或声明按钮时，才需要 `controls`。这带来两个实际后果：

- 在实时控件出现之前编写的芯片通常无需编辑即可进行调节。
- 属性没有 `min`/`max` 且没有 `controls` 部分的芯片**完全不显示面板**。这通常是点击芯片似乎没有任何反应的常见原因。

## 按钮

`"button"` 条目为复位线、“模拟运动”类事件以及任何其他边沿而非电平的事件提供瞬时触发器：

![运动传感器面板上的按钮控件和保持时间滑块](../../../../../assets/docs/custom-chips/motion-button-panel.png) 按下它会将属性驱动到 `1`，约 150 毫秒后回到 `0`，因此您的芯片应将非零读取视为“事件已发生”，而不是试图捕捉特定瞬间。

## 值的存储位置

滑块位置会在您停止移动约 250 毫秒后镜像到组件的已保存属性（在 `attrs` 下），并合并待处理的值。这就是为什么拖动滑块不会在每个像素上都写入项目，以及为什么该位置在保存和重新加载后仍然存在。

镜像是一个*副本*。运行中的芯片读取的值是实时值，在控件移动的瞬间即被应用。

## 引擎

| 引擎 | 值的到达方式 |
| --- | --- |
| AVR、RP2040、浏览器内 ESP32 | 直接写入 WebAssembly 在每次 `vx_attr_read` 时读取的属性存储 |
| QEMU 后端上的 ESP32 | 转发到工作线程，并在那里应用于芯片运行时的属性存储 |

两者都是实时的：无需重新编译、无需重启、无需“应用”按钮。唯一的延迟是您自己的代码调用 `vx_attr_read` 的频率。

## 计划

实时控件在所有计划上都是**免费的**，编写、编译和运行声明它们的芯片也是如此。两个相邻功能是付费的：让 AI 为您编写芯片或传感器（Maker 及以上计划），以及 [My Chips](/docs/zh-cn/custom-chips/my-chips/) 库（Pro 计划），该库将芯片保存在服务器上以便跨项目复用。

## 控件无效时

| 症状 | 原因 |
| --- | --- |
| 点击芯片不打开面板 | 没有 `controls` 条目，也没有同时具有 `min` 和 `max` 的属性，或者仿真已停止 |
| 面板中缺少特定条目 | 其 `type` 既不是 `range` 也不是 `button`，或者没有 `id` |
| 滑块移动但没有任何变化 | 芯片缓存了 `vx_attr_read`，而不是在使用值的位置调用它 |
| 滑块起始位置错误 | 属性的 `default` 在控件的 `min`/`max` 之外 |
| 数值以整数跳变 | 由于跨度大于 20，`step` 被推断为 `1`；请显式设置 `step` |
| 对数滑块是线性的 | 当 `min` 为负数时，`scale: "log"` 被忽略 |

## 另请参阅

- [教程：模拟 CO2 传感器](/docs/zh-cn/custom-chips/programmable-sensors/co2-analog/)
- [教程：通过 I2C 的温度和湿度](/docs/zh-cn/custom-chips/programmable-sensors/i2c-env/)
- [自定义芯片 API 参考](/docs/zh-cn/custom-chips/api/)
- 此处每个字段的运行示例：[按钮](https://velxio.dev/example/motion-sensor-sim-button)、[对数滑块](https://velxio.dev/example/night-light-log-slider)、[SPI](https://velxio.dev/example/spi-thermometer-live-slider) 和 [UART](https://velxio.dev/example/uart-air-sensor-live-slider) 传感器
