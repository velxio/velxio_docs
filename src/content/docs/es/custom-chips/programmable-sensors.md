---
title: Sensores programables con controles deslizantes en vivo
description: Construye un sensor cuyo valor cambias con un control deslizante mientras la simulación se ejecuta, usando la sección de controles de chip.json.
sidebar:
  order: 3
---

Un chip personalizado puede ser un **sensor programable**: una parte cuya salida
controlas desde un control deslizante *mientras la simulación se ejecuta*. Piensa en un sensor de CO2 cuyo
ppm ajustas para probar umbrales, una sonda de temperatura/humedad detrás de
I2C, un sensor de luz, un potenciómetro con voluntad propia — cualquier cosa
donde "¿y si el valor cambia?" sea el punto central.

## La receta

Tres ingredientes, todos en el chip que ya sabes escribir:

1. **Un atributo** — el valor ajustable: `vx_attr_register("ppm", 1000)`.
2. **Una sección `controls`** en `chip.json` — esto es lo que pone el control
   deslizante en pantalla durante la simulación:

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

3. **Vuelve a leer el atributo dentro de un callback o temporizador** — nunca lo
   almacenes en caché, el control deslizante lo cambia a mitad de ejecución:

```c
#include "velxio-chip.h"

typedef struct { vx_pin out; vx_attr ppm; vx_timer t; } chip_state_t;
static chip_state_t S;

static void on_tick(void *ud) {
  double ppm = vx_attr_read(S.ppm);              /* live slider value */
  double volts = (ppm - 400.0) / 4600.0 * 5.0;   /* 400..5000 -> 0..5 V */
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out = vx_pin_register("OUT", VX_ANALOG);
  S.ppm = vx_attr_register("ppm", 1000);
  S.t = vx_timer_create(on_tick, 0);
  vx_timer_start(S.t, 50000000ULL, true);        /* 50 ms, nanoseconds */
  on_tick(0);
}
```

Conecta `OUT` a un pin analógico de una placa (por ejemplo, Arduino `A0`), presiona **Run** (Ejecutar) y
haz clic en el chip: se abre el panel de control deslizante. Arrástralo y `analogRead(A0)`
se actualiza en tiempo real.

## Cómo se conectan las piezas

- Cada entrada de `controls` controla el **atributo con el mismo id** —
  `vx_attr_read` devuelve el nuevo valor en el instante en que el control deslizante se mueve.
- `type: "range"` es un control deslizante; `type: "button"` envía un pulso
  momentáneo `1 → 0` (aproximadamente 150 ms), para entradas de disparo/reinicio.
- ¿Sin sección `controls`? Cualquier atributo que declare tanto `min` como
  `max` obtiene un control deslizante en vivo automáticamente — la mayoría de los chips existentes
  son ajustables sin tocar su manifiesto.
- `unit` (mostrado después del valor) y `scale: "log"` son extras opcionales
  para los controles deslizantes.
- Los valores predeterminados en tiempo de diseño viven en el inspector de partes (clic derecho en el
  chip mientras está detenido).

## Plantillas listas para usar

La galería de ejemplos incluye dos sensores construidos exactamente de esta manera:

- **CO2 Sensor (live slider)** — la receta analógica anterior, textualmente.
- **I2C Env Sensor (live sliders)** — temperatura + humedad detrás de un
  mapa de registros I2C en `0x44`, ambos controlados por controles deslizantes; el patrón para
  cualquier sensor de protocolo digital.

Guarda tu propia variante en [My Chips](/docs/es/custom-chips/my-chips/) y
estará a un clic de distancia en cada proyecto.
