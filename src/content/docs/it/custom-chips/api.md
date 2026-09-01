---
title: Riferimento API dei chip
description: L'API velxio-chip.h — pin, attributi, I2C, SPI, UART, timer, framebuffer, ROM.
sidebar:
  order: 6
---

Tutto ciò che un chip può fare è dichiarato in **`velxio-chip.h`**. L'host
chiama la tua funzione esportata `chip_setup()` una volta per istanza; lì
registri pin e periferiche e colleghi le callback. Tutta l'esecuzione
successiva avviene in quelle callback.

## Pin

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volt
void   vx_pin_dac_write(vx_pin p, double voltage); // uscita analogica
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

Modalità: `VX_INPUT`, `VX_OUTPUT`, `VX_INPUT_PULLUP`, `VX_INPUT_PULLDOWN`,
`VX_ANALOG`, più `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH` per avviarsi già
guidando un livello noto (nessun glitch tra la registrazione e la prima
scrittura).

Osserva i fronti:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

con `VX_EDGE_RISING`, `VX_EDGE_FALLING` o `VX_EDGE_BOTH`.

## Attributi

Parametri modificabili dall'utente. I valori predefiniti si trovano
nell'ispettore del componente; dichiara una sezione `controls` in
`chip.json` e ognuno ottiene uno **slider live durante la simulazione**
(vedi [Sensori programmabili](/docs/it/custom-chips/programmable-sensors/)):

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // rilettura nelle callback — gli slider lo muovono live

// Attributi stringa (un ID dispositivo, un SSID, un nome preset):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Dichiarali anche in `chip.json` così l'editor può visualizzarli.

## Schiavo I2C

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

La configurazione trasporta l'indirizzo a 7 bit `address`, i pin `scl`/`sda`
e quattro callback: `on_connect(addr, is_read)`, `on_read()` (restituisce
il byte successivo), `on_write(byte)` (ack/nack), `on_stop()`. Abbastanza
per implementare qualsiasi dispositivo I2C a registri — vedi gli esempi
PCF8574 e DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` scatta per ogni byte ricevuto; `on_tx_done` quando il tuo
buffer è stato trasmesso.

## Schiavo SPI

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Scambia buffer mentre il chip-select è attivo — l'esempio MCP3008 mostra
l'intera sequenza richiesta/risposta.

## Tempo e timer

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

I timer girano sul **tempo di simulazione**, quindi il tuo chip rimane
coerente a livello di ciclo con le schede circostanti.

## Framebuffer

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

Per chip che _sono_ display: scrivi pixel RGBA e il componente li
renderizza sulla tela.

## Blob ROM e registrazione log

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appare nella console del browser
```

La ROM consente a un chip di trasportare dati esterni (ROM caratteri,
microcodice) iniettati dall'host prima di `chip_setup()`.

## L'aspetto del chip

Il corpo è disegnato da `chip.json`: l'elenco dei pin posiziona i pad e le
loro etichette, e una sezione opzionale `display: { width, height }`
riserva un'area framebuffer. Un chip può anche trasportare un'**immagine**
— PNG, JPEG o SVG aggiunta alla sua sezione file come `chip.png` /
`chip.jpg` / `chip.svg` — che copre il corpo senza spostare alcun pin.
Vedi [Dare un volto al chip](/docs/it/custom-chips/getting-started/#giving-the-chip-a-face).

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

`pins` definisce l'ordine fisico del footprint; i nomi devono corrispondere
a ciò che il sorgente C registra. Sezioni opzionali: `attributes` (valori
regolabili), `controls` (slider/pulsanti live durante la simulazione),
`display` (`{"width", "height"}` per chip framebuffer) e `programTargets`
(chip retro-CPU che eseguono un programma utente).
