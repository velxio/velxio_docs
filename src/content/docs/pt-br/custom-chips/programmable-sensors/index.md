---
title: Sensores programáveis com controles deslizantes ao vivo
description: Construa um sensor cujo valor você altera com um controle deslizante enquanto a simulação roda, usando a seção de controles do chip.json.
sidebar:
  order: 3
---

Um chip personalizado pode ser um **sensor programável**: uma peça cuja saída você
controla a partir de um controle deslizante *enquanto a simulação roda*. Pense em um sensor de CO2 cujo
ppm você varre para testar limites, uma sonda de temperatura/umidade por trás do
I2C, um sensor de luz, um potenciômetro com vontade própria — qualquer coisa
onde "e se o valor mudar?" é o ponto principal.

## A receita

Três ingredientes, todos no chip que você já sabe escrever:

1. **Um atributo** — o valor ajustável: `vx_attr_register("ppm", 1000)`.
2. **Uma seção `controls`** no `chip.json` — é isso que coloca o controle deslizante
   na tela durante a simulação:

```json
{
  "name": "CO2 Sensor",
  "pins": ["VCC", "GND", "OUT"],
  "attributes": [
    { "name": "ppm", "label": "CO2 (ppm)", "type": "int",
      "default": 1000, "min": 400, "max": 5000, "step": 10 }
  ],
  "controls": [
    { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
      "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
  ]
}
```

3. **Releia o atributo dentro de um callback ou timer** — nunca o armazene em cache,
   o controle deslizante o altera durante a execução:

```c
#include "velxio-chip.h"

typedef struct { vx_pin out; vx_attr ppm; vx_timer t; } chip_state_t;
static chip_state_t S;

static void on_tick(void *ud) {
  double ppm = vx_attr_read(S.ppm);              /* valor ao vivo do controle deslizante */
  double volts = (ppm - 400.0) / 4600.0 * 5.0;   /* 400..5000 -> 0..5 V */
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out = vx_pin_register("OUT", VX_ANALOG);
  S.ppm = vx_attr_register("ppm", 1000);
  S.t = vx_timer_create(on_tick, 0);
  vx_timer_start(S.t, 50000000ULL, true);        /* 50 ms, nanossegundos */
  on_tick(0);
}
```

Conecte `OUT` a um pino analógico da placa (digamos Arduino `A0`), pressione **Run** e
clique no chip: o painel do controle deslizante abre. Arraste-o e `analogRead(A0)`
acompanha em tempo real.

## Como as peças se conectam

- Cada entrada de `controls` aciona o **atributo com o mesmo id** —
  `vx_attr_read` retorna o novo valor no instante em que o controle deslizante se move.
- `type: "range"` é um controle deslizante; `type: "button"` envia um pulso
  momentâneo `1 → 0` (cerca de 150 ms), para entradas de gatilho/redefinição.
- Sem seção `controls`? Qualquer atributo que declare tanto `min` quanto
  `max` ganha um controle deslizante ao vivo automaticamente — a maioria dos chips existentes é
  ajustável sem tocar no manifesto deles.
- `unit` (exibido após o valor) e `scale: "log"` são extras opcionais
  para controles deslizantes.
- Os padrões de design-time ficam no inspetor de peças (clique com o botão direito no
  chip enquanto estiver parado).

## Modelos prontos

A galeria de exemplos traz dois sensores construídos exatamente dessa forma:

- **CO2 Sensor (controle deslizante ao vivo)** — a receita analógica acima, na íntegra.
- **I2C Env Sensor (controles deslizantes ao vivo)** — temperatura + umidade por trás de um
  mapa de registros I2C em `0x44`, ambos controlados por controles deslizantes; o padrão para
  qualquer sensor com protocolo digital.

Salve sua própria variante em [Meus Chips](/docs/pt-br/custom-chips/my-chips/) e
ela estará a um clique de distância em todos os projetos.
