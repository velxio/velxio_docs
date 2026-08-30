---
title: "Descripción general de los chips personalizados"
description: "Crea tus propios componentes con la API de chips personalizados de Velxio."
sidebar:
  order: 1
---

Cuando la pieza que necesitas no está en el catálogo, puedes crearla tú mismo. Un
**chip personalizado** es un pequeño programa (compilado a WebAssembly) que define
los pines y el comportamiento de tu componente: puede controlar y leer GPIOs, comunicarse por I2C,
SPI o UART, exponer atributos al panel de propiedades e incluso dibujar en un
framebuffer.

En esta sección:

- **Getting started** (Primeros pasos) — crea tu primer chip personalizado desde el editor.
- **Programmable sensors** (Sensores programables) — controles deslizantes en vivo que manejan tu chip mientras la
  simulación se ejecuta (`controls` en chip.json).
- **My Chips** (Mis chips) — guarda un chip una vez, reutilízalo en cualquier proyecto (Pro).
- **API reference** (Referencia de la API) — cada función en `velxio-chip.h`: GPIO, I2C, SPI,
  UART, tiempo, atributos y framebuffer.
