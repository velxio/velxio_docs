---
title: Oscilloscopio
description: Osserva la forma d'onda di qualsiasi pin in tempo reale — canali, base dei tempi e trigger.
sidebar:
  order: 2
---

Attiva l'oscilloscopio con il pulsante **Scope** (oscilloscopio) nella barra degli strumenti. Si apre
come pannello inferiore accanto al monitor seriale.

## Aggiunta di un canale

Fai clic su **+ Add Channel** (aggiungi canale) e seleziona il pin della scheda da monitorare:

![Aggiunta di un canale oscilloscopio](../../../../assets/docs/instruments/oscilloscope-add-channel.png)

Ogni canale riceve un colore e un'etichetta (scheda + pin). Rimuovine uno con la piccola
**x** sotto la sua etichetta.

## Lettura della traccia

Qui l'oscilloscopio osserva **GPIO2** — il pin del LED lampeggiante del
[primo progetto](/docs/it/getting-started/first-project/):

![Un'onda quadra sull'oscilloscopio](../../../../assets/docs/instruments/oscilloscope.png)

## Controlli

| Controllo          | Funzione                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Time/div**       | Scala orizzontale, da 0,1 ms a 500 ms per divisione. Adattala al tuo segnale: un lampeggio da 1 s si legge meglio a circa 100 ms/div; un PWM da 1 kHz a circa 0,5 ms/div. |
| **Trigger**        | **Auto** (a scorrimento libero), **Normal** (disegna solo su trigger) o **Single** (una singola acquisizione). Scegli il canale di trigger e il fronte — ascendente, discendente o entrambi. |
| **Pause / Resume** | Congela il display per ispezionare una forma d'onda.                                                                                                   |
| **Clear**          | Cancella le tracce.                                                                                                                                    |

## Cosa provare

- **Misurare un ciclo di lavoro PWM**: esegui uno sketch `analogWrite()`, osserva il
  pin a 0,5 ms/div, confronta il tempo alto vs basso.
- **Catturare un evento singolo**: imposta il trigger su **Single**, fronte ascendente, poi
  premi un pulsante nel tuo circuito.
- **Confrontare due segnali**: aggiungi due canali — ad esempio le uscite A e B di un
  encoder — e osserva la loro relazione di fase.

----- END PAGE -----
