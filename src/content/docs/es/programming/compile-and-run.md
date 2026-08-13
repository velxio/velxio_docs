---
title: Compilar y ejecutar
description: "Qué sucede cuando pulsas Play: compilación en la nube, firmware real y cómo leer los errores."
sidebar:
  order: 3
---

## Qué hace Run

**Run** compila el código de la placa activa (si es necesario) e inicia el resultado
en la placa emulada. No hay una "simulación de tu código fuente":
Velxio genera un **binario de firmware real** con la cadena de herramientas real
(arduino-cli / ESP-IDF / MicroPython) y lo ejecuta instrucción por
instrucción.

- **Compile** (Ctrl+B) compila sin ejecutar; útil para comprobar errores
  rápidamente.
- **Stop** detiene la simulación; **Reset** reinicia el firmware desde el
  principio.

## La consola de salida

El panel **OUTPUT** (Salida) en la parte inferior izquierda muestra el proceso de compilación: resolución de librerías,
invocaciones del compilador, uso de memoria y, finalmente,
`Compilation successful`. Es la misma salida que te daría el Arduino IDE o
`idf.py build`.

## Lectura de errores de compilación

Los errores llegan exactamente como los emite el compilador, con archivo y línea:

- `'foo' was not declared in this scope`: error tipográfico o falta un `#include`.
- `No such file or directory` para un encabezado: la librería no está instalada;
  agrégala mediante **Libraries** ([cómo](/docs/es/programming/libraries/)).
- Errores de enlazador/secciones en bocetos enormes: el binario no cabe en la
  memoria flash de la placa seleccionada.

Corrige y pulsa **Run** de nuevo. Las compilaciones posteriores a la primera son mucho más rápidas gracias al
almacenamiento en caché.

> **Tip:** pega un error de compilación en el [asistente de IA](/docs/es/ai/overview/)
> — explicar errores en contexto es lo que mejor hace su modo Basic.

## Mientras se ejecuta

- El **punto de estado** junto al nombre de la placa en el árbol de archivos muestra
  Idle / Compiled / Running.
- El **monitor serie** se conecta automáticamente:
  consulta [Monitor serie](/docs/es/programming/serial-monitor/).
- Interactúa con el circuito en vivo: pulsa botones, gira potenciómetros,
  cambia los valores de los sensores desde sus paneles de control.
