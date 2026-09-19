---
title: Riferimento API dei chip
description: L'API di velxio-chip.h — pin, attributi, I2C, SPI, UART, timer, framebuffer, ROM.
sidebar:
  order: 6
---

Tutto ciò che un chip può fare è dichiarato in **`velxio-chip.h`**. L'host
chiama la tua `chip_setup()` esportata una volta per istanza; lì registri
pin e periferiche e agganci le callback. Tutta l'esecuzione successiva
avviene in quelle callback.

## Pin

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

Modalità: `VX_INPUT`, `VX_OUTPUT`, `VX_INPUT_PULLUP`, `VX_INPUT_PULLDOWN`,
`VX_ANALOG`, più `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH` per partire già
pilotando un livello noto (nessun glitch tra la registrazione e la prima
scrittura).

Osserva i fronti:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

con `VX_EDGE_RISING`, `VX_EDGE_FALLING` o `VX_EDGE_BOTH`.

## Attributi

Parametri modificabili dall'utente. I valori predefiniti risiedono
nell'ispettore della parte; dichiara una sezione `controls` in `chip.json`
e ciascuno ottiene uno **slider live mentre la simulazione è in
esecuzione** (vedi
[Sensori programmabili](/docs/it/custom-chips/programmable-sensors/)):

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Dichiarali anche in `chip.json` così che l'editor possa renderizzarli.

## Slave I2C

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

La configurazione porta l'`address` a 7 bit, i pin `scl`/`sda` e quattro
callback: `on_connect(addr, is_read)`, `on_read()` (restituisce il byte
successivo), `on_write(byte)` (ack/nack), `on_stop()`. Abbastanza per
implementare qualsiasi dispositivo I2C in stile registro — vedi gli
esempi PCF8574 e DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` scatta per ogni byte ricevuto; `on_tx_done` quando il tuo
buffer è stato inviato.

## Slave SPI

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Scambia buffer mentre il chip-select è asserito — l'esempio MCP3008
mostra l'intera danza richiesta/risposta.

## Tempo e timer

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

I timer funzionano sul **tempo di simulazione**, così il tuo chip rimane
coerente in termini di cicli con le schede che lo circondano.

## Framebuffer

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

Per i chip che _sono_ display: scrivi pixel RGBA e la parte li renderizza
sul canvas.

La dimensione è quella dichiarata da `chip.json` sotto `display: { width, height }`
— è ciò che restituisce `vx_framebuffer_init`, e le scritture oltre quel
limite vengono scartate. Un chip che non dichiara alcun `display` ottiene
un buffer 128x64. **Un chip portato da Wokwi deve avere questa chiave
aggiunta**: il `chip.json` di Wokwi non ha una dimensione del display,
quindi un port ILI9488 480x320 senza di essa disegna in un buffer 128x64
e non mostra quasi nulla.

Dove viene eseguito il chip non decide nulla in questo caso. Nel browser
(AVR, Pico, i motori ESP32 nel browser) la parte dipinge il buffer
direttamente sul suo canvas; sul percorso QEMU ESP32 il chip viene
eseguito accanto al guest e il worker trasmette le righe toccate alla
parte, fino a 20 frame al secondo. Entrambi dipingono al massimo una
volta per frame di animazione, indipendentemente da quanto spesso il chip
chiama `vx_buffer_write`.

## Blob ROM e logging

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

La ROM permette a un chip di trasportare dati esterni (ROM di caratteri,
microcodice) iniettati dall'host prima di `chip_setup()`.

## Il volto del chip

Il corpo è disegnato da `chip.json`: l'elenco dei pin posiziona i pad e le
loro etichette, e un `display: { width, height }` opzionale riserva
un'area framebuffer. Un chip può anche trasportare un'**immagine** — un
PNG, JPEG o SVG aggiunto alla sua sezione file come `chip.png` /
`chip.jpg` / `chip.svg` — che copre il corpo senza spostare alcun pin.
Vedi
[Dare un volto al chip](/docs/it/custom-chips/getting-started/#giving-the-chip-a-face).

## Il manifest (`chip.json`)

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

`pins` definisce l'ordine dell'ingombro fisico; i nomi devono
corrispondere a quelli registrati dal sorgente C. Sezioni opzionali:
`attributes` (valori regolabili), `controls` (slider/pulsanti live durante
la simulazione), `display` (`{"width", "height"}` per i chip con
framebuffer) e `programTargets` (chip retro-CPU che eseguono un programma
utente).
