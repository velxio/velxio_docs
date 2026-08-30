---
title: Referência da API de Chips
description: A API velxio-chip.h — pinos, atributos, I2C, SPI, UART, temporizadores, framebuffer, ROM.
sidebar:
  order: 6
---

Tudo o que um chip pode fazer é declarado em **`velxio-chip.h`**. O host
chama sua função exportada `chip_setup()` uma vez por instância; lá você
registra pinos e periféricos e conecta callbacks. Toda a execução posterior
acontece nesses callbacks.

## Pinos

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

Modos: `VX_INPUT`, `VX_OUTPUT`, `VX_INPUT_PULLUP`, `VX_INPUT_PULLDOWN`,
`VX_ANALOG`, além de `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH` para iniciar já
acionando um nível conhecido (sem glitch entre o registro e a primeira
escrita).

Observe bordas:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

com `VX_EDGE_RISING`, `VX_EDGE_FALLING` ou `VX_EDGE_BOTH`.

## Atributos

Parâmetros editáveis pelo usuário. Os padrões ficam no inspetor de componentes; declare uma
seção `controls` no `chip.json` e cada um ganha um **slider ao vivo
durante a execução da simulação** (veja
[Sensores programáveis](/docs/pt-br/custom-chips/programmable-sensors/)):

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // releia nos callbacks — sliders o movem ao vivo

// Atributos de string (um ID de dispositivo, um SSID, um nome de preset):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Declare-os também no `chip.json` para que o editor possa renderizá-los.

## Escravo I2C

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

A configuração carrega o `address` de 7 bits, os pinos `scl`/`sda` e quatro
callbacks: `on_connect(addr, is_read)`, `on_read()` (retorna o próximo
byte), `on_write(byte)` (ack/nack), `on_stop()`. Suficiente para implementar qualquer
dispositivo I2C estilo registro — veja os exemplos PCF8574 e DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` dispara a cada byte recebido; `on_tx_done` quando seu buffer
foi enviado.

## Escravo SPI

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Troque buffers enquanto o chip-select está ativo — o exemplo MCP3008
mostra toda a dança de requisição/resposta.

## Tempo e temporizadores

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Os temporizadores rodam no **tempo de simulação**, então seu chip permanece
consistente em ciclos com as placas ao redor.

## Framebuffer

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

Para chips que _são_ displays: escreva pixels RGBA e o componente os renderiza
no canvas.

## Blobs de ROM e registro

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // aparece no console do navegador
```

A ROM permite que um chip carregue dados externos (ROMs de caracteres, microcódigo) injetados
pelo host antes de `chip_setup()`.

## O manifesto (`chip.json`)

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

`pins` define a ordem física do footprint; os nomes devem corresponder ao que o
código C registra. Seções opcionais: `attributes` (valores ajustáveis),
`controls` (sliders/botões ao vivo durante a simulação), `display`
(`{"width", "height"}` para chips com framebuffer) e `programTargets`
(chips retro-CPU que executam um programa do usuário).
