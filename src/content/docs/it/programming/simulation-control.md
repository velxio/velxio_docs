---
title: Controllo della simulazione
description: Esegui, ferma, ripristina e interagisci con un circuito live.
sidebar:
  order: 6
---

## Esegui / Ferma / Ripristina

I tre pulsanti di trasporto nella barra degli strumenti:

- **Run** (Esegui) — compila se necessario, avvia il firmware, avvia il mondo.
- **Stop** (Ferma) — interrompe la simulazione. Il circuito mantiene il suo disegno ma
  non viene eseguito nulla.
- **Reset** (Ripristina) — riavvia il firmware dall'inizio senza ricompilare.

Il punto di stato accanto al nome della scheda nell'albero dei file tiene traccia dello stato:
Idle (Inattivo), Compiled (Compilato), Running (In esecuzione).

## Interazione durante l'esecuzione

La tela è live durante la simulazione:

- **Buttons and switches** (Pulsanti e interruttori) rispondono ai clic.
- **Potentiometers, encoders and sensors** (Potenziometri, encoder e sensori) espongono controlli per modificare i loro
  valori — la temperatura di un DHT22, il livello di luce di un LDR — e il firmware
  vede il cambiamento immediatamente.
- **Displays, LEDs and motors** (Display, LED e motori) mostrano il loro stato reale pilotato.

Le modifiche alle proprietà dall'[ispezione dei componenti](/docs/it/circuit-editor/part-inspector/)
si applicano anche in tempo reale.

## Più schede

Un progetto può contenere **più di una scheda**, ciascuna con il proprio codice, scheda
seriale e stato di Run — il selettore della scheda nella barra degli strumenti sceglie quale
l'editor di codice e i pulsanti di trasporto prendono di mira. Le schede possono comunicare tra
loro tramite bus cablati, ed è così che funzionano gli esempi multi-chip.

## Il motore analogico

L'attività dei pin digitali e le parti analogiche vengono risolte insieme: il giallo
**SPICE badge** (distintivo SPICE) sopra il circuito mostra la dimensione della rete analogica e il tempo di
risoluzione. Quando un circuito danneggerebbe un componente (un LED senza resistore in serie,
in modalità elettrica), il verificatore lo segnala prima dell'avvio della simulazione — correggi il
cablaggio o il valore e premi di nuovo Run.
