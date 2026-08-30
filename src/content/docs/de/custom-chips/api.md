---
title: Referenz zur Chips-API
description: Die velxio-chip.h-API — Pins, Attribute, I2C, SPI, UART, Timer, Framebuffer, ROM.
sidebar:
  order: 6
---

Alles, was ein Chip tun kann, wird in **`velxio-chip.h`** deklariert. Der Host
ruft Ihr exportiertes `chip_setup()` einmal pro Instanz auf; dort registrieren
Sie Pins und Peripheriegeräte und hängen Callbacks an. Die gesamte spätere
Ausführung erfolgt in diesen Callbacks.

## Pins

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

Modi: `VX_INPUT`, `VX_OUTPUT`, `VX_INPUT_PULLUP`, `VX_INPUT_PULLDOWN`,
`VX_ANALOG`, plus `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH`, um bereits mit einem
bekannten Pegel zu starten (kein Glitch zwischen Registrierung und dem ersten
Schreibvorgang).

Auf Flanken achten:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

mit `VX_EDGE_RISING`, `VX_EDGE_FALLING` oder `VX_EDGE_BOTH`.

## Attribute

Vom Benutzer editierbare Parameter. Die Standardwerte befinden sich im
Bauteil-Inspektor; deklarieren Sie einen `controls`-Abschnitt in `chip.json`
und jeder davon erhält einen **Live-Slider während die Simulation läuft**
(siehe [Programmierbare Sensoren](/docs/de/custom-chips/programmable-sensors/)):

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Deklarieren Sie sie ebenfalls in `chip.json`, damit der Editor sie rendern kann.

## I2C-Slave

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

Die Konfiguration enthält die 7-Bit-`address`, die `scl`/`sda`-Pins und vier
Callbacks: `on_connect(addr, is_read)`, `on_read()` (gibt das nächste Byte
zurück), `on_write(byte)` (ACK/NACK), `on_stop()`. Genug, um jedes
registerbasierte I2C-Gerät zu implementieren — siehe die PCF8574- und
DS3231-Beispiele.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` wird pro empfangenem Byte ausgelöst; `on_tx_done`, wenn Ihr
Puffer gesendet wurde.

## SPI-Slave

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Tauschen Sie Puffer aus, während Chip-Select aktiv ist — das MCP3008-Beispiel
zeigt den vollständigen Request/Response-Ablauf.

## Zeit und Timer

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Timer laufen auf der **Simulationszeit**, sodass Ihr Chip zykluskonsistent
mit den umgebenden Boards bleibt.

## Framebuffer

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

Für Chips, die _Displays_ sind: Schreiben Sie RGBA-Pixel und das Bauteil
rendert sie auf der Leinwand.

## ROM-Blobs und Protokollierung

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

ROM ermöglicht einem Chip, externe Daten (Zeichen-ROMs, Mikrocode) zu tragen,
die vom Host vor `chip_setup()` injiziert werden.

## Das Manifest (`chip.json`)

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

`pins` definiert die physische Footprint-Reihenfolge; die Namen müssen mit dem
übereinstimmen, was die C-Quelle registriert. Optionale Abschnitte:
`attributes` (einstellbare Werte), `controls` (Live-Slider/Schaltflächen
während der Simulation), `display` (`{"width", "height"}` für
Framebuffer-Chips) und `programTargets` (Retro-CPU-Chips, die ein
Benutzerprogramm ausführen).

----- END PAGE -----
