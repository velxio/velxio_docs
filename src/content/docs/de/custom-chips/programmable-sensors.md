---
title: Programmierbare Sensoren mit Live-Reglern
description: Bauen Sie einen Sensor, dessen Wert Sie während der Simulation mit einem Regler ändern, mithilfe des Abschnitts „controls“ in chip.json.
sidebar:
  order: 3
---

Ein benutzerdefinierter Chip kann ein **programmierbarer Sensor** sein: ein Bauteil, dessen Ausgabe Sie *während die Simulation läuft* über einen Regler steuern. Denken Sie an einen CO2-Sensor, dessen ppm-Wert Sie durchfahren, um Schwellenwerte zu testen, eine Temperatur-/Feuchtigkeitssonde hinter I2C, einen Lichtsensor, ein Potentiometer mit eigenem Kopf — alles, bei dem „Was wäre, wenn sich der Wert ändert?“ der springende Punkt ist.

## Das Rezept

Drei Zutaten, alle in dem Chip, den Sie bereits schreiben können:

1. **Ein Attribut** — der einstellbare Wert: `vx_attr_register("ppm", 1000)`.
2. **Ein `controls`-Abschnitt** in `chip.json` — dieser bringt den Regler während der Simulation auf den Bildschirm:

```json
{
  "name": "CO2 Sensor",
  "pins": ["VCC", "GND", "OUT"],
  "attributes": [
    { "name": "ppm", "label": "CO2 (ppm)", "type": "int",
      "default": 1000, "min": 400, "max": 5000, "step": 10 }
  ],
  "controls": [
    { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
      "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
  ]
}
```

3. **Lesen Sie das Attribut innerhalb eines Callbacks oder Timers erneut** — speichern Sie es niemals zwischen, der Regler ändert es während des Laufs:

```c
#include "velxio-chip.h"

typedef struct { vx_pin out; vx_attr ppm; vx_timer t; } chip_state_t;
static chip_state_t S;

static void on_tick(void *ud) {
  double ppm = vx_attr_read(S.ppm);              /* live slider value */
  double volts = (ppm - 400.0) / 4600.0 * 5.0;   /* 400..5000 -> 0..5 V */
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out = vx_pin_register("OUT", VX_ANALOG);
  S.ppm = vx_attr_register("ppm", 1000);
  S.t = vx_timer_create(on_tick, 0);
  vx_timer_start(S.t, 50000000ULL, true);        /* 50 ms, nanoseconds */
  on_tick(0);
}
```

Verbinden Sie `OUT` mit einem analogen Pin des Boards (z. B. Arduino `A0`), drücken Sie **Run** (Ausführen) und klicken Sie auf den Chip: Das Regler-Panel öffnet sich. Ziehen Sie daran und `analogRead(A0)` folgt in Echtzeit.

## Wie die Teile zusammenhängen

- Jeder `controls`-Eintrag steuert das **Attribut mit derselben id** — `vx_attr_read` gibt den neuen Wert in dem Moment zurück, in dem der Regler bewegt wird.
- `type: "range"` ist ein Regler; `type: "button"` sendet einen kurzen `1 → 0`-Puls (ca. 150 ms), für Trigger-/Reset-Eingänge.
- Kein `controls`-Abschnitt? Jedes Attribut, das sowohl `min` als auch `max` deklariert, erhält automatisch einen Live-Regler — die meisten vorhandenen Chips sind ohne Änderung ihres Manifests einstellbar.
- Die `controls`-Form ist Wokwi-kompatibel; `unit` und `scale: "log"` sind Velxio-Erweiterungen, die Wokwi ignoriert.
- Designzeit-Standardwerte befinden sich im Bauteil-Inspektor (Rechtsklick auf den Chip im gestoppten Zustand).

## Vorgefertigte Vorlagen

Die Beispielgalerie enthält zwei Sensoren, die genau auf diese Weise gebaut sind:

- **CO2 Sensor (Live-Regler)** — das analoge Rezept oben, wortwörtlich.
- **I2C-Umgebungssensor (Live-Regler)** — Temperatur + Feuchtigkeit hinter einer I2C-Registerkarte bei `0x44`, beide über Regler gesteuert; das Muster für jeden Sensor mit digitalem Protokoll.

Speichern Sie Ihre eigene Variante unter [My Chips](/docs/de/custom-chips/my-chips/) und sie ist in jedem Projekt nur einen Klick entfernt.

----- END PAGE -----
