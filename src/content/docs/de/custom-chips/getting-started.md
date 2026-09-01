---
title: Erstellen Sie Ihren ersten eigenen Chip
description: Fügen Sie ein Custom-Chip-Bauteil hinzu, schreiben Sie ein paar Zeilen C, und Velxio kompiliert es zu WebAssembly.
sidebar:
  order: 2
---

Ein **Custom Chip** ist eine Komponente, die Sie selbst programmieren. Sie schreiben einfaches C
gegen die `velxio-chip.h`-API, Velxio kompiliert es in der Cloud zu WebAssembly,
und das Ergebnis verhält sich wie jedes Katalogbauteil: Es hat Pins, die Sie verdrahten,
Attribute, die Sie bearbeiten, und Logik, die innerhalb der Simulation läuft.

## Wann Sie einen bauen sollten

- Der IC, den Sie benötigen, ist nicht im Katalog (ein obskures Schieberegister, ein
  proprietäres Sensorprotokoll).
- Sie möchten eine Testvorrichtung — einen Pulsgenerator, einen Protokoll-Übungstreiber, einen
  Fake-Sensor mit skriptierten Werten.
- Sie unterrichten digitale Logik und möchten, dass Studierende den Chip _implementieren_,
  nicht nur verwenden.

## Die Fünf-Minuten-Version

1. Öffnen Sie die [Bauteilauswahl](/docs/de/circuit-editor/placing-components/)
   und fügen Sie einen **Custom Chip** zur Zeichenfläche hinzu.
2. Die Beispielgalerie öffnet sich — wählen Sie einen Ausgangspunkt (oder starten Sie leer).
3. Sie landen im regulären Code-Editor: Der Chip besitzt einen eigenen Abschnitt im
   Datei-Explorer mit zwei gewöhnlichen Dateien —
   - **`chip.c`** — das Verhalten;
   - **`chip.json`** — das Manifest: Name, Pins, Attribute (validiert
     mit Vervollständigung während der Eingabe).
   Dies ist das eingebaute **Inverter**-Beispiel:

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

4. Verdrahten Sie `IN` mit einem Taster und `OUT` mit einer LED, und drücken Sie dann **Run** (Ausführen) — der
   Chip kompiliert automatisch, wann immer sich seine Quelle geändert hat (die Hammer-
   Schaltfläche im Datei-Explorer-Abschnitt des Chips kompiliert ihn separat,
   mit Fehlern in der Ausgabekonsole wie bei jedem C-Compiler).
5. Schalten Sie nach Herzenslust. Klicken Sie auf den Chip, während die Simulation gestoppt ist, um
   zurück zu seiner `chip.c` zu springen; bearbeiten Sie und drücken Sie erneut **Run**.

## Dem Chip ein Gesicht geben

Standardmäßig wird ein Chip als dunkler Körper mit seinem Namen auf einem Siebdruck-
Band und seinen Pin-Beschriftungen am Rand gezeichnet. Sie können dieses Gesicht durch
Ihre eigene Grafik ersetzen — ein Foto der echten Breakout-Platine, eine Zeichnung aus
dem Datenblatt, ein Symbol:

Klicken Sie auf die **image**-Schaltfläche (Bild) im Datei-Explorer-Abschnitt des Chips (neben
Kompilieren) und wählen Sie eine **PNG-, JPEG- oder SVG-Datei** bis zu 256 KB. Sie gesellt sich zu `chip.c`
und `chip.json` als weitere Datei in diesem Chip-Abschnitt — `chip.png`,
`chip.jpg` oder `chip.svg` — sodass sie mit dem Projekt reist, innerhalb
einer `.vlx` exportiert wird und mitkommt, wenn Sie den Chip unter
[My Chips](/docs/de/custom-chips/my-chips/) speichern.

Das Bild wird so skaliert, dass es in den Chip-Körper passt, niemals beschnitten oder gestreckt.
**Pins bewegen sich nicht**: Ihre Positionen stammen weiterhin aus `chip.json`, sodass das
Hinzufügen von Grafiken zu einem verdrahteten Chip jede Leitung exakt dort lässt, wo sie war.
Pin-Beschriftungen bleiben über dem Bild, in Weiß mit dunkler Kontur gezeichnet, damit sie
sowohl auf hellem als auch auf dunklem Bildmaterial lesbar sind, und der gedruckte Name
weicht der Grafik (er bleibt im Hover-Tooltip erhalten).

Zum Entfernen verwenden Sie die Schaltfläche neben der Bild-Schaltfläche oder löschen Sie die Bilddatei
aus dem Chip-Abschnitt.

:::tip
Ein SVG ergibt das schärfste Chip-Gesicht bei jedem Zoom, und Sie können rohes
`<svg>`-Markup direkt in eine `chip.svg`-Datei einfügen, anstatt es hochzuladen.
:::

## Wie Chips ausgeführt werden

Der Host ruft Ihr `chip_setup()` einmal pro Chip-Instanz auf. Danach ist der
Chip **reaktiv**: Ihr Code läuft nur innerhalb von Callbacks — ein überwachter Pin
hat sich geändert, ein I2C-Byte ist angekommen, ein Timer ist abgelaufen. Es gibt keine
Hauptschleife, die blockiert, und genau das hält Custom Chips günstig genug, um sie
in einer Schaltung zu verteilen.

## Eingebaute Beispiel-Chips

Der Chip-Editor enthält funktionierende Quellen, die Sie laden und ändern können: Logik-
Gatter (Inverter, XOR), Schieberegister (74HC595, CD4094), I2C-Bauteile
(PCF8574, DS3231 RTC, 24Cxx-EEPROMS), einen SPI-ADC (MCP3008), einen UART-
ROT13-Wandler, einen Pulszähler — und eine **Retro-CPU-Sammlung**
(Intel 4004 und Verwandte) für die wirklich Abenteuerlustigen.

Weiter: die [ChIP-API-Referenz](/docs/de/custom-chips/api/).
----- END PAGE -----
