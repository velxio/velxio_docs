---
title: Cómo llevar los chips de Wokwi a Velxio
description: "Los chips escritos para la API C de chips personalizados de Wokwi se compilan en Velxio sin cambios, y los zips de proyectos de Wokwi se importan con sus chips."
sidebar:
  order: 5
---

Si has escrito chips personalizados para Wokwi, estos vienen incluidos: Velxio es
**compatible a nivel de código fuente** con la API C documentada de chips personalizados de Wokwi.

## Mismo C, sin cambios

`#include "wokwi-api.h"` se resuelve a un encabezado de compatibilidad de sala limpia
que adapta cada símbolo documentado a la API nativa `vx_*` de Velxio en
tiempo de compilación:

- `chip_init()` es el punto de entrada, exactamente como en Wokwi.
- `pin_init`, `pin_read`, `pin_write`, `pin_mode`, `pin_watch` (con su
  `pin_watch_config_t`), `pin_adc_read`, `pin_dac_write` — todos están presentes.
- `i2c_init`, `uart_init`, `spi_init` aceptan sus estructuras de configuración; los campos
  (`connect`/`read`/`write`/`disconnect`, `rx_data`/`write_done`,
  `done`) se traducen uno a uno.
- `attr_init` / `attr_read` (y las variantes `_float` y de cadena),
  `timer_init` / `timer_start` (microsegundos, convertidos por ti) /
  `timer_start_ns` / `timer_stop`, `get_sim_nanos`,
  `framebuffer_init` / `buffer_write` / `buffer_read`.
- `INPUT`/`OUTPUT`/`INPUT_PULLUP`/`INPUT_PULLDOWN`/`ANALOG`,
  `OUTPUT_LOW`/`OUTPUT_HIGH`, `LOW`/`HIGH`, `RISING`/`FALLING`/`BOTH`,
  `NO_PIN` — valores idénticos.

Compílalo como cualquier chip de Velxio: pega el C en el `chip.c` de un Chip
Personalizado y presiona **Run** (Ejecutar).

## Compatibilidad con chip.json

`name`, la matriz posicional `pins` (con omisiones de ranuras `""`),
`attributes`, `controls` (deslizadores en vivo) y `display` funcionan igual que en
Wokwi. `symbol` y el arte SVG personalizado se ignoran — Velxio dibuja su
propio cuerpo de chip genérico con el tamaño según tu número de pines.

## Zips de proyectos

**File → Open project** (Archivo → Abrir proyecto) acepta un zip de proyecto de Wokwi. Una
parte `chip-<name>` en `diagram.json` se convierte en un Chip Personalizado con sus fuentes cargadas
desde el `<name>.chip.c` / `<name>.chip.json` hermano, con los cables intactos.
Las exportaciones escriben el mismo diseño de vuelta.

## Lo que no se transfiere

- **Binarios `.wasm` precompilados** — el espacio de nombres de importación de Velxio difiere;
  recompila desde el código fuente (toma segundos, y la importación del zip lo hace
  en el primer **Run**).
- La API de introspección experimental `_mcu_*`.

## Prefiere la API nativa para chips nuevos

La capa de compatibilidad existe para que tu trabajo existente funcione. Para chips
nuevos, la [API nativa `velxio-chip.h`](/docs/es/custom-chips/api/) es el
mismo conjunto de ideas con tipos más claros (voltajes como `double`, temporizadores
en nanosegundos) — y es lo que los ejemplos, el agente de IA y
[My Chips](/docs/es/custom-chips/my-chips/) hablan de forma nativa.
