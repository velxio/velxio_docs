---
title: Übersicht über benutzerdefinierte Chips
description: Erstellen Sie Ihre eigenen Komponenten mit der Velxio-API für benutzerdefinierte Chips.
sidebar:
  order: 1
---

Wenn das benötigte Bauteil nicht im Katalog enthalten ist, können Sie es selbst erstellen. Ein
**benutzerdefinierter Chip** ist ein kleines Programm (kompiliert zu WebAssembly), das
die Pins und das Verhalten Ihrer Komponente definiert: Es kann GPIOs ansteuern und lesen, I2C,
SPI oder UART sprechen, Attribute im Eigenschaftenbereich bereitstellen und sogar in einen
Framebuffer zeichnen.

In diesem Abschnitt:

- **Getting started** (Erste Schritte) — Erstellen Sie Ihren ersten benutzerdefinierten Chip aus dem Editor.
- **Programmable sensors** (Programmierbare Sensoren) — Live-Schieberegler, die Ihren Chip während der
  Simulation steuern (`controls` in chip.json).
- **My Chips** (Meine Chips) — Speichern Sie einen Chip einmal und verwenden Sie ihn in jedem Projekt (Pro).
- **API reference** (API-Referenz) — Jede Funktion in `velxio-chip.h`: GPIO, I2C, SPI,
  UART, Zeit, Attribute und Framebuffer.
