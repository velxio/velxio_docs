---
title: Crea tu primer chip personalizado
description: Añade un componente de Chip Personalizado, escribe unas líneas de C, y Velxio lo compila a WebAssembly.
sidebar:
  order: 2
---

Un **chip personalizado** es un componente que programas tú mismo. Escribes C
puro contra la API `velxio-chip.h`, Velxio lo compila a WebAssembly en la
nube, y el resultado se comporta como cualquier componente del catálogo: tiene pines que conectas,
atributos que editas y lógica que se ejecuta dentro de la simulación.

## Cuándo crear uno

- El CI que necesitas no está en el catálogo (un registro de desplazamiento oscuro, un
  protocolo de sensor propietario).
- Quieres un banco de pruebas: un generador de pulsos, un ejercitador de protocolos, un
  sensor falso con valores programados.
- Enseñas lógica digital y quieres que los estudiantes _implementen_ el
  chip, no solo que lo usen.

## La versión de cinco minutos

1. Abre el [selector de componentes](/docs/es/circuit-editor/placing-components/)
   y añade un **Custom Chip** (Chip Personalizado) al lienzo.
2. Se abre la galería de ejemplos: elige un punto de partida (o comienza en blanco).
3. Aterrizas en el editor de código habitual: el chip tiene su propia sección en
   el explorador de archivos con dos archivos normales:
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
   chip se compila automáticamente cada vez que su código fuente cambia (el botón
   de martillo en la sección del explorador de archivos del chip lo compila por sí solo,
   con errores en la consola de salida como cualquier compilador de C).
5. Alterna. Haz clic en el chip mientras la simulación está detenida para saltar
   de vuelta a su `chip.c`; edita y vuelve a ejecutar con **Run**.

## Dando una cara al chip

Por defecto, un chip se dibuja como un cuerpo oscuro con su nombre en una banda
de serigrafía y sus etiquetas de pines alrededor del borde. Puedes reemplazar esa cara con
tu propio arte: una foto de la placa de conexión real, un dibujo de la
hoja de datos, un icono:

Haz clic en el botón **image** (imagen) en la sección del explorador de archivos del chip (junto a
Compile) y elige un **PNG, JPEG o SVG** de hasta 256 KB. Se une a `chip.c`
y `chip.json` como otro archivo en la sección de ese chip — `chip.png`,
`chip.jpg` o `chip.svg` — por lo que viaja con el proyecto, se exporta dentro
de un `.vlx` y se incluye cuando guardas el chip en
[My Chips](/docs/es/custom-chips/my-chips/).

La imagen se escala para ajustarse al cuerpo del chip, nunca se recorta ni se estira.
**Los pines no se mueven**: sus posiciones aún provienen de `chip.json`, por lo que
añadir arte a un chip cableado deja cada cable exactamente donde estaba.
Las etiquetas de los pines permanecen encima de la imagen, dibujadas en blanco con un contorno oscuro para que
se lean tanto sobre arte claro como oscuro, y el nombre impreso da
paso al arte (permanece en la información sobre herramientas al pasar el cursor).

Para eliminarlo, usa el botón junto al de imagen, o elimina el archivo de imagen
de la sección del chip.

:::tip
Un SVG proporciona la cara de chip más nítida a cualquier nivel de zoom, y puedes pegar
marcado `<svg>` sin procesar directamente en un archivo `chip.svg` en lugar de subirlo.
:::

## Cómo se ejecutan los chips

El host llama a tu `chip_setup()` una vez por instancia del chip. Después de eso, el
chip es **reactivo**: tu código solo se ejecuta dentro de callbacks — un pin vigilado
cambió, llegó un byte I2C, se disparó un temporizador. No hay un bucle principal que
bloquear, lo que mantiene los chips personalizados lo suficientemente económicos como para esparcirlos por un
circuito.

## Chips de ejemplo integrados

El editor de chips incluye fuentes funcionales que puedes cargar y modificar: puertas
lógicas (inversor, XOR), registros de desplazamiento (74HC595, CD4094), componentes I2C
(PCF8574, DS3231 RTC, EEPROMs 24Cxx), un ADC SPI (MCP3008), un transformador
UART ROT13, un contador de pulsos — y una **colección de CPU retro**
(Intel 4004 y amigos) para los realmente aventureros.

Siguiente: la [referencia de la API de chips](/docs/es/custom-chips/api/).
