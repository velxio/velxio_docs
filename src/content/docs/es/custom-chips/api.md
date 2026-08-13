---
title: Referencia de la API de Chips
description: La API velxio-chip.h — pines, atributos, I2C, SPI, UART, temporizadores, framebuffer, ROM.
sidebar:
  order: 3
---

Todo lo que un chip puede hacer se declara en **`velxio-chip.h`**. El host
llama a tu `chip_setup()` exportado una vez por instancia; allí registras
pines y periféricos y conectas callbacks. Toda la ejecución posterior ocurre
en esos callbacks.

## Pines

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

Modos: `VX_INPUT`, `VX_OUTPUT`, `VX_INPUT_PULLUP`, `VX_INPUT_PULLDOWN`,
`VX_ANALOG`, más `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH` para iniciar ya
conduciendo un nivel conocido (sin glitch entre el registro y la primera
escritura).

Observa flancos:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

con `VX_EDGE_RISING`, `VX_EDGE_FALLING` o `VX_EDGE_BOTH`.

## Atributos

Parámetros editables por el usuario que aparecen en el panel de propiedades de la pieza:

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);
```

Decláralos también en `chip.json` para que el editor pueda mostrarlos.

## Esclavo I2C

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

La configuración incluye la `address` de 7 bits, los pines `scl`/`sda` y cuatro
callbacks: `on_connect(addr, is_read)`, `on_read()` (devuelve el siguiente
byte), `on_write(byte)` (ack/nack), `on_stop()`. Suficiente para implementar cualquier
dispositivo I2C tipo registro — consulta los ejemplos PCF8574 y DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` se dispara por cada byte recibido; `on_tx_done` cuando tu buffer
ha salido.

## Esclavo SPI

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Intercambia buffers mientras la selección de chip está activa — el ejemplo
MCP3008 muestra el flujo completo de petición/respuesta.

## Tiempo y temporizadores

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Los temporizadores se ejecutan en **tiempo de simulación**, por lo que tu chip
se mantiene consistente a nivel de ciclo con las placas que lo rodean.

## Framebuffer

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
```

Para chips que _son_ pantallas: escribe píxeles RGBA y la pieza los renderiza
en el lienzo.

## Blobs ROM y registro de eventos

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // aparece en la consola del navegador
```

La ROM permite que un chip lleve datos externos (ROMs de caracteres, microcódigo) inyectados
por el host antes de `chip_setup()`.

## El manifiesto (`chip.json`)

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

`pins` define el orden físico del footprint; los nombres deben coincidir con lo que el
código fuente C registra.
