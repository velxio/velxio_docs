---
title: Flash hardware reale dal browser
description: Scrivi il tuo progetto compilato su una scheda fisica via USB — nessun toolchain installato.
sidebar:
  order: 4
---

Quando il tuo progetto funziona nel simulatore, puoi caricarlo su una **scheda reale** senza installare nulla: Velxio flasha il firmware compilato via USB, direttamente dal browser.

## Requisiti

- Un browser basato su Chromium (Chrome o Edge) — il flasher utilizza l'API della porta seriale del browser, che Firefox e Safari non supportano.
- Un cavo USB con supporto dati per la tua scheda.
- Chiudi prima qualsiasi altro programma che usa la porta (monitor seriali, IDE) — il browser necessita di accesso esclusivo.

## Flashing

1. Apri la finestra di dialogo **Flash** dall'editor.
2. Seleziona la porta seriale USB — la finestra di dialogo rileva automaticamente i candidati e il browser ti chiede di confermare quale porta concedere.
3. Velxio utilizza il firmware che ha già compilato per la tua scheda — lo stesso binario che stava eseguendo il simulatore.
4. Osserva l'avanzamento; al termine, la scheda si riavvia nel tuo progetto.

Le schede RP2040/RP2350 flashano il loro `.uf2`, le schede ESP32 il loro `.bin` — la finestra di dialogo seleziona il protocollo giusto per il target.

## Prima simula, poi flasha

Questo chiude il cerchio che rende Velxio utile per il lavoro reale: itera rapidamente nel simulatore (niente cavo, nessuna usura sull'hardware, reset istantanei), poi flasha lo stesso identico artefatto di build quando si comporta come desiderato.
