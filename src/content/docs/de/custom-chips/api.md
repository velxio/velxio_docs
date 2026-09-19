---
title: Chips-API-Referenz
description: "Die velxio-chip.h-API — Pins, Attribute, I2C, SPI, UART, Timer, Framebuffer, ROM."
sidebar:
  order: 6
---

Alles, was ein Chip tun kann, ist in **`velxio-chip.h`** deklariert. Der Host
ruft dein exportiertes `chip_setup()` einmal pro Instanz auf; dort registrierst
du Pins und Peripheriegeräte und hängst Callbacks ein. Die gesamte spätere
Ausführung findet in diesen Callbacks statt.

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
Schreiben).

Auf Flanken achten:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

mit `VX_EDGE_RISING`, `VX_EDGE_FALLING` oder `VX_EDGE_BOTH`.

## Attribute

Vom Benutzer editierbare Parameter. Die Standardwerte leben im Part Inspector;
deklariere einen `controls`-Abschnitt in `chip.json`, und jeder davon bekommt
einen **Live-Slider, während die Simulation läuft** (siehe
[Programmierbare Sensoren](/docs/de/custom-chips/programmable-sensors/)):

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Deklariere sie ebenfalls in `chip.json`, damit der Editor sie darstellen kann.

## I2C-Slave

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

Die Konfiguration enthält die 7-Bit-`address`, die Pins `scl`/`sda` und vier
Callbacks: `on_connect(addr, is_read)`, `on_read()` (gibt das nächste Byte
zurück), `on_write(byte)` (ack/nack), `on_stop()`. Genug, um jedes
registerbasierte I2C-Gerät zu implementieren — siehe die Beispiele PCF8574 und
DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` wird pro empfangenem Byte ausgelöst; `on_tx_done`, wenn dein
Puffer rausgegangen ist.

## SPI-Slave

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Puffer austauschen, während Chip-Select aktiv ist — das MCP3008-Beispiel zeigt
den vollständigen Request/Response-Ablauf.

## Zeit und Timer

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Timer laufen auf der **Simulationszeit**, damit dein Chip zykluskonsistent mit
den umliegenden Boards bleibt.

## Framebuffer

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

Für Chips, die _Displays sind_: Schreibe RGBA-Pixel, und das Bauteil rendert
sie auf dem Canvas.

Die Größe ist diejenige, die `chip.json` unter `display: { width, height }`
deklariert — das ist es, was `vx_framebuffer_init` zurückgibt, und Schreibvorgänge
darüber hinaus werden verworfen. Ein Chip, der kein `display` deklariert,
bekommt einen 128x64-Puffer. **Ein aus Wokwi portierter Chip braucht diesen
Schlüssel zusätzlich**: Wokwis `chip.json` hat keine Display-Größe, also zeichnet
ein 480x320-ILI9488-Port ohne ihn in einen 128x64-Puffer und zeigt fast nichts.

Wo der Chip läuft, entscheidet hier nichts. Im Browser (AVR, Pico, die
In-Browser-ESP32-Engines) malt das Bauteil den Puffer direkt auf seinen Canvas;
auf dem QEMU-ESP32-Pfad läuft der Chip neben dem Gast, und der Worker streamt die
von ihm berührten Zeilen zurück zum Bauteil, mit bis zu 20 Bildern pro Sekunde.
Beide malen höchstens einmal pro Animationsframe, egal wie oft der Chip
`vx_buffer_write` aufruft.

## ROM-Blobs und Logging

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

ROM erlaubt es einem Chip, externe Daten (Zeichen-ROMs, Microcode) mitzuführen,
die vom Host vor `chip_setup()` injiziert werden.

## Das Gesicht des Chips

Der Körper wird aus `chip.json` gezeichnet: Die Pin-Liste platziert die Pads und
ihre Beschriftungen, und ein optionales `display: { width, height }` reserviert
einen Framebuffer-Bereich. Ein Chip kann auch ein **Bild** mitführen — ein PNG,
JPEG oder SVG, das in seinem Dateiabschnitt als `chip.png` / `chip.jpg` /
`chip.svg` hinzugefügt wird —, das den Körper überdeckt, ohne einen Pin zu
verschieben. Siehe
[Dem Chip ein Gesicht geben](/docs/de/custom-chips/getting-started/#giving-the-chip-a-face).

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
übereinstimmen, was der C-Quellcode registriert. Optionale Abschnitte:
`attributes` (einstellbare Werte), `controls` (Live-Slider/Buttons während der
Simulation), `display` (`{"width", "height"}` für Framebuffer-Chips) und
`programTargets` (Retro-CPU-Chips, die ein Benutzerprogramm ausführen).
