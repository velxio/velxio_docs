---
title: "教程：模拟CO2传感器"
description: 构建一个自定义芯片，从实时ppm滑块输出电压，将其连接到Arduino模拟引脚，并实时观察analogRead跟踪滑块。
sidebar:
  order: 4
---

最短的完整可编程传感器：一个从400到5000 ppm的滑块，
一个引脚上的电压，以及一个Arduino读取它。从头到尾十分钟，
之后每个模拟传感器你都会复制这个形状。

:::tip[打开完成的电路]
下面的所有内容，已经连接好并准备运行：
[CO2传感器（实时滑块）](https://velxio.dev/example/co2-sensor-live-slider)。
同一个芯片也是新建芯片对话框中的模板，如果你更愿意
将它放入你自己的项目中。
:::

## 你将构建什么

```
   [ CO2传感器芯片 ]                 [ Arduino Uno ]
        VCC  o------------------------o 5V
        GND  o------------------------o GND
        OUT  o------------------------o A0

   滑块 400..5000 ppm   ->   OUT 0..5 V   ->   analogRead(A0)
```

## 第1步：创建芯片

从编辑器的文件资源管理器中添加一个自定义芯片。一个对话框提供
内置模板以及**Start from blank**（从空白开始）；选择空白模板来
跟随操作。无论哪种方式，你最终都会得到两个文件：清单
（`chip.json`）和源代码（`chip.c`）。

## 第2步：清单

三个引脚，一个属性，一个控件。控件的`id`和
属性的`name`必须匹配；这就是将它们绑定在一起的方式。

```json title="chip.json"
{
  "schema": "velxio-chip/v1",
  "name": "CO2 Sensor",
  "description": "Analog CO2 sensor with a live ppm slider. OUT maps 400-5000 ppm to 0-5 V.",
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

## 第3步：源代码

一个重复的定时器将ppm转换为电压并驱动引脚。注意
`vx_attr_read` 的位置：**在**回调**内部**，这样每次滴答都能看到
滑块的当前位置。

```c title="chip.c"
#include "velxio-chip.h"

#define PPM_MIN   400.0
#define PPM_MAX  5000.0
#define VOLTS_MAX   5.0

typedef struct {
  vx_pin   out;
  vx_attr  ppm;
  vx_timer timer;
} chip_state_t;

static chip_state_t S;

static void on_tick(void *user_data) {
  (void)user_data;
  double ppm = vx_attr_read(S.ppm);          /* live slider value */
  if (ppm < PPM_MIN) ppm = PPM_MIN;
  if (ppm > PPM_MAX) ppm = PPM_MAX;
  double volts = (ppm - PPM_MIN) / (PPM_MAX - PPM_MIN) * VOLTS_MAX;
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out   = vx_pin_register("OUT", VX_ANALOG);
  S.ppm   = vx_attr_register("ppm", 1000);
  S.timer = vx_timer_create(on_tick, 0);
  vx_timer_start(S.timer, 50000000ULL, true);  /* 50 ms, in nanoseconds */
  on_tick(0);                                  /* drive the initial level */
  vx_log("co2 sensor ready");
}
```

三个重要的细节：

- 引脚上的`VX_ANALOG`。数字引脚不能承载中间
  电压，对其调用`vx_pin_dac_write`不会达到你想要的效果。
- `vx_timer_start`接受**纳秒**。`50000000ULL`是50毫秒。这是
  第一个芯片中最常见的拼写错误。
- 返回前直接调用`on_tick(0)`。没有它，引脚将保持在0 V
  直到第一个定时器触发，而一个快速的草图会将其读取为虚假的
  400 ppm。

按下**Compile**（编译）。

## 第4步：接线

将芯片拖到画布上，放在Arduino Uno旁边，并连接`VCC`到
`5V`，`GND`到`GND`，以及`OUT`到`A0`。

![CO2传感器芯片连接到Arduino Uno：VCC到5V，GND到GND，OUT到A0](../../../../../assets/docs/custom-chips/sensor-circuit.png)

## 第5步：草图

```cpp title="sketch.ino"
void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(A0);
  float volts = raw * (5.0f / 1023.0f);
  float ppm = 400.0f + volts / 5.0f * 4600.0f;
  Serial.print("raw="); Serial.print(raw);
  Serial.print("  ppm="); Serial.println(ppm, 0);
  delay(500);
}
```

## 第6步：运行并拖动

按下**Run**（运行），然后**点击芯片**。滑块面板打开：

![芯片在模拟运行时的实时面板：一个以ppm为单位的CO2滑块](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

拖动它，串行输出在一个`delay(500)`内跟随：

![串行监视器跟踪滑块：ppm读数从1000跳到3000](../../../../../assets/docs/custom-chips/sensor-serial-tracking.png)

这就是整个循环：滑块写入属性，定时器每秒读取
20次，引脚电压改变，`analogRead`看到它。

## 当它不工作时

| 你看到的现象 | 几乎总是 |
| --- | --- |
| 点击芯片没有任何反应 | 模拟已停止：面板仅在运行时打开 |
| 滑块出现但读数从不变化 | `vx_attr_read`在`chip_setup()`中被调用并缓存，而不是在`on_tick`内部 |
| `analogRead`只返回0或1023 | 引脚被注册为数字模式而不是`VX_ANALOG` |
| 值更新一次然后冻结 | `vx_timer_start`被调用时`repeat`为false，或者间隔以毫秒为单位写入，因此下一次滴答在50000秒之后 |
| 串行显示400 ppm持续片刻 | 缺少初始的`on_tick(0)`调用 |

## 下一步

- 数字协议背后的相同思路：
  [通过I2C的温度和湿度](/docs/zh-cn/custom-chips/programmable-sensors/i2c-env/)。
- 你可以在`controls`中放入的每个字段：
  [参考](/docs/zh-cn/custom-chips/programmable-sensors/reference/)。
- 为其他项目保留它：[我的芯片](/docs/zh-cn/custom-chips/my-chips/)。
