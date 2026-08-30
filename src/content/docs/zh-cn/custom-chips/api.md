---
title: 芯片 API 参考
description: velxio-chip.h API — 引脚、属性、I2C、SPI、UART、定时器、帧缓冲、ROM。
sidebar:
  order: 6
---

芯片所能做的一切都在 **`velxio-chip.h`** 中声明。主机会为每个实例调用你导出的 `chip_setup()` 一次；在那里你可以注册引脚和外设并挂接回调。所有后续执行都发生在这些回调中。

## 引脚

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

模式：`VX_INPUT`、`VX_OUTPUT`、`VX_INPUT_PULLUP`、`VX_INPUT_PULLDOWN`、`VX_ANALOG`，以及 `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH`，用于在启动时就已经驱动已知电平（在注册和首次写入之间不会出现毛刺）。

监视边沿：

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

使用 `VX_EDGE_RISING`、`VX_EDGE_FALLING` 或 `VX_EDGE_BOTH`。

## 属性

用户可编辑的参数。默认值位于部件检查器中；在 `chip.json` 中声明一个 `controls` 部分，每个控件在**仿真运行期间都会获得一个实时滑块**（参见[可编程传感器](/docs/zh-cn/custom-chips/programmable-sensors/)）：

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

也要在 `chip.json` 中声明它们，以便编辑器能够渲染它们。

## I2C 从机

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

该配置包含 7 位 `address`、`scl`/`sda` 引脚以及四个回调：`on_connect(addr, is_read)`、`on_read()`（返回下一个字节）、`on_write(byte)`（应答/非应答）、`on_stop()`。足以实现任何寄存器式 I2C 设备——参见 PCF8574 和 DS3231 示例。

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` 在每收到一个字节时触发；`on_tx_done` 在你的缓冲区发送完毕时触发。

## SPI 从机

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

在片选信号有效期间交换缓冲区——MCP3008 示例展示了完整的请求/响应流程。

## 时间和定时器

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

定时器基于**仿真时间**运行，因此你的芯片能够与周围电路板保持周期一致性。

## 帧缓冲

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

适用于本身就是显示器的芯片：写入 RGBA 像素，部件就会在画布上渲染它们。

## ROM 数据块和日志

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

ROM 允许芯片携带外部数据（字符 ROM、微码），这些数据由主机会在 `chip_setup()` 之前注入。

## 清单文件（`chip.json`）

```json
{
  "schema": "velxio-chip/v1",
  "name": "My Chip",
  "author": "you",
  "description": "What it does",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

`pins` 定义了物理封装引脚顺序；名称必须与 C 源码中注册的引脚匹配。可选部分：`attributes`（可调值）、`controls`（仿真期间的实时滑块/按钮）、`display`（`{"width", "height"}`，用于帧缓冲芯片）和 `programTargets`（运行用户程序的复古 CPU 芯片）。
