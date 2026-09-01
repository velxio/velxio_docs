---
title: "Tutorial: temperatura y humedad por I2C"
description: Construye un sensor I2C con un mapa de registros y dos controles deslizantes en vivo, y aprende dónde muestrear los atributos cuando el valor se entrega mediante un protocolo en lugar de un pin.
sidebar:
  order: 5
---

Un voltaje en un pin es el caso fácil. Los sensores reales suelen hablar un
protocolo, y eso cambia una cosa: **dónde** se lee el atributo.
Este tutorial construye un sensor de temperatura y humedad en la dirección I2C
`0x44` con un control deslizante para cada uno.

:::tip[Abre el circuito terminado]
[Sensor ambiental I2C (controles deslizantes en vivo)](https://velxio.dev/example/i2c-env-sensor-live-sliders),
conectado a un Uno con el sketch de abajo. El chip también es una plantilla en el
diálogo de nuevo chip.
:::

## La única idea que es diferente

En el [sensor analógico](/docs/es/custom-chips/programmable-sensors/co2-analog/)
un temporizador releía el atributo 20 veces por segundo. Aquí no hay temporizador.
El maestro decide cuándo ocurre una lectura, así que se muestrean los atributos
**en el momento en que el maestro inicia una transacción de lectura**. Cualquier otra
cosa o quema CPU sin necesidad o entrega un valor obsoleto.

Para eso sirve `on_connect`.

## El mapa de registros

Mantenlo simple. Dos registros little-endian de 16 bits en pasos de 0.1 unidades,
con un puntero de auto-incremento:

| Registro | Contenido |
| --- | --- |
| `0x00` | Temperatura, int16 con signo, unidades de 0.1 °C |
| `0x02` | Humedad, uint16 sin signo, unidades de 0.1 %HR |

Un maestro escribe un byte para establecer el puntero y luego lee; el puntero
avanza, de modo que cuatro bytes seguidos dan ambos valores.

## El manifiesto

Dos atributos, dos controles. Observa `type: "float"` y la `unit` en cada
control, que es lo que se imprime después del número en el panel.

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

## El código fuente

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

Puntos que vale la pena copiar:

- **Haz `memset` de la configuración.** Es una estructura simple; un puntero obsoleto en una
  ranura de callback que no configuraste será llamado.
- **Devuelve `true` desde `on_connect`** o el chip responde NACK a su propia dirección
  y el maestro no ve nada en el bus.
- **Captura en la lectura, no en cada byte.** Muestrear dentro de `on_read` podría
  permitir que la temperatura cambie a mitad de un valor de 16 bits y entregue al
  maestro una lectura fragmentada.

## El sketch

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

Conecta `SDA` y `SCL` a los pines I2C de la placa (`A4` y `A5` en un Uno),
además de `VCC` y `GND`. Pulsa **Run** (Ejecutar), haz clic en el chip y arrastra cualquiera de los
controles deslizantes: la siguiente transacción llevará el nuevo valor.

![Dos controles deslizantes en vivo en el sensor I2C: temperatura en °C y humedad en porcentaje](../../../../../assets/docs/custom-chips/i2c-two-sliders.png)

## Cuando no funciona

| Lo que ves | Casi siempre |
| --- | --- |
| `requestFrom` no devuelve nada | `on_connect` devolvió `false`, o la dirección en el sketch no coincide con `cfg.address` |
| La lectura se queda en el valor predeterminado | `latch_registers` se está llamando desde `chip_setup` en lugar de `on_connect` |
| La temperatura se lee como un número positivo enorme | El int16 se amplió como sin signo; mantén el cast a `int16_t` antes de dividir |
| Los valores saltan entre dos lecturas | El muestreo se movió a `on_read`, así que las dos mitades de un valor de 16 bits provienen de diferentes posiciones del control deslizante |
| Nada en absoluto en el bus | `SDA` y `SCL` están intercambiados, o registrados con un modo distinto de `VX_INPUT` |

## Siguiente

- Cada campo, más el respaldo automático:
  [la referencia de `controls`](/docs/es/custom-chips/programmable-sensors/reference/).
- La API C completa, incluidos los esclavos SPI y UART:
  [referencia de la API](/docs/es/custom-chips/api/).
