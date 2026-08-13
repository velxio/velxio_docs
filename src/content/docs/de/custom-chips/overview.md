---
title: Übersicht über benutzerdefinierte Chips
description: Erstellen Sie Ihre eigenen Komponenten mit der Velxio Custom-Chips-API.
sidebar:
  order: 1
---

Wenn das benötigte Bauteil nicht im Katalog enthalten ist, können Sie es selbst erstellen. Ein
**Custom Chip** ist ein kleines Programm (kompiliert zu WebAssembly), das
die Pins und das Verhalten Ihrer Komponente definiert: Es kann GPIOs ansteuern und lesen, I2C,
SPI oder UART sprechen, Attribute im Eigenschaftenbereich bereitstellen und sogar in einen
Framebuffer zeichnen.

In diesem Abschnitt:

- **Getting started** — Erstellen Sie Ihren ersten Custom Chip aus dem Editor.
- **Tutorial** — Bauen Sie Schritt für Schritt einen vollständigen Chip.
- **API-Referenz** — Jede Funktion in `velxio-chip.h`: GPIO, I2C, SPI,
  UART, Zeit, Attribute und Framebuffer.
