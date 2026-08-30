---
title: 创建您的第一个自定义芯片
description: 添加一个自定义芯片元件，编写几行C代码，Velxio会将其编译为WebAssembly。
sidebar:
  order: 2
---

**自定义芯片**是您自行编程的组件。您针对`velxio-chip.h` API编写纯C代码，Velxio在云端将其编译为WebAssembly，结果的行为与任何目录部件一样：它有您可以接线的引脚、可以编辑的属性，以及在仿真内部运行的逻辑。

## 何时构建一个

- 您需要的IC不在目录中（一个冷门的移位寄存器、专有传感器协议）。
- 您想要一个测试夹具——脉冲发生器、协议练习器、带有脚本化数值的假传感器。
- 您正在教授数字逻辑，希望学生_实现_芯片，而不仅仅是使用它。

## 五分钟版本

1. 打开[组件选择器](/docs/zh-cn/circuit-editor/placing-components/)并将**Custom Chip**添加到画布上。
2. 示例库会打开——选择一个起点（或从空白开始）。
3. 您会进入常规代码编辑器：芯片在文件资源管理器中拥有自己的部分，包含两个普通文件——
   - **`chip.c`** — 行为；
   - **`chip.json`** — 清单：名称、引脚、属性（输入时通过补全进行验证）。
   这是内置的**Inverter**示例：

```c
#include "velxio-chip.h"
#include <stdlib.h>

typedef struct { vx_pin in, out; } chip_state_t;

static void on_in_change(void* ud, vx_pin pin, int value) {
  chip_state_t* s = ud;
  vx_pin_write(s->out, value ? VX_LOW : VX_HIGH);
}

void chip_setup(void) {
  chip_state_t* s = malloc(sizeof *s);
  s->in  = vx_pin_register("IN",  VX_INPUT);
  s->out = vx_pin_register("OUT", VX_OUTPUT);
  vx_pin_write(s->out, vx_pin_read(s->in) ? VX_LOW : VX_HIGH);
  vx_pin_watch(s->in, VX_EDGE_BOTH, on_in_change, s);
  vx_log("inverter ready");
}
```

及其清单：

```json
{
  "schema": "velxio-chip/v1",
  "name": "Inverter",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

4. 将`IN`连接到按钮，将`OUT`连接到LED，然后按**Run**（运行）——每当芯片源代码更改时，芯片会自动编译（芯片文件资源管理器部分中的锤子按钮可以单独编译它，错误会像任何C编译器一样显示在输出控制台中）。
5. 切换开关。在仿真停止时点击芯片，跳回其`chip.c`；编辑并再次运行。

## 芯片如何执行

主机为每个芯片实例调用一次`chip_setup()`。之后芯片是**响应式**的：您的代码只在回调中运行——被监视的引脚发生变化、I2C字节到达、定时器触发。没有可以阻塞的主循环，这正是自定义芯片足够廉价、可以在电路中大量使用的原因。

## 内置示例芯片

芯片编辑器附带可加载和修改的工作源码：逻辑门（反相器、异或门）、移位寄存器（74HC595、CD4094）、I2C部件（PCF8574、DS3231 RTC、24Cxx EEPROM）、SPI ADC（MCP3008）、UART ROT13转换器、脉冲计数器——以及一个**复古CPU系列**（Intel 4004及其同类），供真正喜欢冒险的人使用。

下一步：[芯片API参考](/docs/zh-cn/custom-chips/api/)。
