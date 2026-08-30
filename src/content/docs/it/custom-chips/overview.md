---
title: Panoramica dei chip personalizzati
description: "Crea i tuoi componenti con l'API dei chip personalizzati di Velxio."
sidebar:
  order: 1
---

Quando il componente che ti serve non è nel catalogo, puoi costruirlo da solo. Un
**custom chip** è un piccolo programma (compilato in WebAssembly) che definisce
i pin e il comportamento del tuo componente: può pilotare e leggere GPIO, parlare
I2C, SPI o UART, esporre attributi al pannello delle proprietà e persino disegnare
su un framebuffer.

In questa sezione:

- **Getting started** — crea il tuo primo custom chip dall'editor.
- **Programmable sensors** — slider live che pilotano il tuo chip mentre la
  simulazione è in esecuzione (`controls` in chip.json).
- **My Chips** — salva un chip una volta, riutilizzalo in qualsiasi progetto (Pro).
- **API reference** — ogni funzione in `velxio-chip.h`: GPIO, I2C, SPI,
  UART, tempo, attributi e framebuffer.
