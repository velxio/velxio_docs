---
title: Referencia de la API de chips
description: La API de velxio-chip.h — pines, atributos, I2C, SPI, UART, temporizadores, framebuffer, ROM.
sidebar:
  order: 6
---

Todo lo que un chip puede hacer se declara en **`velxio-chip.h`**. El host
llama a tu `chip_setup()` exportado una vez por instancia; allí registras
pines y periféricos y enganchas callbacks. Toda la ejecución posterior
ocurre en esos callbacks.

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
`VX_ANALOG`, además de `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH` para arrancar ya
forzando un nivel conocido (sin glitch entre el registro y la primera
escritura).

Vigila flancos:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

con `VX_EDGE_RISING`, `VX_EDGE_FALLING` o `VX_EDGE_BOTH`.

## Atributos

Parámetros editables por el usuario. Los valores por defecto viven en el
inspector de la pieza; declara una sección `controls` en `chip.json` y cada
uno obtiene un **deslizador en vivo mientras la simulación se ejecuta**
(consulta
[Sensores programables](/docs/es/custom-chips/programmable-sensors/)):

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Decláralos también en `chip.json` para que el editor pueda mostrarlos.

## Esclavo I2C

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

La configuración incluye la `address` de 7 bits, los pines `scl`/`sda` y
cuatro callbacks: `on_connect(addr, is_read)`, `on_read()` (devuelve el
siguiente byte), `on_write(byte)` (ack/nack), `on_stop()`. Suficiente para
implementar cualquier dispositivo I2C estilo registro — consulta los
ejemplos PCF8574 y DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` se dispara por cada byte recibido; `on_tx_done` cuando tu
búfer se ha enviado.

## Esclavo SPI

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Intercambia búferes mientras chip-select está activo — el ejemplo MCP3008
muestra la danza completa de petición/respuesta.

## Tiempo y temporizadores

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Los temporizadores funcionan en **tiempo de simulación**, así tu chip se
mantiene consistente en ciclos con las placas que lo rodean.

## Framebuffer

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

Para chips que _son_ pantallas: escribe píxeles RGBA y la pieza los
renderiza en el lienzo.

El tamaño es el que declara `chip.json` bajo `display: { width, height }`
— eso es lo que devuelve `vx_framebuffer_init`, y las escrituras más allá
se descartan. Un chip que no declara `display` obtiene un búfer de 128x64.
**Un chip portado desde Wokwi necesita que se le añada esta clave**: el
`chip.json` de Wokwi no tiene tamaño de pantalla, así que un port de
ILI9488 de 480x320 sin ella dibuja en un búfer de 128x64 y muestra casi
nada.

Dónde se ejecuta el chip no decide nada aquí. En el navegador (AVR, Pico,
los motores ESP32 en el navegador) la pieza pinta el búfer directamente en
su lienzo; en la ruta QEMU ESP32 el chip se ejecuta junto al guest y el
worker envía de vuelta a la pieza las filas que tocó, a hasta 20
fotogramas por segundo. Ambos pintan como máximo una vez por fotograma de
animación, por muy a menudo que el chip llame a `vx_buffer_write`.

## Blobs de ROM y registro

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

La ROM permite que un chip lleve datos externos (ROMs de caracteres,
microcódigo) inyectados por el host antes de `chip_setup()`.

## La cara del chip

El cuerpo se dibuja desde `chip.json`: la lista de pines coloca los pads y
sus etiquetas, y un `display: { width, height }` opcional reserva un área
de framebuffer. Un chip también puede llevar una **imagen** — un PNG, JPEG
o SVG añadido a su sección de archivos como `chip.png` / `chip.jpg` /
`chip.svg` — que cubre el cuerpo sin mover ningún pin. Consulta
[Darle una cara al chip](/docs/es/custom-chips/getting-started/#giving-the-chip-a-face).

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

`pins` define el orden físico de la huella; los nombres deben coincidir
con los que registra el código C. Secciones opcionales: `attributes`
(valores ajustables), `controls` (deslizadores/botones en vivo durante la
simulación), `display` (`{"width", "height"}` para chips con framebuffer)
y `programTargets` (chips de CPU retro que ejecutan un programa de
usuario).
