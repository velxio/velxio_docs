---
title: Crea tu primer chip personalizado
description: Agrega una pieza de Chip Personalizado, escribe unas líneas de C, y Velxio lo compila a WebAssembly.
sidebar:
  order: 2
---

Un **chip personalizado** es un componente que programas tú mismo. Escribes C simple
contra la API `velxio-chip.h`, Velxio lo compila a WebAssembly en la
nube, y el resultado se comporta como cualquier pieza del catálogo: tiene pines que conectas,
atributos que editas y lógica que se ejecuta dentro de la simulación.

## Cuándo crear uno

- El CI que necesitas no está en el catálogo (un registro de desplazamiento oscuro, un
  protocolo de sensor propietario).
- Quieres un accesorio de prueba: un generador de pulsos, un ejercitador de protocolo, un
  sensor falso con valores programados.
- Estás enseñando lógica digital y quieres que los estudiantes _implementen_ el
  chip, no solo que lo usen.

## La versión de cinco minutos

1. Abre el [selector de componentes](/docs/es/circuit-editor/placing-components/)
   y agrega un **Custom Chip** (Chip Personalizado) al lienzo.
2. Se abre la galería de ejemplos: elige un punto de partida (o comienza en blanco).
3. Aterrizas en el editor de código normal: el chip tiene su propia sección en
   el explorador de archivos con dos archivos ordinarios:
   - **`chip.c`** — el comportamiento;
   - **`chip.json`** — el manifiesto: nombre, pines, atributos (validados
     con autocompletado mientras escribes).
   Este es el ejemplo integrado **Inverter** (Inversor):

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

con su manifiesto:

```json
{
  "schema": "velxio-chip/v1",
  "name": "Inverter",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

4. Conecta `IN` a un botón y `OUT` a un LED, luego presiona **Run** (Ejecutar) — el
   chip se compila automáticamente cada vez que su código fuente cambia (el botón de martillo
   en la sección del explorador de archivos del chip lo compila por sí solo,
   con errores en la consola de salida como cualquier compilador de C).
5. Alterna. Haz clic en el chip mientras la simulación está detenida para saltar
   de vuelta a su `chip.c`; edita y presiona **Run** (Ejecutar) de nuevo.

## Cómo se ejecutan los chips

El host llama a tu `chip_setup()` una vez por instancia de chip. Después de eso, el
chip es **reactivo**: tu código solo se ejecuta dentro de callbacks — un pin vigilado
cambió, llegó un byte I2C, se disparó un temporizador. No hay un bucle principal que
bloquee, lo que mantiene los chips personalizados lo suficientemente económicos como para distribuirlos por un
circuito.

## Chips de ejemplo integrados

El editor de chips incluye fuentes funcionales que puedes cargar y modificar: compuertas
lógicas (inversor, XOR), registros de desplazamiento (74HC595, CD4094), piezas I2C
(PCF8574, DS3231 RTC, EEPROMs 24Cxx), un ADC SPI (MCP3008), un transformador
UART ROT13, un contador de pulsos — y una **colección de CPU retro**
(Intel 4004 y amigos) para los verdaderamente aventureros.

Siguiente: la [referencia de la API de chips](/docs/es/custom-chips/api/).
