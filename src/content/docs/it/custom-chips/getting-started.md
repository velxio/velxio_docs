---
title: Crea il tuo primo chip personalizzato
description: Aggiungi un componente Custom Chip, scrivi qualche riga di C e Velxio lo compila in WebAssembly.
sidebar:
  order: 2
---

Un **chip personalizzato** è un componente che programmi tu stesso. Scrivi C
semplice usando l'API `velxio-chip.h`, Velxio lo compila in WebAssembly nel
cloud, e il risultato si comporta come qualsiasi componente del catalogo: ha pin
che colleghi, attributi che modifichi e logica che viene eseguita all'interno
della simulazione.

## Quando crearne uno

- Il circuito integrato che ti serve non è nel catalogo (un registro a scorrimento
  oscuro, un protocollo sensore proprietario).
- Vuoi un dispositivo di test — un generatore di impulsi, un esercitatore di
  protocollo, un sensore fittizio con valori scriptati.
- Stai insegnando logica digitale e vuoi che gli studenti _implementino_ il
  chip, non solo lo usino.

## La versione in cinque minuti

1. Apri il [selettore componenti](/docs/it/circuit-editor/placing-components/)
   e aggiungi un **Custom Chip** alla tela.
2. Si apre la galleria di esempi — scegli un punto di partenza (o inizia da
   vuoto).
3. Ti ritrovi nel normale editor di codice: il chip ha una propria sezione
   nell'esplora file con due file ordinari —
   - **`chip.c`** — il comportamento;
   - **`chip.json`** — il manifest: nome, pin, attributi (validati
     con completamenti mentre digiti).
   Questo è l'esempio integrato **Inverter**:

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

con il suo manifest:

```json
{
  "schema": "velxio-chip/v1",
  "name": "Inverter",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

4. Collega `IN` a un pulsante e `OUT` a un LED, poi premi **Run** — il
   chip viene compilato automaticamente ogni volta che il suo sorgente cambia
   (il pulsante martello nella sezione dell'esplora file del chip lo compila
   da solo, con errori nella console di output come qualsiasi compilatore C).
5. Prova a commutare. Fai clic sul chip mentre la simulazione è ferma per
   tornare al suo `chip.c`; modifica e premi di nuovo **Run**.

## Dare un aspetto al chip

Per impostazione predefinita, un chip viene disegnato come un corpo scuro con
il suo nome su una fascia serigrafica e le etichette dei pin attorno al bordo.
Puoi sostituire quell'aspetto con la tua grafica — una foto del vero modulo
di sviluppo, un disegno dal datasheet, un'icona:

Fai clic sul pulsante **image** nella sezione dell'esplora file del chip
(accanto a Compile) e scegli un **PNG, JPEG o SVG** fino a 256 KB. Si unisce
a `chip.c` e `chip.json` come un altro file nella sezione di quel chip —
`chip.png`, `chip.jpg` o `chip.svg` — quindi viaggia con il progetto, viene
esportato all'interno di un `.vlx` e viene incluso quando salvi il chip in
[My Chips](/docs/it/custom-chips/my-chips/).

L'immagine viene ridimensionata per adattarsi al corpo del chip, mai ritagliata
o stirata. **I pin non si spostano**: le loro posizioni provengono ancora da
`chip.json`, quindi aggiungere grafica a un chip cablato lascia ogni filo
esattamente dove era. Le etichette dei pin rimangono sopra l'immagine,
disegnate in bianco con un contorno scuro in modo che siano leggibili sia su
grafica chiara che scura, e il nome stampato lascia il posto alla grafica
(rimane nel suggerimento al passaggio del mouse).

Per rimuoverla, usa il pulsante accanto a quello dell'immagine, oppure elimina
il file immagine dalla sezione del chip.

:::tip
Un SVG offre la grafica del chip più nitida a qualsiasi livello di zoom e puoi
incollare markup `<svg>` grezzo direttamente in un file `chip.svg` invece di
caricarlo.
:::

## Come vengono eseguiti i chip

L'host chiama il tuo `chip_setup()` una volta per ogni istanza del chip. Dopo
di che il chip è **reattivo**: il tuo codice viene eseguito solo all'interno
di callback — un pin osservato è cambiato, un byte I2C è arrivato, un timer è
scattato. Non c'è un ciclo principale da bloccare, ed è questo che rende i
chip personalizzati abbastanza economici da poter essere sparsi in un circuito.

## Chip di esempio integrati

L'editor di chip include sorgenti funzionanti che puoi caricare e modificare:
porte logiche (inverter, XOR), registri a scorrimento (74HC595, CD4094),
componenti I2C (PCF8574, DS3231 RTC, EEPROM 24Cxx), un ADC SPI (MCP3008), un
trasformatore UART ROT13, un contatore di impulsi — e una **collezione di CPU
retro** (Intel 4004 e amici) per i veramente avventurosi.

Successivo: il [riferimento API dei chip](/docs/it/custom-chips/api/).
