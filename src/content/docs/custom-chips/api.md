---
title: Chips API reference
description: The velxio-chip.h API — pins, attributes, I2C, SPI, UART, timers, framebuffer, ROM.
sidebar:
  order: 6
---

Everything a chip can do is declared in **`velxio-chip.h`**. The host
calls your exported `chip_setup()` once per instance; there you register
pins and peripherals and hook callbacks. All later execution happens in
those callbacks.

## Pins

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

Modes: `VX_INPUT`, `VX_OUTPUT`, `VX_INPUT_PULLUP`, `VX_INPUT_PULLDOWN`,
`VX_ANALOG`, plus `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH` to come up already
driving a known level (no glitch between registration and the first
write).

Watch for edges:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

with `VX_EDGE_RISING`, `VX_EDGE_FALLING` or `VX_EDGE_BOTH`.

## Attributes

User-editable parameters. Defaults live in the part inspector; declare a
`controls` section in `chip.json` and each one gets a **live slider
while the simulation runs** (see
[Programmable sensors](/docs/custom-chips/programmable-sensors/)):

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Declare them in `chip.json` too so the editor can render them.

## I2C slave

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

The config carries the 7-bit `address`, the `scl`/`sda` pins and four
callbacks: `on_connect(addr, is_read)`, `on_read()` (return the next
byte), `on_write(byte)` (ack/nack), `on_stop()`. Enough to implement any
register-style I2C device — see the PCF8574 and DS3231 examples.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` fires per received byte; `on_tx_done` when your buffer went
out.

## SPI slave

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Exchange buffers while chip-select is asserted — the MCP3008 example
shows the full request/response dance.

## Time and timers

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Timers run on **simulation time**, so your chip stays cycle-consistent
with the boards around it.

## Framebuffer

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

For chips that _are_ displays: write RGBA pixels and the part renders
them on the canvas.

## ROM blobs and logging

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

ROM lets a chip carry external data (character ROMs, microcode) injected
by the host before `chip_setup()`.

## The manifest (`chip.json`)

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

`pins` defines the physical footprint order; names must match what the C
source registers. Optional sections: `attributes` (tunable values),
`controls` (live sliders/buttons during the simulation), `display`
(`{"width", "height"}` for framebuffer chips) and `programTargets`
(retro-CPU chips that run a user program).
