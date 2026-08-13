---
title: Linguaggi — Arduino, MicroPython, ESP-IDF
description: Quale linguaggio gira su quale scheda e come cambiarlo.
sidebar:
  order: 2
---

Il **selettore della lingua** nella barra degli strumenti cambia come viene
scritto e compilato il codice della scheda attiva. Cambiare lingua sostituisce
il set di file dell'area di lavoro (uno `sketch.ino` diventa un `main.py`,
e così via).

## Arduino C++

Il default quasi ovunque: i classici sketch `setup()` / `loop()`,
compilati con la vera toolchain Arduino per il target. Usa il pulsante
**Libraries** per aggiungere qualsiasi libreria Arduino pubblicata — vedi
[Librerie](/docs/it/programming/libraries/).

Disponibile su tutte le schede tranne la famiglia Linux Raspberry Pi.

## MicroPython

Firmware MicroPython reale in esecuzione sul chip emulato — la REPL funziona
tramite il monitor seriale, `import machine` e compagni si comportano come
sull'hardware.

Disponibile su:

- **Raspberry Pi Pico / Pico W** (RP2040)
- **ESP32 classico** — DevKit V1, DevKit-C v4, ESP32-CAM, Lolin32 Lite
- **ESP32-S3** — DevKit, XIAO ESP32-S3, Arduino Nano ESP32
- **ESP32-C3** — DevKit, XIAO ESP32-C3, C3 SuperMini

## ESP-IDF

Progetti ESP-IDF puri (un punto di ingresso `app_main()`, API IDF, nessun
core Arduino), compilati con la stessa toolchain ESP-IDF. Per quando scrivi
ciò che flasheresti in produzione.

Disponibile sulle stesse schede della famiglia ESP32 di MicroPython sopra.

## Python su Linux (Raspberry Pi)

Le schede Linux Raspberry Pi (da Zero a 5) non usano il selettore della
lingua: avviano un Linux completo e lavori in una shell reale — esegui Python
con `gpiozero`/`RPi.GPIO` contro la GPIO simulata, esattamente come sulla
Pi fisica. Vedi le [pagine delle schede](/docs/it/boards/overview/).
