---
title: "Tutorial: temperatura e umidade via I2C"
description: Construa um sensor I2C com mapa de registradores e dois controles deslizantes ao vivo, e aprenda onde amostrar atributos quando o valor é entregue por um protocolo em vez de um pino.
sidebar:
  order: 5
---

Uma tensão em um pino é o caso fácil. Sensores reais geralmente falam um
protocolo, e isso muda uma coisa: **onde** você lê o atributo.
Este tutorial constrói um sensor de temperatura e umidade no endereço I2C
`0x44` com um controle deslizante para cada.

:::tip[Abra o circuito finalizado]
[Sensor de Ambiente I2C (controles deslizantes ao vivo)](https://velxio.dev/example/i2c-env-sensor-live-sliders),
conectado a um Uno com o sketch abaixo. O chip também é um modelo na
caixa de diálogo de novo chip.
:::

## A única ideia que é diferente

No [sensor analógico](/docs/pt-br/custom-chips/programmable-sensors/co2-analog/)
um temporizador relia o atributo 20 vezes por segundo. Aqui não há temporizador.
O mestre decide quando uma leitura acontece, então você amostra os atributos
**no momento em que o mestre inicia uma transação de leitura**. Qualquer outra
coisa ou queima CPU à toa ou entrega um valor obsoleto.

É para isso que serve o `on_connect`.

## O mapa de registradores

Mantenha-o simples. Dois registradores de 16 bits little-endian em passos de 0,1 unidade,
com um ponteiro de incremento automático:

| Registrador | Conteúdo |
| --- | --- |
| `0x00` | Temperatura, int16 com sinal, unidades de 0,1 °C |
| `0x02` | Umidade, uint16 sem sinal, unidades de 0,1 %UR |

Um mestre escreve um byte para definir o ponteiro e depois lê; o ponteiro
avança para que quatro bytes seguidos forneçam ambos os valores.

## O manifesto

Dois atributos, dois controles. Observe `type: "float"` e o `unit` em cada
controle, que é o que é impresso após o número no painel.

```json title="chip.json"
{
  "schema": "velxio-chip/v1",
  "name": "I2C Env Sensor",
  "description": "Temperature + humidity over I2C (0x44) with live sliders.",
  "pins": ["VCC", "GND", "SDA", "SCL"],
  "attributes": [
    { "name": "temperature", "label": "Temperature", "type": "float",
      "default": 25, "min": -40, "max": 85, "step": 0.5 },
    { "name": "humidity", "label": "Humidity", "type": "float",
      "default": 50, "min": 0, "max": 100, "step": 1 }
  ],
  "controls": [
    { "id": "temperature", "label": "Temperature", "type": "range",
      "min": -40, "max": 85, "step": 0.5, "unit": "C" },
    { "id": "humidity", "label": "Humidity", "type": "range",
      "min": 0, "max": 100, "step": 1, "unit": "%" }
  ]
}
```

## O código-fonte

```c title="chip.c"
#include "velxio-chip.h"
#include <string.h>

#define I2C_ADDR 0x44

typedef struct {
  vx_attr temp;      /* degrees C */
  vx_attr humidity;  /* %RH */
  uint8_t reg;       /* register pointer */
  uint8_t regs[4];   /* latched at the start of a read */
} chip_state_t;

static chip_state_t S;

static void latch_registers(void) {
  /* Re-read the attributes NOW: the sliders may have moved. */
  int16_t  t = (int16_t)(vx_attr_read(S.temp) * 10.0);
  uint16_t h = (uint16_t)(vx_attr_read(S.humidity) * 10.0);
  S.regs[0] = (uint8_t)(t & 0xFF);
  S.regs[1] = (uint8_t)((t >> 8) & 0xFF);
  S.regs[2] = (uint8_t)(h & 0xFF);
  S.regs[3] = (uint8_t)((h >> 8) & 0xFF);
}

static bool on_connect(void *ud, uint8_t addr, bool is_read) {
  (void)ud; (void)addr;
  if (is_read) latch_registers();   /* sample here, not on a timer */
  return true;                      /* ACK the address */
}

static uint8_t on_read(void *ud) {
  (void)ud;
  uint8_t v = S.reg < sizeof(S.regs) ? S.regs[S.reg] : 0xFF;
  S.reg++;                          /* auto-increment */
  return v;
}

static bool on_write(void *ud, uint8_t byte) {
  (void)ud;
  S.reg = byte;                     /* a write sets the pointer */
  return true;                      /* ACK the byte */
}

static void on_stop(void *ud) { (void)ud; }

void chip_setup(void) {
  S.temp     = vx_attr_register("temperature", 25);
  S.humidity = vx_attr_register("humidity", 50);

  vx_i2c_config cfg;
  memset(&cfg, 0, sizeof(cfg));   /* zero it: unset callbacks must be NULL */
  cfg.address    = I2C_ADDR;
  cfg.scl        = vx_pin_register("SCL", VX_INPUT);
  cfg.sda        = vx_pin_register("SDA", VX_INPUT);
  cfg.on_connect = on_connect;
  cfg.on_read    = on_read;
  cfg.on_write   = on_write;
  cfg.on_stop    = on_stop;
  vx_i2c_attach(&cfg);
  vx_log("i2c env sensor at 0x44");
}
```

Pontos que valem a pena copiar:

- **Use `memset` na configuração.** É uma struct simples; um ponteiro obsoleto em um
  slot de callback que você não definiu será chamado.
- **Retorne `true` de `on_connect`** ou o chip NACKs seu próprio endereço
  e o mestre não vê nada no barramento.
- **Trave na leitura, não em cada byte.** Amostrar dentro de `on_read` permitiria
  que a temperatura mudasse no meio de um valor de 16 bits e entregasse ao
  mestre uma leitura corrompida.

## O sketch

```cpp title="sketch.ino"
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin();
}

void loop() {
  Wire.beginTransmission(0x44);
  Wire.write(0x00);                 // point at temperature
  Wire.endTransmission();

  Wire.requestFrom(0x44, 4);        // t_lo t_hi h_lo h_hi
  if (Wire.available() >= 4) {
    int16_t t  = Wire.read() | (Wire.read() << 8);
    uint16_t h = Wire.read() | (Wire.read() << 8);
    Serial.print("T="); Serial.print(t / 10.0, 1);
    Serial.print("C  RH="); Serial.print(h / 10.0, 1);
    Serial.println("%");
  }
  delay(500);
}
```

Conecte `SDA` e `SCL` aos pinos I2C da placa (`A4` e `A5` em um Uno),
além de `VCC` e `GND`. Pressione **Run** (Executar), clique no chip e arraste qualquer
controle deslizante: a próxima transação carrega o novo valor.

![Dois controles deslizantes ao vivo no sensor I2C: temperatura em °C e umidade em porcentagem](../../../../../assets/docs/custom-chips/i2c-two-sliders.png)

## Quando não funciona

| O que você vê | Quase sempre |
| --- | --- |
| `requestFrom` não retorna nada | `on_connect` retornou `false`, ou o endereço no sketch não corresponde a `cfg.address` |
| A leitura está presa no padrão | `latch_registers` está sendo chamado de `chip_setup` em vez de `on_connect` |
| A temperatura é lida como um número positivo enorme | O int16 foi alargado como sem sinal; mantenha o cast `int16_t` antes de dividir |
| Os valores saltam entre duas leituras | A amostragem foi movida para `on_read`, então as duas metades de um valor de 16 bits vêm de posições diferentes do controle deslizante |
| Nada no barramento | `SDA` e `SCL` estão invertidos, ou registrados com um modo diferente de `VX_INPUT` |

## Próximos passos

- Cada campo, mais o fallback automático:
  [a referência de `controls`](/docs/pt-br/custom-chips/programmable-sensors/reference/).
- A API C completa, incluindo escravos SPI e UART:
  [Referência da API](/docs/pt-br/custom-chips/api/).
```
