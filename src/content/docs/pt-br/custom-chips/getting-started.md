---
title: Crie seu primeiro chip personalizado
description: Adicione um componente Chip Personalizado, escreva algumas linhas de C, e o Velxio o compila para WebAssembly.
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
   e adicione um **Custom Chip** à tela.
2. A galeria de exemplos abre — escolha um ponto de partida (ou comece em branco).
3. Você cai no editor de código normal: o chip tem sua própria seção no
   explorador de arquivos com dois arquivos comuns —
   - **`chip.c`** — o comportamento;
   - **`chip.json`** — o manifesto: nome, pinos, atributos (validados
     com preenchimento automático enquanto você digita).
   Este é o exemplo integrado **Inverter**:

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

4. Conecte `IN` a um botão e `OUT` a um LED, então pressione **Run** (Executar) — o
   chip compila automaticamente sempre que seu código-fonte mudar (o botão
   de martelo na seção do chip no explorador de arquivos o compila por conta própria,
   com erros no console de saída como qualquer compilador C).
5. Alterne à vontade. Clique no chip enquanto a simulação está parada para voltar
   ao seu `chip.c`; edite e execute novamente.

## Dando uma cara ao chip

Por padrão, um chip é desenhado como um corpo escuro com seu nome em uma faixa
de serigrafia e seus rótulos de pinos ao redor da borda. Você pode substituir essa cara por
sua própria arte — uma foto da placa de desenvolvimento real, um desenho
de datasheet, um ícone:

Clique no botão **image** (imagem) na seção do chip no explorador de arquivos (ao lado de
Compile) e escolha um **PNG, JPEG ou SVG** de até 256 KB. Ele se junta ao `chip.c`
e ao `chip.json` como outro arquivo na seção desse chip — `chip.png`,
`chip.jpg` ou `chip.svg` — então ele viaja com o projeto, é exportado dentro
de um `.vlx`, e acompanha quando você salva o chip em
[My Chips](/docs/pt-br/custom-chips/my-chips/).

A imagem é redimensionada para caber no corpo do chip, nunca cortada ou esticada.
**Os pinos não se movem**: suas posições ainda vêm do `chip.json`, então
adicionar arte a um chip conectado deixa cada fio exatamente onde estava.
Os rótulos dos pinos ficam sobre a imagem, desenhados em branco com um contorno escuro para
que sejam legíveis sobre arte clara e escura, e o nome impresso dá
lugar à arte (ele permanece na dica de ferramenta ao passar o mouse).

Para removê-la, use o botão ao lado do botão de imagem, ou exclua o arquivo
de imagem da seção do chip.

:::tip
Um SVG dá a cara de chip mais nítida em qualquer zoom, e você pode colar marcação
`<svg>` bruta diretamente em um arquivo `chip.svg` em vez de enviar.
:::

## Como os chips executam

O host chama seu `chip_setup()` uma vez por instância do chip. Depois disso, o
chip é **reativo**: seu código só executa dentro de callbacks — um pino observado
mudou, um byte I2C chegou, um timer disparou. Não há loop principal para
bloquear, o que é o que mantém os chips personalizados baratos o suficiente para espalhar por um
circuito.

## Exemplos de chips integrados

O editor de chips vem com fontes funcionais que você pode carregar e modificar: portas
lógicas (inversor, XOR), registradores de deslocamento (74HC595, CD4094), componentes I2C
(PCF8574, DS3231 RTC, EEPROMs 24Cxx), um ADC SPI (MCP3008), um transformador
UART ROT13, um contador de pulsos — e uma **coleção de CPUs retrô**
(Intel 4004 e amigos) para os verdadeiramente aventureiros.

A seguir: a [referência da API de chips](/docs/pt-br/custom-chips/api/).
```
