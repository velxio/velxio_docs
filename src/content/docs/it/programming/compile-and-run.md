---
title: Compilazione ed esecuzione
description: Cosa succede quando premi Play — compilazione cloud, firmware reale e come leggere gli errori.
sidebar:
  order: 3
---

## Cosa fa Run

**Run** compila il codice della scheda attiva (se necessario) e avvia il risultato
sulla scheda emulata. Non c'è alcuna "simulazione del tuo codice sorgente" —
Velxio crea un **binario firmware reale** con la toolchain reale
(arduino-cli / ESP-IDF / MicroPython) e lo esegue istruzione per
istruzione.

- **Compile** (Ctrl+B) compila senza eseguire — utile per controllare gli errori
  rapidamente.
- **Stop** interrompe la simulazione; **Reset** riavvia il firmware dall'inizio.

## La console Output

Il pannello **OUTPUT** in basso a sinistra mostra il flusso della build: risoluzione
delle librerie, invocazioni del compilatore, utilizzo della memoria e infine
`Compilation successful`. È lo stesso output che ti darebbero l'Arduino IDE o
`idf.py build`.

## Leggere gli errori di compilazione

Gli errori arrivano esattamente come li emette il compilatore, con file e riga:

- `'foo' was not declared in this scope` — errore di battitura o `#include` mancante.
- `No such file or directory` per un header — la libreria non è installata;
  aggiungila tramite **Libraries** ([come](/docs/it/programming/libraries/)).
- Errori del linker/sezioni su sketch enormi — il binario non entra nella
  flash della scheda selezionata.

Correggi, premi di nuovo **Run**. Le build successive alla prima sono molto più
veloci grazie alla cache.

> **Suggerimento:** incolla un errore di compilazione nell'[assistente AI](/docs/it/ai/overview/)
> — spiegare gli errori nel contesto è ciò che la sua modalità Basic sa fare meglio.

## Mentre è in esecuzione

- Il **punto di stato** accanto al nome della scheda nell'albero dei file mostra
  Idle / Compiled / Running.
- Il **monitor seriale** si collega automaticamente —
  vedi [Monitor seriale](/docs/it/programming/serial-monitor/).
- Interagisci con il circuito dal vivo: premi pulsanti, ruota i potenziometri,
  modifica i valori dei sensori dai loro pannelli di controllo.
```
