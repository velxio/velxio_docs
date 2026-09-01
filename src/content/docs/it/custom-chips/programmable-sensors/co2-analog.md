---
title: "Tutorial: un sensore CO2 analogico"
description: Costruisci un chip personalizzato che emette una tensione da un cursore ppm live, collegalo a un pin analogico Arduino e osserva analogRead seguire il cursore in tempo reale.
sidebar:
  order: 4
---

Il sensore programmabile completo più breve: un cursore da 400 a 5000 ppm,
una tensione su un pin e un Arduino che la legge. Dieci minuti dall'inizio
alla fine, e la forma che copierai per ogni sensore analogico d'ora in poi.

:::tip[Apri il circuito finito]
Tutto ciò che segue, già cablato e pronto per l'esecuzione:
[Sensore CO2 (cursore live)](https://velxio.dev/example/co2-sensor-live-slider).
Lo stesso chip è anche un modello nella finestra di dialogo per i nuovi chip, se preferisci
inserirlo in un tuo progetto.
:::

## Cosa stai costruendo

```
   [ Chip Sensore CO2 ]                 [ Arduino Uno ]
        VCC  o------------------------o 5V
        GND  o------------------------o GND
        OUT  o------------------------o A0

   cursore 400..5000 ppm   ->   OUT 0..5 V   ->   analogRead(A0)
```

## Passo 1: crea il chip

Aggiungi un chip personalizzato dall'esplora file dell'editor. Una finestra di dialogo offre i
modelli integrati più **Start from blank** (Inizia da vuoto); scegli quello vuoto per
seguire il tutorial. In entrambi i casi ottieni due file: il manifest
(`chip.json`) e il sorgente (`chip.c`).

## Passo 2: il manifest

Tre pin, un attributo, un controllo. L'`id` del controllo e il
`name` dell'attributo devono corrispondere; è questo che li collega.

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

## Passo 3: il sorgente

Un timer ripetuto converte ppm in volt e pilota il pin. Nota dove si trova
`vx_attr_read`: **dentro** la callback, così ogni tick vede la
posizione corrente del cursore.

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
  double ppm = vx_attr_read(S.ppm);          /* valore live del cursore */
  if (ppm < PPM_MIN) ppm = PPM_MIN;
  if (ppm > PPM_MAX) ppm = PPM_MAX;
  double volts = (ppm - PPM_MIN) / (PPM_MAX - PPM_MIN) * VOLTS_MAX;
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out   = vx_pin_register("OUT", VX_ANALOG);
  S.ppm   = vx_attr_register("ppm", 1000);
  S.timer = vx_timer_create(on_tick, 0);
  vx_timer_start(S.timer, 50000000ULL, true);  /* 50 ms, in nanosecondi */
  on_tick(0);                                  /* imposta il livello iniziale */
  vx_log("co2 sensor ready");
}
```

Tre dettagli che contano:

- `VX_ANALOG` sul pin. Un pin digitale non può trasportare una
  tensione intermedia, e `vx_pin_dac_write` su di esso non farà ciò che vuoi.
- `vx_timer_start` accetta **nanosecondi**. `50000000ULL` corrisponde a 50 ms. Questo è
  l'errore di battitura più comune in un primo chip.
- La chiamata nuda `on_tick(0)` prima di restituire il controllo. Senza di essa il pin rimane a 0 V
  fino al primo scatto del timer, e uno sketch veloce lo legge come un
  400 ppm spurio.

Premi **Compile** (Compila).

## Passo 4: cablalo

Trascina il chip sulla tela accanto a un Arduino Uno e collega `VCC` a
`5V`, `GND` a `GND` e `OUT` a `A0`.

![Il chip sensore CO2 cablato a un Arduino Uno: VCC a 5V, GND a GND, OUT a A0](../../../../../assets/docs/custom-chips/sensor-circuit.png)

## Passo 5: lo sketch

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

## Passo 6: esegui e trascina

Premi **Run** (Esegui), poi **fai clic sul chip**. Si apre il pannello del cursore:

![Il pannello live del chip durante la simulazione: un cursore CO2 in ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Trascinalo e l'output seriale lo segue entro un `delay(500)`:

![Il monitor seriale che traccia il cursore: letture ppm che saltano da 1000 a 3000](../../../../../assets/docs/custom-chips/sensor-serial-tracking.png)

Questo è l'intero ciclo: il cursore scrive l'attributo, il timer lo legge
20 volte al secondo, la tensione del pin cambia e `analogRead` la vede.

## Quando non funziona

| Cosa vedi | Quasi sempre |
| --- | --- |
| Fare clic sul chip non apre nulla | La simulazione è ferma: il pannello si apre solo mentre è in esecuzione |
| Il cursore appare ma la lettura non si muove mai | `vx_attr_read` viene chiamato in `chip_setup()` e memorizzato nella cache, invece che dentro `on_tick` |
| `analogRead` restituisce solo 0 o 1023 | Il pin è stato registrato in modalità digitale invece che `VX_ANALOG` |
| Il valore si aggiorna una volta e si blocca | `vx_timer_start` è stato chiamato con `repeat` false, oppure l'intervallo è stato scritto in millisecondi, quindi il prossimo tick è a 50000 secondi di distanza |
| Serial mostra 400 ppm per il primo istante | Manca la chiamata iniziale `on_tick(0)` |

## Passi successivi

- La stessa idea dietro un protocollo digitale:
  [temperatura e umidità su I2C](/docs/it/custom-chips/programmable-sensors/i2c-env/).
- Ogni campo che puoi inserire in `controls`:
  [il riferimento](/docs/it/custom-chips/programmable-sensors/reference/).
- Conservalo per altri progetti: [I miei chip](/docs/it/custom-chips/my-chips/).
