---
title: 带实时滑块的编程传感器
description: 使用 chip.json 的 controls 部分，构建一个在仿真运行期间可通过滑块改变其数值的传感器。
sidebar:
  order: 3
---

自定义芯片可以是一个**编程传感器**：一个在*仿真运行期间*通过滑块驱动其输出的部件。可以想象一个 CO2 传感器，你通过扫描其 ppm 值来测试阈值；一个通过 I2C 通信的温度/湿度探头；一个光敏传感器；一个有自己的想法的电位器——任何“如果数值变化了会怎样？”是关键点的场景。

## 配方

三个要素，都在你已经知道如何编写的芯片中：

1. **一个属性**——可调值：`vx_attr_register("ppm", 1000)`。
2. **`chip.json` 中的 `controls` 部分**——这是在仿真期间将滑块显示在屏幕上的部分：

```json
{
  "name": "CO2 Sensor",
  "pins": ["VCC", "GND", "OUT"],
  "attributes": [
    { "name": "ppm", "label": "CO2 (ppm)", "type": "int",
      "default": 1000, "min": 400, "max": 5000, "step": 10 }
  ],
  "controls": [
    { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
      "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
  ]
}
```

3. **在回调或定时器内重新读取属性**——切勿缓存它，滑块会在运行中更改它：

```c
#include "velxio-chip.h"

typedef struct { vx_pin out; vx_attr ppm; vx_timer t; } chip_state_t;
static chip_state_t S;

static void on_tick(void *ud) {
  double ppm = vx_attr_read(S.ppm);              /* 实时滑块值 */
  double volts = (ppm - 400.0) / 4600.0 * 5.0;   /* 400..5000 -> 0..5 V */
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out = vx_pin_register("OUT", VX_ANALOG);
  S.ppm = vx_attr_register("ppm", 1000);
  S.t = vx_timer_create(on_tick, 0);
  vx_timer_start(S.t, 50000000ULL, true);        /* 50 ms, 纳秒 */
  on_tick(0);
}
```

将 `OUT` 连接到板子的模拟引脚（例如 Arduino `A0`），按下 **Run**（运行），然后点击芯片：滑块面板会打开。拖动它，`analogRead(A0)` 会实时跟踪。

## 各部分如何连接

- 每个 `controls` 条目驱动**具有相同 id 的属性**——`vx_attr_read` 会在滑块移动的瞬间返回新值。
- `type: "range"` 是滑块；`type: "button"` 发送一个瞬时的 `1 → 0` 脉冲（约 150 毫秒），用于触发/复位输入。
- 没有 `controls` 部分？任何同时声明了 `min` 和 `max` 的属性都会自动获得一个实时滑块——大多数现有芯片无需修改其清单即可进行调优。
- `controls` 的结构与 Wokwi 兼容；`unit` 和 `scale: "log"` 是 Velxio 的扩展，Wokwi 会忽略它们。
- 设计时的默认值位于部件检查器中（在停止状态下右键点击芯片）。

## 现成模板

示例库中提供了两个完全按照这种方式构建的传感器：

- **CO2 Sensor (live slider)**（CO2 传感器（实时滑块））——上述模拟配方的逐字版本。
- **I2C Env Sensor (live sliders)**（I2C 环境传感器（实时滑块））——在 `0x44` 的 I2C 寄存器映射后面的温度 + 湿度，两者均由滑块驱动；这是任何数字协议传感器的模式。

将您自己的变体保存到 [My Chips](/docs/zh-cn/custom-chips/my-chips/)（我的芯片），然后在每个项目中只需点击一下即可使用。
