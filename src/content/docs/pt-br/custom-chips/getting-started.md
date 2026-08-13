---
title: Crie seu primeiro chip personalizado
description: Adicione um componente de Chip Personalizado, escreva algumas linhas de C, e o Velxio o compila para WebAssembly.
sidebar:
  order: 2
---

Um **chip personalizado** é um componente que você mesmo programa. Você escreve C puro
usando a API `velxio-chip.h`, o Velxio o compila para WebAssembly na
nuvem, e o resultado se comporta como qualquer componente do catálogo: ele tem pinos que você conecta,
atributos que você edita, e lógica que executa dentro da simulação.

## Quando criar um

- O CI que você precisa não está no catálogo (um registrador de deslocamento obscuro, um
  protocolo de sensor proprietário).
- Você quer um dispositivo de teste — um gerador de pulsos, um exercitador de protocolo, um
  sensor falso com valores programados.
- Você está ensinando lógica digital e quer que os alunos _implementem_ o
  chip, não apenas o usem.

## A versão de cinco minutos

1. Abra o [seletor de componentes](/docs/pt-br/circuit-editor/placing-components/)
   e adicione um **Custom Chip** (Chip Personalizado) à tela.
2. Abra o editor do chip (clique com o botão direito no chip). Você recebe dois arquivos:
   - **C source** (Código-fonte C) — o comportamento;
   - **`chip.json`** — o manifesto: nome, pinos, atributos.
3. Comece pelo exemplo integrado **Inverter** (Inversor):

```c
#include "velxio-chip.h"
#include <stdlib.h>

typedef struct { vx_pin in, out; } chip_state_t;

static void on_in_change(void* ud, vx_pin pin, int value) {
  chip_state_t* s = ud;
  vx_pin_write(s->out, value ? VX_LOW : VX_HIGH);
}

void chip_setup(void) {
  chip_state_t* s = malloc(sizeof *s);
  s->in  = vx_pin_register("IN",  VX_INPUT);
  s->out = vx_pin_register("OUT", VX_OUTPUT);
  vx_pin_write(s->out, vx_pin_read(s->in) ? VX_LOW : VX_HIGH);
  vx_pin_watch(s->in, VX_EDGE_BOTH, on_in_change, s);
  vx_log("inverter ready");
}
```

com seu manifesto:

```json
{
  "schema": "velxio-chip/v1",
  "name": "Inverter",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

4. **Compile** (Compilar) no diálogo — os erros retornam como os de qualquer compilador C.
5. Conecte `IN` a um botão e `OUT` a um LED, pressione **Run** (Executar) e alterne
   à vontade.

## Como os chips executam

O host chama seu `chip_setup()` uma vez por instância do chip. Depois disso, o
chip é **reativo**: seu código só executa dentro de callbacks — um pino monitorado
mudou, um byte I2C chegou, um timer disparou. Não há loop principal para
bloquear, o que mantém os chips personalizados baratos o suficiente para serem espalhados por um
circuito.

## Exemplos de chips integrados

O editor de chips inclui fontes funcionais que você pode carregar e modificar: portas
lógicas (inversor, XOR), registradores de deslocamento (74HC595, CD4094), componentes I2C
(PCF8574, DS3231 RTC, EEPROMs 24Cxx), um ADC SPI (MCP3008), um transformador
ROT13 UART, um contador de pulsos — e uma **coleção de CPUs retrô**
(Intel 4004 e amigos) para os verdadeiramente aventureiros.

A seguir: a [referência da API de chips](/docs/pt-br/custom-chips/api/).
----- END PAGE -----
