---
title: Crea il tuo primo chip personalizzato
description: Aggiungi un componente Custom Chip, scrivi qualche riga di C e Velxio lo compila in WebAssembly.
sidebar:
  order: 2
---

Un **chip personalizzato** è un componente che programmi tu stesso. Scrivi C
semplice usando l'API `velxio-chip.h`, Velxio lo compila in WebAssembly nel
cloud, e il risultato si comporta come qualsiasi componente del catalogo: ha pin che colleghi,
attributi che modifichi e logica che viene eseguita all'interno della simulazione.

## Quando crearne uno

- Il circuito integrato che ti serve non è nel catalogo (un registro a scorrimento oscuro, un
  protocollo sensore proprietario).
- Vuoi un banco di prova — un generatore di impulsi, un esercitatore di protocolli, un
  sensore fittizio con valori scriptati.
- Insegni logica digitale e vuoi che gli studenti _implementino_ il
  chip, non solo lo usino.

## La versione in cinque minuti

1. Apri il [selettore componenti](/docs/it/circuit-editor/placing-components/)
   e aggiungi un **Custom Chip** alla tela.
2. Apri l'editor del chip (fai clic con il tasto destro sul chip). Ottieni due file:
   - **C source** — il comportamento;
   - **`chip.json`** — il manifest: nome, pin, attributi.
3. Parti dall'esempio integrato **Inverter**:

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

4. **Compile** (Compila) nella finestra di dialogo — gli errori vengono restituiti come quelli di qualsiasi compilatore C.
5. Collega `IN` a un pulsante e `OUT` a un LED, premi **Run** (Esegui) e alterna
   pure.

## Come vengono eseguiti i chip

L'host chiama la tua `chip_setup()` una volta per ogni istanza del chip. Dopo di che il
chip è **reattivo**: il tuo codice viene eseguito solo all'interno di callback — un pin osservato
è cambiato, un byte I2C è arrivato, un timer è scattato. Non c'è un ciclo principale da
bloccare, ed è questo che rende i chip personalizzati abbastanza economici da poter essere sparsi in un
circuito.

## Chip di esempio integrati

L'editor dei chip include sorgenti funzionanti che puoi caricare e modificare: porte
logiche (inverter, XOR), registri a scorrimento (74HC595, CD4094), componenti I2C
(PCF8574, RTC DS3231, EEPROM 24Cxx), un ADC SPI (MCP3008), un trasformatore
UART ROT13, un contatore di impulsi — e una **collezione di CPU retrò**
(Intel 4004 e affini) per i veramente avventurosi.

Prossimo: il [riferimento API dei chip](/docs/it/custom-chips/api/).
