---
title: Risoluzione dei problemi
description: I controlli che risolvono la maggior parte dei problemi, in ordine.
sidebar:
  order: 4
---

## La simulazione non si avvia

1. Controlla la **console di output** — se la compilazione è fallita, l'errore
   è lì, con file e riga. Vedi
   [lettura degli errori di compilazione](/docs/it/programming/compile-and-run/).
2. Un avviso del **verificatore di circuito** (ad es. un LED senza resistore
   in serie in modalità elettrica) blocca l'esecuzione di proposito — correggi
   il cablaggio segnalato.
3. La prima esecuzione di una sessione compila a freddo e può richiedere tempo
   con le toolchain grandi (ESP-IDF); le esecuzioni successive sono molto più
   veloci. Dai tempo alla prima prima di presumere che si sia bloccata.

## Viene eseguita, ma non succede nulla

- È selezionata la **scheda giusta** nel selettore di schede della barra degli strumenti?
- Apri il **monitor seriale** — un firmware che è andato in crash o che è in attesa
  di input te lo dice lì.
- Fai clic con il tasto destro sui componenti per confermare le loro **proprietà**
  (una striscia NeoPixel impostata su 0 LED non disegna esattamente nulla).

## La pagina stessa si comporta male

- Velxio richiede un **Chromium o Firefox desktop**, ragionevolmente aggiornato.
- Ricarica forzata (Ctrl+Shift+R) dopo gli aggiornamenti — un bundle cache obsoleto
  può abbinarsi male a un backend fresco.
- Le estensioni del browser che toccano WebAssembly, canvas o WebSockets
  (bloccatori della privacy aggressivi) possono rompere gli emulatori — prova una
  finestra di navigazione in incognito.

## Il flash web non vede la mia scheda

- Usa **Chrome o Edge** — Firefox/Safari non includono l'API seriale del browser.
- Chiudi ogni altro programma che usa la porta (monitor seriali, IDE).
- Prova un altro cavo — i cavi USB solo per la ricarica sono la trappola classica.

## Gli esempi WiFi non riescono a connettersi

- L'SSID è esattamente **`Velxio-GUEST`**, aperto, senza password.
- Osserva il monitor seriale per le righe di avanzamento dello stack WiFi
  (`wifi:connected`, `got ip`) per vedere quale passaggio fallisce.

## Ancora bloccato?

Chiedi all'[assistente AI](/docs/it/ai/overview/) con il tuo progetto aperto — legge
gli stessi errori che leggi tu. Per i bug, contatta il team tramite il menu
**Help** (Aiuto), Discord o GitHub.
