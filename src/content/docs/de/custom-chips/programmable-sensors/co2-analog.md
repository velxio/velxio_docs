---
title: "Tutorial: ein analoger CO2-Sensor"
description: Bauen Sie einen eigenen Chip, der eine Spannung aus einem Live-ppm-Regler ausgibt, verbinden Sie ihn mit einem Arduino-Analogpin und beobachten Sie, wie analogRead den Regler in Echtzeit verfolgt.
sidebar:
  order: 4
---

Der kürzeste vollständige programmierbare Sensor: ein Regler von 400 bis 5000 ppm,
eine Spannung an einem Pin und ein Arduino, das sie zurückliest. Zehn Minuten von
Anfang bis Ende, und die Form, die Sie für jeden analogen Sensor danach kopieren werden.

:::tip[Offene die fertige Schaltung]
Alles unten, bereits verdrahtet und bereit zum Ausführen:
[CO2-Sensor (Live-Regler)](https://velxio.dev/example/co2-sensor-live-slider).
Derselbe Chip ist auch eine Vorlage im Dialog für neue Chips, falls Sie
ihn lieber in ein eigenes Projekt einfügen möchten.
:::

## Was Sie bauen

```
   [ CO2-Sensor-Chip ]                 [ Arduino Uno ]
        VCC  o------------------------o 5V
        GND  o------------------------o GND
        OUT  o------------------------o A0

   Regler 400..5000 ppm   ->   OUT 0..5 V   ->   analogRead(A0)
```

## Schritt 1: Den Chip erstellen

Fügen Sie einen benutzerdefinierten Chip über den Datei-Explorer des Editors hinzu. Ein Dialog bietet die
eingebauten Vorlagen sowie **Start from blank** (Von leer beginnen); nehmen Sie die leere Vorlage, um
mitzumachen. In beiden Fällen erhalten Sie zwei Dateien: das Manifest
(`chip.json`) und den Quellcode (`chip.c`).

## Schritt 2: Das Manifest

Drei Pins, ein Attribut, ein Steuerelement. Die `id` des Steuerelements und der
`name` des Attributs müssen übereinstimmen; das verbindet sie.

```json title="chip.json"
{
  "schema": "velxio-chip/v1",
  "name": "CO2 Sensor",
  "description": "Analog CO2 sensor with a live ppm slider. OUT maps 400-5000 ppm to 0-5 V.",
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

## Schritt 3: Der Quellcode

Ein sich wiederholender Timer wandelt ppm in Volt um und steuert den Pin. Beachten Sie,
wo `vx_attr_read` sitzt: **innerhalb** des Callbacks, sodass jeder Tick die
aktuelle Position des Reglers sieht.

```c title="chip.c"
#include "velxio-chip.h"

#define PPM_MIN   400.0
#define PPM_MAX  5000.0
#define VOLTS_MAX   5.0

typedef struct {
  vx_pin   out;
  vx_attr  ppm;
  vx_timer timer;
} chip_state_t;

static chip_state_t S;

static void on_tick(void *user_data) {
  (void)user_data;
  double ppm = vx_attr_read(S.ppm);          /* live slider value */
  if (ppm < PPM_MIN) ppm = PPM_MIN;
  if (ppm > PPM_MAX) ppm = PPM_MAX;
  double volts = (ppm - PPM_MIN) / (PPM_MAX - PPM_MIN) * VOLTS_MAX;
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out   = vx_pin_register("OUT", VX_ANALOG);
  S.ppm   = vx_attr_register("ppm", 1000);
  S.timer = vx_timer_create(on_tick, 0);
  vx_timer_start(S.timer, 50000000ULL, true);  /* 50 ms, in nanoseconds */
  on_tick(0);                                  /* drive the initial level */
  vx_log("co2 sensor ready");
}
```

Drei Details, die wichtig sind:

- `VX_ANALOG` am Pin. Ein digitaler Pin kann keine Zwischenspannung
  führen, und `vx_pin_dac_write` darauf wird nicht das tun, was Sie wollen.
- `vx_timer_start` erwartet **Nanosekunden**. `50000000ULL` entspricht 50 ms. Das ist
  der häufigste Tippfehler bei einem ersten Chip.
- Der nackte `on_tick(0)`-Aufruf vor der Rückkehr. Ohne ihn liegt der Pin bis zum
  ersten Timer-Tick bei 0 V, und ein schnelles Skript liest das als fälschliche
  400 ppm.

Drücken Sie **Compile** (Kompilieren).

## Schritt 4: Verdrahten

Legen Sie den Chip neben einem Arduino Uno auf der Leinwand ab und verbinden Sie `VCC` mit
`5V`, `GND` mit `GND` und `OUT` mit `A0`.

![Der CO2-Sensor-Chip, verdrahtet mit einem Arduino Uno: VCC an 5V, GND an GND, OUT an A0](../../../../../assets/docs/custom-chips/sensor-circuit.png)

## Schritt 5: Das Skript

```cpp title="sketch.ino"
void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(A0);
  float volts = raw * (5.0f / 1023.0f);
  float ppm = 400.0f + volts / 5.0f * 4600.0f;
  Serial.print("raw="); Serial.print(raw);
  Serial.print("  ppm="); Serial.println(ppm, 0);
  delay(500);
}
```

## Schritt 6: Ausführen und ziehen

Drücken Sie **Run** (Ausführen), dann **klicken Sie auf den Chip**. Das Regler-Panel öffnet sich:

![Das Live-Panel des Chips während der Simulation läuft: ein CO2-Regler in ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Ziehen Sie ihn, und die serielle Ausgabe folgt innerhalb eines `delay(500)`:

![Der serielle Monitor verfolgt den Regler: ppm-Messwerte springen von 1000 auf 3000](../../../../../assets/docs/custom-chips/sensor-serial-tracking.png)

Das ist die ganze Schleife: Der Regler schreibt das Attribut, der Timer liest
es 20 Mal pro Sekunde, die Pin-Spannung ändert sich, und `analogRead` sieht es.

## Wenn es nicht funktioniert

| Was Sie sehen | Fast immer |
| --- | --- |
| Ein Klick auf den Chip öffnet nichts | Die Simulation ist gestoppt: Das Panel öffnet sich nur, während sie läuft |
| Der Regler erscheint, aber der Messwert bewegt sich nie | `vx_attr_read` wird in `chip_setup()` aufgerufen und zwischengespeichert, statt innerhalb von `on_tick` |
| `analogRead` gibt nur 0 oder 1023 zurück | Der Pin wurde als digitaler Modus statt als `VX_ANALOG` registriert |
| Der Wert aktualisiert sich einmal und friert ein | `vx_timer_start` wurde mit `repeat` false aufgerufen, oder das Intervall wurde in Millisekunden geschrieben, sodass der nächste Tick 50000 Sekunden entfernt ist |
| Serial zeigt für den ersten Moment 400 ppm | Der anfängliche `on_tick(0)`-Aufruf fehlt |

## Weiter

- Dieselbe Idee hinter einem digitalen Protokoll:
  [Temperatur und Luftfeuchtigkeit über I2C](/docs/de/custom-chips/programmable-sensors/i2c-env/).
- Jedes Feld, das Sie in `controls` einfügen können:
  [die Referenz](/docs/de/custom-chips/programmable-sensors/reference/).
- Für andere Projekte aufbewahren: [My Chips](/docs/de/custom-chips/my-chips/).
