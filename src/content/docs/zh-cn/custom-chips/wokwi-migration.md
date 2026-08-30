---
title: 将Wokwi芯片引入Velxio
description: 为Wokwi自定义芯片C API编写的芯片可在Velxio上无需修改即可编译，Wokwi项目压缩包导入时也会包含其芯片。
sidebar:
  order: 5
---

如果您为Wokwi编写过自定义芯片，它们可以直接使用：Velxio与Wokwi自定义芯片C API文档**源代码兼容**。

## 相同的C语言，无需修改

`#include "wokwi-api.h"` 解析为一个洁净室兼容头文件，在编译时将每个文档化的符号适配到Velxio原生的`vx_*` API上：

- `chip_init()` 是入口点，与Wokwi上完全相同。
- `pin_init`、`pin_read`、`pin_write`、`pin_mode`、`pin_watch`（及其`pin_watch_config_t`）、`pin_adc_read`、`pin_dac_write` — 全部可用。
- `i2c_init`、`uart_init`、`spi_init` 接受其配置结构体；字段（`connect`/`read`/`write`/`disconnect`、`rx_data`/`write_done`、`done`）一一对应转换。
- `attr_init` / `attr_read`（以及`_float`和字符串变体）、`timer_init` / `timer_start`（微秒，已为您转换）/ `timer_start_ns` / `timer_stop`、`get_sim_nanos`、`framebuffer_init` / `buffer_write` / `buffer_read`。
- `INPUT`/`OUTPUT`/`INPUT_PULLUP`/`INPUT_PULLDOWN`/`ANALOG`、`OUTPUT_LOW`/`OUTPUT_HIGH`、`LOW`/`HIGH`、`RISING`/`FALLING`/`BOTH`、`NO_PIN` — 值完全相同。

像编译任何Velxio芯片一样编译它：将C代码粘贴到自定义芯片的`chip.c`中，然后按**Run**（运行）。

## chip.json兼容性

`name`、位置式`pins`数组（支持`""`槽位跳过）、`attributes`、`controls`（实时滑块）和`display`均与Wokwi上工作方式相同。`symbol`和自定义SVG图形将被忽略 — Velxio会根据您的引脚数量绘制自己的通用芯片主体。

## 项目压缩包

**File → Open project**（文件 → 打开项目）接受Wokwi项目压缩包。`diagram.json`中的`chip-<name>`部件将变为自定义芯片，其源代码从同级的`<name>.chip.c` / `<name>.chip.json`加载，导线保持不变。导出时会将相同的布局写回。

## 不支持的内容

- **预编译的`.wasm`二进制文件** — Velxio的导入命名空间不同；请从源代码重新编译（只需几秒钟，压缩包导入会在首次**Run**（运行）时自动完成）。
- 实验性的`_mcu_*`内省API。

## 新芯片建议使用原生API

兼容层是为了让您现有的工作能够运行。对于新芯片，原生[`velxio-chip.h` API](/docs/zh-cn/custom-chips/api/)包含相同的设计理念，但类型更清晰（电压使用`double`，定时器使用纳秒）— 这也是示例、AI代理和[My Chips](/docs/zh-cn/custom-chips/my-chips/)（我的芯片）原生使用的API。
