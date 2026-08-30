---
title: Sensori programmabili con slider dal vivo
description: Costruisci un sensore il cui valore puoi modificare con uno slider mentre la simulazione è in esecuzione, utilizzando la sezione controls di chip.json.
sidebar:
  order: 3
---

Un chip personalizzato può essere un **sensore programmabile**: un componente il cui output
puoi pilotare da uno slider *mentre la simulazione è in esecuzione*. Pensa a un sensore di CO2
di cui vari i ppm per testare le soglie, una sonda di temperatura/umidità dietro
I2C, un sensore di luce, un potenziometro con una mente propria — qualsiasi cosa
in cui "e se il valore cambiasse?" è il punto centrale.

## La ricetta

Tre ingredienti, tutti nel chip che già sai scrivere:

1. **Un attributo** — il valore regolabile: `vx_attr_register("ppm", 1000)`.
2. **Una sezione `controls`** in `chip.json` — è ciò che mette lo slider
   sullo schermo durante la simulazione:

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

3. **Rileggi l'attributo all'interno di una callback o di un timer** — non memorizzarlo mai nella cache,
   lo slider lo modifica a metà esecuzione:

```c
#include "velxio-chip.h"

typedef struct { vx_pin out; vx_attr ppm; vx_timer t; } chip_state_t;
static chip_state_t S;

static void on_tick(void *ud) {
  double ppm = vx_attr_read(S.ppm);              /* valore live dello slider */
  double volts = (ppm - 400.0) / 4600.0 * 5.0;   /* 400..5000 -> 0..5 V */
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out = vx_pin_register("OUT", VX_ANALOG);
  S.ppm = vx_attr_register("ppm", 1000);
  S.t = vx_timer_create(on_tick, 0);
  vx_timer_start(S.t, 50000000ULL, true);        /* 50 ms, nanosecondi */
  on_tick(0);
}
```

Collega `OUT` a un pin analogico della scheda (ad esempio Arduino `A0`), premi **Run** e
fai clic sul chip: si apre il pannello dello slider. Trascinalo e `analogRead(A0)`
lo segue in tempo reale.

## Come si collegano i pezzi

- Ogni voce di `controls` pilota **l'attributo con lo stesso id** —
  `vx_attr_read` restituisce il nuovo valore nell'istante in cui lo slider si muove.
- `type: "range"` è uno slider; `type: "button"` invia un impulso momentaneo
  `1 → 0` (circa 150 ms), per input di trigger/reset.
- Nessuna sezione `controls`? Qualsiasi attributo che dichiari sia `min` che
  `max` ottiene automaticamente uno slider dal vivo — la maggior parte dei chip esistenti
  è regolabile senza toccare il loro manifest.
- La forma di `controls` è compatibile con Wokwi; `unit` e `scale: "log"`
  sono estensioni Velxio che Wokwi ignora.
- I valori predefiniti in fase di progettazione si trovano nell'ispettore delle parti (fai clic con il tasto destro
  sul chip mentre è fermo).

## Modelli già pronti

La galleria degli esempi include due sensori costruiti esattamente in questo modo:

- **CO2 Sensor (slider dal vivo)** — la ricetta analogica sopra, testuale.
- **I2C Env Sensor (slider dal vivo)** — temperatura + umidità dietro una
  mappa di registri I2C a `0x44`, entrambi pilotati da slider; il modello per
  qualsiasi sensore con protocollo digitale.

Salva la tua variante in [My Chips](/docs/it/custom-chips/my-chips/) e
sarà a un clic di distanza in ogni progetto.
