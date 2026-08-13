---
title: FAQ
description: Domande frequenti su Velxio.
sidebar:
  order: 8
---

### Devo installare qualcosa?

No. Velxio funziona interamente nel browser — l'editor, il compilatore (nel
cloud) e la simulazione. Un Chrome, Edge o Firefox recente su desktop
offre l'esperienza migliore.

### Esegue davvero il mio codice?

Sì. Il tuo sketch viene compilato con le stesse toolchain utilizzate dalle
schede reali (arduino-cli, ESP-IDF, MicroPython), e il **binario reale**
risultante viene eseguito da una CPU emulata — non un'interpretazione
riga per riga del tuo sorgente. Log di avvio, anomalie di temporizzazione,
comportamento dei registri: ciò che vedi è ciò che il silicio farebbe.

### Velxio è gratuito?

Il simulatore principale è gratuito, inclusi il catalogo aperto delle schede e
la galleria di esempi. Le schede Pro, l'assistente AI e i progetti privati
richiedono un piano a pagamento — vedi [piani](/docs/it/getting-started/plans/).

### Posso importare i miei progetti Wokwi?

Sì — il pulsante **open project** (apri progetto) accetta archivi Wokwi
`.zip` insieme ai file `.vlx` di Velxio. Vedi
[Salvare e aprire progetti](/docs/it/getting-started/projects/).

### Quali schede sono supportate?

Arduino UNO/Nano/Mega, la famiglia ESP32 (classic, S3, C3), Raspberry Pi
Pico e Pico W, STM32, Raspberry Pi Linux completo, ATtiny85 e altre —
l'elenco completo con i dettagli è in [Schede](/docs/it/boards/overview/).

### Il WiFi funziona nel simulatore?

Sulle schede ESP32, sì — la stazione simulata si associa, ottiene un IP via
DHCP e può raggiungere il gateway internet per progetti MQTT/HTTP. Vedi
[WiFi e IoT](/docs/it/wifi-iot/overview/).

### Posso trasferire il mio progetto su hardware reale?

Sì. Per i progetti ESP32, **web flash** (flash web) scrive il firmware
compilato su una scheda reale tramite USB, direttamente dal browser. Vedi
[Web flash](/docs/it/wifi-iot/overview/).

### Dove posso segnalare un bug o richiedere una funzionalità?

Tramite il menu **Help** (Aiuto) nell'editor, la comunità
[Discord di Velxio](https://velxio.dev), o l'organizzazione GitHub —
qualunque preferisci.
