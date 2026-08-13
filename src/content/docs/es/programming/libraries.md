---
title: Uso de bibliotecas
description: Busca, instala y fija bibliotecas de Arduino para tu proyecto.
sidebar:
  order: 5
---

Haz clic en **Libraries** (Bibliotecas) en la barra de herramientas para buscar en el registro de bibliotecas de Arduino
y añadir bibliotecas a la placa activa.

Las bibliotecas instaladas se registran en el archivo **`libraries.json`** de la placa
(visible en el árbol de archivos), por lo que viajan con el proyecto: cualquiera que
lo abra — incluido tu yo futuro — obtiene las mismas versiones resueltas en
tiempo de compilación. No hay carpeta de bibliotecas por máquina que mantener sincronizada.

## Uso de una biblioteca

Instálala y luego usa `#include` como de costumbre:

```cpp
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
```

El compilador en la nube obtiene las bibliotecas declaradas (además de sus
dependencias) antes de compilar. Si una compilación falla con
`No such file or directory` en un encabezado, la biblioteca que proporciona ese
encabezado aún no está declarada — agrégala a través de **Libraries** (Bibliotecas).

## MicroPython

El firmware de MicroPython incluye sus módulos estándar integrados
(`machine`, `network`, `time`, …). Los módulos auxiliares de Python puro se pueden añadir
como archivos adicionales en el árbol de archivos junto a `main.py` e importarse normalmente.

## Los ejemplos vienen precableados

Cada ejemplo de la galería declara las bibliotecas que necesita — al abrir uno obtienes
una combinación probada de código + circuito + versiones de bibliotecas, lo que
los convierte en buenos puntos de partida para tus propios proyectos.
