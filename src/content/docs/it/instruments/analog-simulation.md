---
title: Simulazione analogica
description: Il motore di classe SPICE dietro la tela — cosa modella e come leggere il suo badge.
sidebar:
  order: 3
---

Velxio non propaga solo livelli digitali alti e bassi. Le parti analogiche
del tuo circuito — resistori, diodi, transistor, sorgenti di alimentazione — sono
risolte da un **motore di classe SPICE** che opera in accoppiamento con la simulazione digitale,
come fanno i simulatori a modalità mista sul desktop.

## Il badge SPICE

Il badge giallo sopra il circuito riporta la rete analogica:

- **nets** — quanti nodi elettrici il motore sta risolvendo.
- **solve time** — quanto è costata l'ultima analisi.

Quando un pin di una scheda pilota una rete analogica (ad esempio, un GPIO attraverso un resistore
verso un LED), i fronti dei pin dal firmware alimentano la risoluzione analogica, e le
tensioni e correnti risultanti guidano ciò che vedi — inclusa la luminosità
del LED.

## Cosa viene modellato

- **Passivi** — resistori, potenziometri e il cablaggio stesso.
- **Diodi e LED** — comportamento esponenziale reale I/V con tensioni di
  soglia specifiche per colore.
- **Transistor** — transistor bipolari (NPN/PNP) con modelli di giunzione
  adeguati; i circuiti di pilotaggio motori e i relè si comportano in modo realistico.
- **Famiglie logiche** — IC logici discreti (serie 74xx e simili) modellati con
  livelli accurati per famiglia.
- **Alimentazione** — alimentatori, regolatori, batterie nella categoria alimentazione.

Il motore migliora continuamente con ogni release; se un angolo analogico esotico
si comporta in modo inaspettato, semplifica il circuito o chiedi alla community.

## Il verificatore di circuito

Prima di una simulazione, Velxio controlla il circuito per configurazioni che
danneggerebbero componenti reali — il classico è un LED attraverso un'alimentazione **senza
resistore in serie**. In modalità elettrica il verificatore blocca la simulazione e
indica il problema; correggi il cablaggio e riesegui. È una funzionalità: il
simulatore insegna l'abitudine che salva i LED reali.
