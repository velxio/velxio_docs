---
title: 可编程传感器
description: 构建一个在仿真运行期间可通过滑块改变读数的传感器，并准确了解滑块值如何到达正在运行的芯片。
sidebar:
  order: 3
---

**可编程传感器**是一种普通的自定义芯片，其读数由您在*仿真运行期间*通过滑块驱动。一个CO2传感器，您通过扫描其ppm值来测试报警阈值。一个温度探头，您将其推过85摄氏度以观察固件的反应。一个您手动调暗的光线传感器。

芯片本身没有任何变化：它是在[入门指南](/docs/zh-cn/custom-chips/getting-started/)中描述的同一个WebAssembly组件。本页新增的内容是将滑块值传入已运行芯片的线路，无需重新编译或重启任何内容。

## 约定，分三部分

每个可编程传感器都由以下三部分组成，仅此而已。

**1. 一个属性** 保存可调值。

```c
S.ppm = vx_attr_register("ppm", 1000);
```

**2. `chip.json` 中的 `controls` 条目** 在屏幕上放置一个滑块。它通过**相同的id**来寻址该属性：

```json
"controls": [
  { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
    "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
]
```

**3. 您的代码在每次需要该值时重新读取属性**：

```c
double ppm = vx_attr_read(S.ppm);   /* 当前滑块的值 */
```

按下 **Run**（运行），点击芯片，将打开以下界面：

![运行中的CO2传感器芯片的实时控制面板：一个从400到5000 ppm的滑块](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

第三点是容易出错的地方。如果在`chip_setup()`中只读取一次属性并将其缓存在变量中，滑块会出现、移动，但完全不起作用。`vx_attr_read`开销很小；请在定时器回调、I2C读取处理程序或任何实际需要该值的地方调用它。

:::tip[您可能已经有滑块了]
如果您完全跳过`controls`部分，**任何同时声明了`min`和`max`的属性仍然会获得滑块**。您在此功能出现之前编写的芯片通常已经可以调节。`controls`用于重命名滑块、为其添加单位、使其变为对数刻度，或将其转换为按钮。
:::

## 值如何到达您的芯片

这一点值得理解，因为两种仿真引擎采用不同的路径，故障模式也不同。

| 步骤 | 发生什么 |
| --- | --- |
| 您拖动滑块 | 面板写入传感器更新注册表，以该芯片实例为键 |
| 浏览器引擎（AVR、RP2040、浏览器内ESP32） | 该值直接写入属性映射，正在运行的WebAssembly在每次`vx_attr_read`时读取该映射。无需消息传递，无需重启 |
| QEMU下的ESP32 | 芯片位于工作线程中，因此该值作为属性更新转发给它并在那里应用 |
| 每250毫秒静默期 | 最后的值被镜像到组件的已保存属性中，因此滑块位置在保存和重新加载后得以保留 |

有两个值得了解的后果：

- **没有“应用”步骤。** 下一次`vx_attr_read`将返回新值。如果您的芯片每秒只读取一次属性，那么滑块需要那么长时间才能产生可见效果。
- **面板是每个实例独立的。** 画布上同一芯片的两个副本具有独立的滑块，因为控件是根据每个实例自身的清单合成的。

## 设计时默认值与实时值

它们是不同的界面，人们常常混淆：

- **停止状态**：右键单击芯片以打开部件检查器。您在此处设置的是属性的已保存默认值，即芯片启动时的值。
- **运行状态**：单击芯片。滑块面板打开。您在此处设置的是实时值，立即生效。

## 先试一个

每种模式在示例库中都有一个可运行的电路。按下 **Run**（运行），然后点击芯片：

| 示例 | 它教授的内容 |
| --- | --- |
| [CO2传感器（实时滑块）](https://velxio.dev/example/co2-sensor-live-slider) | 模拟配方：滑块到电压再到`analogRead` |
| [I2C环境传感器（实时滑块）](https://velxio.dev/example/i2c-env-sensor-live-sliders) | 位于`0x44`寄存器映射后的两个滑块 |
| [运动传感器（模拟按钮）](https://velxio.dev/example/motion-sensor-sim-button) | `button`控件：瞬时触发加保持滑块 |
| [夜灯（对数勒克斯滑块）](https://velxio.dev/example/night-light-log-slider) | `scale: "log"`：一个滑块上跨越五个数量级的勒克斯值，低于50 lx时灯触发 |
| [SPI温度计（实时滑块）](https://velxio.dev/example/spi-thermometer-live-slider) | SPI从机时序：在CS下降沿锁存 |
| [UART空气传感器（实时滑块）](https://velxio.dev/example/uart-air-sensor-live-slider) | 推式串行传感器接入SoftwareSerial |

## 下一步

- [教程：模拟CO2传感器](/docs/zh-cn/custom-chips/programmable-sensors/co2-analog/)
  — 最短的完整示例，从空芯片到`analogRead`跟踪滑块。
- [教程：通过I2C传输温度和湿度](/docs/zh-cn/custom-chips/programmable-sensors/i2c-env/)
  — 适用于任何数字协议传感器的模式，带有两个滑块和寄存器映射。
- [`controls`参考](/docs/zh-cn/custom-chips/programmable-sensors/reference/)
  — 每个字段、自动回退规则，以及滑块无响应时应检查的内容。

:::note[免费]
本页所有内容均免费，适用于所有计划：编写芯片、编译、运行以及拖动其滑块。付费的是让AI为您编写芯片（Maker及以上计划）以及[我的芯片](/docs/zh-cn/custom-chips/my-chips/)服务器端库（Pro计划）。
:::
