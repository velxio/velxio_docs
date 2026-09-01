---
title: "Tutorial: um sensor de CO2 analógico"
description: Construa um chip personalizado que gera uma tensão a partir de um controle deslizante de ppm ao vivo, conecte-o a um pino analógico do Arduino e veja o analogRead acompanhar o controle deslizante em tempo real.
sidebar:
  order: 4
---

O sensor programável completo mais curto: um controle deslizante de 400 a 5000 ppm,
uma tensão em um pino e um Arduino lendo-o de volta. Dez minutos do início ao
fim, e o formato que você copiará para todo sensor analógico depois disso.

:::tip[Abra o circuito finalizado]
Tudo abaixo, já conectado e pronto para executar:
[Sensor de CO2 (controle deslizante ao vivo)](https://velxio.dev/example/co2-sensor-live-slider).
O mesmo chip também é um modelo na caixa de diálogo de novo chip, se você preferir
inseri-lo em um projeto seu.
:::

## O que você está construindo

```
   [ Chip Sensor de CO2 ]                 [ Arduino Uno ]
        VCC  o------------------------o 5V
        GND  o------------------------o GND
        OUT  o------------------------o A0

   controle deslizante 400..5000 ppm   ->   OUT 0..5 V   ->   analogRead(A0)
```

## Etapa 1: criar o chip

Adicione um chip personalizado no explorador de arquivos do editor. Uma caixa de diálogo oferece os
modelos integrados além de **Start from blank**; escolha o em branco para
acompanhar. De qualquer forma, você termina com dois arquivos: o manifesto
(`chip.json`) e o código-fonte (`chip.c`).

## Etapa 2: o manifesto

Três pinos, um atributo, um controle. O `id` do controle e o
`name` do atributo devem corresponder; é isso que os vincula.

```json title="chip.json"
{
  "schema": "velxio-chip/v1",
  "name": "CO2 Sensor",
  "description": "Analog CO2 sensor with a live ppm slider. OUT maps 400-5000 ppm to 0-5 V.",
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

## Etapa 3: o código-fonte

Um temporizador repetitivo converte ppm em volts e aciona o pino. Observe onde
`vx_attr_read` está: **dentro** do retorno de chamada, para que cada ciclo veja a
posição atual do controle deslizante.

```c title="chip.c"
#include "velxio-chip.h"

#define PPM_MIN   400.0
#define PPM_MAX  5000.0
#define VOLTS_MAX   5.0

typedef struct {
  vx_pin   out;
  vx_attr  ppm;
  vx_timer timer;
} chip_state_t;

static chip_state_t S;

static void on_tick(void *user_data) {
  (void)user_data;
  double ppm = vx_attr_read(S.ppm);          /* live slider value */
  if (ppm < PPM_MIN) ppm = PPM_MIN;
  if (ppm > PPM_MAX) ppm = PPM_MAX;
  double volts = (ppm - PPM_MIN) / (PPM_MAX - PPM_MIN) * VOLTS_MAX;
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out   = vx_pin_register("OUT", VX_ANALOG);
  S.ppm   = vx_attr_register("ppm", 1000);
  S.timer = vx_timer_create(on_tick, 0);
  vx_timer_start(S.timer, 50000000ULL, true);  /* 50 ms, in nanoseconds */
  on_tick(0);                                  /* drive the initial level */
  vx_log("co2 sensor ready");
}
```

Três detalhes que importam:

- `VX_ANALOG` no pino. Um pino digital não pode transportar uma tensão
  intermediária, e `vx_pin_dac_write` nele não fará o que você deseja.
- `vx_timer_start` recebe **nanossegundos**. `50000000ULL` são 50 ms. Este é o
  erro de digitação mais comum em um primeiro chip.
- A chamada direta `on_tick(0)` antes de retornar. Sem ela, o pino fica em 0 V
  até o primeiro disparo do temporizador, e um sketch rápido lê isso como um
  400 ppm espúrio.

Pressione **Compile**.

## Etapa 4: conecte

Coloque o chip na tela ao lado de um Arduino Uno e conecte `VCC` a
`5V`, `GND` a `GND` e `OUT` a `A0`.

![O chip sensor de CO2 conectado a um Arduino Uno: VCC a 5V, GND a GND, OUT a A0](../../../../../assets/docs/custom-chips/sensor-circuit.png)

## Etapa 5: o sketch

```cpp title="sketch.ino"
void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(A0);
  float volts = raw * (5.0f / 1023.0f);
  float ppm = 400.0f + volts / 5.0f * 4600.0f;
  Serial.print("raw="); Serial.print(raw);
  Serial.print("  ppm="); Serial.println(ppm, 0);
  delay(500);
}
```

## Etapa 6: execute e arraste

Pressione **Run** e depois **clique no chip**. O painel do controle deslizante abre:

![O painel ao vivo do chip enquanto a simulação é executada: um controle deslizante de CO2 em ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Arraste-o e a saída serial segue dentro de um `delay(500)`:

![O monitor serial acompanhando o controle deslizante: leituras de ppm saltando de 1000 para 3000](../../../../../assets/docs/custom-chips/sensor-serial-tracking.png)

Esse é o ciclo completo: o controle deslizante escreve o atributo, o temporizador o lê
20 vezes por segundo, a tensão do pino muda e o `analogRead` a vê.

## Quando não funciona

| O que você vê | Quase sempre |
| --- | --- |
| Clicar no chip não abre nada | A simulação está parada: o painel abre apenas enquanto ela é executada |
| O controle deslizante aparece, mas a leitura nunca muda | `vx_attr_read` está sendo chamado em `chip_setup()` e armazenado em cache, em vez de dentro de `on_tick` |
| `analogRead` retorna apenas 0 ou 1023 | O pino foi registrado em modo digital em vez de `VX_ANALOG` |
| O valor atualiza uma vez e congela | `vx_timer_start` foi chamado com `repeat` falso, ou o intervalo foi escrito em milissegundos, então o próximo ciclo está a 50000 segundos de distância |
| O Serial mostra 400 ppm no primeiro momento | A chamada inicial `on_tick(0)` está faltando |

## Próximos passos

- A mesma ideia por trás de um protocolo digital:
  [temperatura e umidade via I2C](/docs/pt-br/custom-chips/programmable-sensors/i2c-env/).
- Todos os campos que você pode colocar em `controls`:
  [a referência](/docs/pt-br/custom-chips/programmable-sensors/reference/).
- Guarde-o para outros projetos: [My Chips](/docs/pt-br/custom-chips/my-chips/).
