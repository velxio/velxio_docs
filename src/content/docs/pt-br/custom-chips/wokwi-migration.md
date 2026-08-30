---
title: Trazendo chips Wokwi para o Velxio
description: Chips escritos para a API C de chips personalizados Wokwi compilam no Velxio sem alterações, e zips de projetos Wokwi são importados com seus chips.
sidebar:
  order: 5
---

Se você escreveu chips personalizados para Wokwi, eles vêm junto: o Velxio é
**compatível em nível de código-fonte** com a API C documentada de chips personalizados Wokwi.

## Mesmo C, sem alterações

`#include "wokwi-api.h"` resolve para um cabeçalho de compatibilidade limpo
que adapta cada símbolo documentado para a API nativa `vx_*` do Velxio em
tempo de compilação:

- `chip_init()` é o ponto de entrada, exatamente como no Wokwi.
- `pin_init`, `pin_read`, `pin_write`, `pin_mode`, `pin_watch` (com sua
  `pin_watch_config_t`), `pin_adc_read`, `pin_dac_write` — todos presentes.
- `i2c_init`, `uart_init`, `spi_init` recebem suas structs de configuração; campos
  (`connect`/`read`/`write`/`disconnect`, `rx_data`/`write_done`,
  `done`) são traduzidos um a um.
- `attr_init` / `attr_read` (e as variantes `_float` e de string),
  `timer_init` / `timer_start` (microssegundos, convertidos para você) /
  `timer_start_ns` / `timer_stop`, `get_sim_nanos`,
  `framebuffer_init` / `buffer_write` / `buffer_read`.
- `INPUT`/`OUTPUT`/`INPUT_PULLUP`/`INPUT_PULLDOWN`/`ANALOG`,
  `OUTPUT_LOW`/`OUTPUT_HIGH`, `LOW`/`HIGH`, `RISING`/`FALLING`/`BOTH`,
  `NO_PIN` — valores idênticos.

Compile como qualquer chip Velxio: cole o C no `chip.c` de um Chip Personalizado
e pressione **Run** (Executar).

## Compatibilidade com chip.json

`name`, o array posicional `pins` (com pulos de slot `""`),
`attributes`, `controls` (sliders ao vivo) e `display` funcionam como no
Wokwi. `symbol` e arte SVG personalizada são ignorados — o Velxio desenha seu
próprio corpo de chip genérico dimensionado para sua contagem de pinos.

## Zips de projetos

**File → Open project** (Arquivo → Abrir projeto) aceita um zip de projeto Wokwi. Uma parte `chip-<name>`
no `diagram.json` torna-se um Chip Personalizado com seus fontes carregados
do `<name>.chip.c` / `<name>.chip.json` adjacente, com os fios intactos.
As exportações gravam o mesmo layout de volta.

## O que não é transferido

- **Binários `.wasm` pré-compilados** — o namespace de importação do Velxio difere;
  recompile a partir do código-fonte (leva segundos, e a importação de zip faz isso
  no primeiro **Run**).
- A API de introspecção experimental `_mcu_*`.

## Prefira a API nativa para novos chips

A camada de compatibilidade existe para que seu trabalho existente funcione. Para novos
chips, a [API nativa `velxio-chip.h`](/docs/pt-br/custom-chips/api/) é o
mesmo conjunto de ideias com tipos mais claros (tensões como `double`, temporizadores
em nanossegundos) — e é o que os exemplos, o agente de IA e
[My Chips](/docs/pt-br/custom-chips/my-chips/) falam nativamente.

----- END PAGE -----
