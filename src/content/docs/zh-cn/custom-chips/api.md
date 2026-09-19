---
title: 芯片 API 参考
description: velxio-chip.h API —— 引脚、属性、I2C、SPI、UART、定时器、帧缓冲、ROM。
sidebar:
  order: 6
---

芯片能做的一切都在 **`velxio-chip.h`** 中声明。宿主会为每个实例调用一次你导出的 `chip_setup()`；在那里你注册引脚和外设并挂接回调。之后所有的执行都发生在这些回调中。

## 引脚

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

模式：`VX_INPUT`、`VX_OUTPUT`、`VX_INPUT_PULLUP`、`VX_INPUT_PULLDOWN`、`VX_ANALOG`，以及 `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH`，用于在启动时就驱动一个已知电平（在注册与首次写入之间不会出现毛刺）。

监听边沿：

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

配合 `VX_EDGE_RISING`、`VX_EDGE_FALLING` 或 `VX_EDGE_BOTH` 使用。

## 属性

用户可编辑的参数。默认值位于元件检查器中；在 `chip.json` 中声明一个 `controls` 段，每个属性都会在**仿真运行时获得一个实时滑块**（参见[可编程传感器](/docs/zh-cn/custom-chips/programmable-sensors/)）：

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

也要在 `chip.json` 中声明它们，以便编辑器能够渲染出来。

## I2C 从机

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

配置中包含 7 位 `address`、`scl`/`sda` 引脚以及四个回调：`on_connect(addr, is_read)`、`on_read()`（返回下一个字节）、`on_write(byte)`（ack/nack）、`on_stop()`。足以实现任何寄存器风格的 I2C 设备——参见 PCF8574 和 DS3231 示例。

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` 每收到一个字节触发一次；`on_tx_done` 在你的缓冲区发送完毕时触发。

## SPI 从机

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

在片选有效期间交换缓冲区——MCP3008 示例展示了完整的请求/响应流程。

## 时间与定时器

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

定时器基于**仿真时间**运行，因此你的芯片与周围的开发板保持周期一致。

## 帧缓冲

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

用于那些_本身就是_显示器的芯片：写入 RGBA 像素，元件会将它们渲染到画布上。

尺寸就是 `chip.json` 在 `display: { width, height }` 下声明的那个——这正是 `vx_framebuffer_init` 返回的值，超出范围的写入会被丢弃。未声明 `display` 的芯片会获得一个 128x64 的缓冲区。**从 Wokwi 移植过来的芯片需要添加这个键**：Wokwi 的 `chip.json` 没有显示尺寸，因此一个 480x320 的 ILI9488 移植版若缺少它，就会绘制到一个 128x64 的缓冲区中，几乎什么都显示不出来。

芯片在哪里运行在这里并不重要。在浏览器中（AVR、Pico、浏览器内的 ESP32 引擎），元件会将缓冲区直接绘制到其画布上；在 QEMU ESP32 路径上，芯片在客户机旁边运行，worker 会将它所触及的行流式传回给元件，最高可达每秒 20 帧。无论芯片调用 `vx_buffer_write` 的频率有多高，两者每个动画帧最多只绘制一次。

## ROM 数据块与日志

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

ROM 让芯片可以携带由宿主在 `chip_setup()` 之前注入的外部数据（字符 ROM、微码）。

## 芯片的外观

主体由 `chip.json` 绘制：引脚列表放置焊盘及其标签，可选的 `display: { width, height }` 预留一块帧缓冲区域。芯片还可以携带一张**图像**——将 PNG、JPEG 或 SVG 作为 `chip.png` / `chip.jpg` / `chip.svg` 添加到其文件区——它会覆盖主体而不移动任何引脚。参见[给芯片一张脸](/docs/zh-cn/custom-chips/getting-started/#giving-the-chip-a-face)。

## 清单（`chip.json`）

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

`pins` 定义了物理封装顺序；名称必须与 C 源代码注册的一致。可选段：`attributes`（可调值）、`controls`（仿真期间的实时滑块/按钮）、`display`（用于帧缓冲芯片的 `{"width", "height"}`）以及 `programTargets`（运行用户程序的复古 CPU 芯片）。
