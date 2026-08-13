---
title: Erstellen Sie Ihren ersten eigenen Chip
description: Fügen Sie ein Custom-Chip-Bauteil hinzu, schreiben Sie ein paar Zeilen C, und Velxio kompiliert es zu WebAssembly.
sidebar:
  order: 2
---

Ein **Custom Chip** ist ein Bauteil, das Sie selbst programmieren. Sie schreiben
einfaches C gegen die `velxio-chip.h`-API, Velxio kompiliert es in der
Cloud zu WebAssembly, und das Ergebnis verhält sich wie jedes Katalog-Bauteil:
Es hat Pins, die Sie verdrahten, Attribute, die Sie bearbeiten, und Logik,
die innerhalb der Simulation läuft.

## Wann Sie einen bauen sollten

- Der IC, den Sie benötigen, ist nicht im Katalog (ein obskures Schieberegister,
  ein proprietäres Sensorprotokoll).
- Sie möchten eine Testvorrichtung — einen Pulsgenerator, einen Protokoll-Treiber,
  einen simulierten Sensor mit skriptgesteuerten Werten.
- Sie unterrichten digitale Logik und möchten, dass Studenten den Chip
  _implementieren_, nicht nur verwenden.

## Die Fünf-Minuten-Version

1. Öffnen Sie die [Bauteilauswahl](/docs/de/circuit-editor/placing-components/)
   und fügen Sie einen **Custom Chip** zur Zeichenfläche hinzu.
2. Öffnen Sie den Editor des Chips (Rechtsklick auf den Chip). Sie erhalten zwei Dateien:
   - **C-Quellcode** — das Verhalten;
   - **`chip.json`** — das Manifest: Name, Pins, Attribute.
3. Beginnen Sie mit dem integrierten **Inverter**-Beispiel:

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

mit seinem Manifest:

```json
{
  "schema": "velxio-chip/v1",
  "name": "Inverter",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

4. **Compile** (Kompilieren) Sie im Dialog — Fehler werden wie bei jedem C-Compiler angezeigt.
5. Verdrahten Sie `IN` mit einem Taster und `OUT` mit einer LED, drücken Sie **Run** (Ausführen), und schalten Sie nach Herzenslust.

## Wie Chips ausgeführt werden

Der Host ruft Ihr `chip_setup()` einmal pro Chip-Instanz auf. Danach ist der
Chip **reaktiv**: Ihr Code läuft nur innerhalb von Callbacks — ein überwachter Pin
hat sich geändert, ein I2C-Byte ist angekommen, ein Timer ist ausgelöst. Es gibt
keine Hauptschleife, die blockiert, und genau das macht Custom Chips so
kostengünstig, dass man sie überall in einer Schaltung verteilen kann.

## Integrierte Beispiel-Chips

Der Chip-Editor enthält funktionierende Quellen, die Sie laden und ändern können:
Logikgatter (Inverter, XOR), Schieberegister (74HC595, CD4094), I2C-Bauteile
(PCF8574, DS3231 RTC, 24Cxx-EEPROMs), einen SPI-ADC (MCP3008), einen UART-
ROT13-Wandler, einen Pulszähler — und eine **Retro-CPU-Sammlung**
(Intel 4004 und Verwandte) für die wirklich Abenteuerlustigen.

Weiter: die [Chips-API-Referenz](/docs/de/custom-chips/api/).
