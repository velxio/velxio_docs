---
title: "Tutorial: un sensor de CO2 analógico"
description: Construye un chip personalizado que genera un voltaje a partir de un control deslizante de ppm en vivo, conéctalo a un pin analógico de Arduino y observa cómo analogRead sigue el control deslizante en tiempo real.
sidebar:
  order: 4
---

El sensor programable completo más corto: un control deslizante de 400 a 5000 ppm,
un voltaje en un pin y un Arduino leyéndolo. Diez minutos de principio a
fin, y la forma que copiarás para cada sensor analógico a partir de ahora.

:::tip[Abre el circuito terminado]
Todo lo que aparece a continuación, ya cableado y listo para ejecutar:
[Sensor de CO2 (control deslizante en vivo)](https://velxio.dev/example/co2-sensor-live-slider).
El mismo chip también es una plantilla en el diálogo de nuevo chip, si prefieres
colocarlo en un proyecto propio.
:::

## Lo que estás construyendo

```
   [ Chip Sensor de CO2 ]                 [ Arduino Uno ]
        VCC  o------------------------o 5V
        GND  o------------------------o GND
        OUT  o------------------------o A0

   control deslizante 400..5000 ppm   ->   OUT 0..5 V   ->   analogRead(A0)
```

## Paso 1: crea el chip

Agrega un chip personalizado desde el explorador de archivos del editor. Un diálogo ofrece
las plantillas integradas además de **Start from blank** (Comenzar desde cero); elige la
plantilla en blanco para seguir el tutorial. De cualquier manera, terminarás con dos archivos:
el manifiesto (`chip.json`) y el código fuente (`chip.c`).

## Paso 2: el manifiesto

Tres pines, un atributo, un control. El `id` del control y el
`name` del atributo deben coincidir; eso es lo que los vincula.

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

## Paso 3: el código fuente

Un temporizador repetitivo convierte ppm a voltios y controla el pin. Observa dónde
se encuentra `vx_attr_read`: **dentro** de la función de devolución de llamada, para que
cada ciclo vea la posición actual del control deslizante.

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

Tres detalles que importan:

- `VX_ANALOG` en el pin. Un pin digital no puede transportar un voltaje
  intermedio, y `vx_pin_dac_write` en él no hará lo que quieres.
- `vx_timer_start` toma **nanosegundos**. `50000000ULL` son 50 ms. Este es
  el error tipográfico más común en un primer chip.
- La llamada directa a `on_tick(0)` antes de regresar. Sin ella, el pin permanece
  a 0 V hasta que el primer temporizador se dispara, y un sketch rápido lo lee
  como un falso valor de 400 ppm.

Presiona **Compile** (Compilar).

## Paso 4: conéctalo

Coloca el chip en el lienzo junto a un Arduino Uno y conecta `VCC` a
`5V`, `GND` a `GND` y `OUT` a `A0`.

![El chip sensor de CO2 conectado a un Arduino Uno: VCC a 5V, GND a GND, OUT a A0](../../../../../assets/docs/custom-chips/sensor-circuit.png)

## Paso 5: el sketch

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

## Paso 6: ejecútalo y arrastra

Presiona **Run** (Ejecutar) y luego **haz clic en el chip**. Se abre el panel
del control deslizante:

![El panel en vivo del chip mientras la simulación se ejecuta: un control deslizante de CO2 en ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Arrástralo y la salida serial lo sigue dentro de un `delay(500)`:

![El monitor serial siguiendo el control deslizante: lecturas de ppm saltando de 1000 a 3000](../../../../../assets/docs/custom-chips/sensor-serial-tracking.png)

Ese es el ciclo completo: el control deslizante escribe el atributo, el temporizador
lo lee 20 veces por segundo, el voltaje del pin cambia y `analogRead` lo detecta.

## Cuando no funciona

| Lo que ves | Casi siempre |
| --- | --- |
| Hacer clic en el chip no abre nada | La simulación está detenida: el panel solo se abre mientras se ejecuta |
| El control deslizante aparece pero la lectura nunca cambia | `vx_attr_read` se llama en `chip_setup()` y se almacena en caché, en lugar de dentro de `on_tick` |
| `analogRead` devuelve solo 0 o 1023 | El pin se registró en modo digital en lugar de `VX_ANALOG` |
| El valor se actualiza una vez y se congela | `vx_timer_start` se llamó con `repeat` en falso, o el intervalo se escribió en milisegundos, por lo que el siguiente ciclo está a 50000 segundos |
| Serial muestra 400 ppm durante el primer momento | Falta la llamada inicial a `on_tick(0)` |

## Siguiente

- La misma idea detrás de un protocolo digital:
  [temperatura y humedad a través de I2C](/docs/es/custom-chips/programmable-sensors/i2c-env/).
- Cada campo que puedes poner en `controls`:
  [la referencia](/docs/es/custom-chips/programmable-sensors/reference/).
- Guárdalo para otros proyectos: [Mis Chips](/docs/es/custom-chips/my-chips/).
