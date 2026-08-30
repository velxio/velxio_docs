---
title: Portare i chip Wokwi su Velxio
description: I chip scritti per l'API C dei chip personalizzati Wokwi vengono compilati su Velxio senza modifiche, e i progetti Wokwi in formato zip vengono importati con i loro chip.
sidebar:
  order: 5
---

Se hai scritto chip personalizzati per Wokwi, questi funzionano anche qui: Velxio è
**compatibile a livello di codice sorgente** con l'API C documentata dei chip personalizzati Wokwi.

## Stesso C, invariato

`#include "wokwi-api.h"` viene risolto in un header di compatibilità indipendente
che adatta ogni simbolo documentato all'API nativa `vx_*` di Velxio al
momento della compilazione:

- `chip_init()` è il punto di ingresso, esattamente come su Wokwi.
- `pin_init`, `pin_read`, `pin_write`, `pin_mode`, `pin_watch` (con la sua
  `pin_watch_config_t`), `pin_adc_read`, `pin_dac_write` — tutti presenti.
- `i2c_init`, `uart_init`, `spi_init` accettano le loro struct di configurazione; i campi
  (`connect`/`read`/`write`/`disconnect`, `rx_data`/`write_done`,
  `done`) vengono tradotti uno a uno.
- `attr_init` / `attr_read` (e le varianti `_float` e stringa),
  `timer_init` / `timer_start` (microsecondi, convertiti per te) /
  `timer_start_ns` / `timer_stop`, `get_sim_nanos`,
  `framebuffer_init` / `buffer_write` / `buffer_read`.
- `INPUT`/`OUTPUT`/`INPUT_PULLUP`/`INPUT_PULLDOWN`/`ANALOG`,
  `OUTPUT_LOW`/`OUTPUT_HIGH`, `LOW`/`HIGH`, `RISING`/`FALLING`/`BOTH`,
  `NO_PIN` — valori identici.

Compilalo come qualsiasi chip Velxio: incolla il C nel file `chip.c` di un
Chip Personalizzato e premi **Run** (Esegui).

## Compatibilità con chip.json

`name`, l'array posizionale `pins` (con gli slot vuoti `""`),
`attributes`, `controls` (slider interattivi) e `display` funzionano come su
Wokwi. `symbol` e le grafiche SVG personalizzate vengono ignorati — Velxio disegna
il proprio corpo chip generico dimensionato in base al numero di pin.

## Progetti in formato zip

**File → Open project** (Apri progetto) accetta un progetto Wokwi in formato zip. Un componente
`chip-<name>` in `diagram.json` diventa un Chip Personalizzato con i suoi sorgenti
caricati dai file adiacenti `<name>.chip.c` / `<name>.chip.json`, con i collegamenti
intatti. Le esportazioni riscrivono lo stesso layout.

## Cosa non viene trasferito

- **Binari `.wasm` precompilati** — lo spazio dei nomi di importazione di Velxio è diverso;
  ricompila dal sorgente (richiede pochi secondi, e l'importazione dello zip lo fa
  al primo **Run**).
- L'API di introspezione sperimentale `_mcu_*`.

## Preferisci l'API nativa per i nuovi chip

Il livello di compatibilità esiste per far funzionare il tuo lavoro esistente. Per i nuovi
chip, l'[API nativa `velxio-chip.h`](/docs/it/custom-chips/api/) è lo
stesso insieme di idee con tipi più chiari (tensioni come `double`, timer
in nanosecondi) — ed è ciò che gli esempi, l'agente AI e
[My Chips](/docs/it/custom-chips/my-chips/) parlano in modo nativo.
