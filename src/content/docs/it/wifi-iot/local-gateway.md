---
title: Gateway di rete locale
description: Esegui velxiogw sulla tua macchina e la scheda simulata si unisce alla tua rete reale — LAN, localhost e tutto il resto.
sidebar:
  order: 3
---

Per impostazione predefinita, una scheda simulata raggiunge internet tramite il
gateway cloud di Velxio — ma non la tua rete locale. Il **gateway di rete locale**
(`velxiogw`) elimina questo limite: un piccolo programma che esegui sulla tua
macchina, e il traffico della scheda esce da lì invece. Il tuo broker MQTT,
il tuo Home Assistant, l'API che stai sviluppando su `localhost` —
tutto raggiungibile dallo sketch. Un piano Maker abilita l'associazione.

## Configurazione

1. Scarica il gateway per la tua piattaforma dalla
   [ultima release](https://github.com/velxio/velxiogw/releases/latest)
   ed eseguilo:

   ```
   $ ./velxiogw
   velxiogw 0.1.2 — Velxio IoT Network Gateway
     listening on   ws://127.0.0.1:9013
     pairing code   493028
     reach scope    your LAN + localhost + internet
     host alias     host.velxio.internal -> this machine
   ```

2. Nell'editor, apri il pannello **WiFi** (il cursore accanto all'icona
   WiFi). Il pannello rileva automaticamente il gateway in esecuzione.

3. Digita il **codice di associazione** stampato dal gateway e fai clic su **Connect**.
   Dal successivo **Run** in poi, la scheda è sulla tua rete.

La prima volta, Chrome chiede il permesso di consentire alla pagina di comunicare con un
dispositivo sulla tua rete locale — fai clic su **Allow**. (Safari attualmente non
supporta questa funzione; usa Chrome, Edge o Firefox.)

## Raggiungere la propria macchina

All'interno di uno sketch, il nome host `host.velxio.internal` si risolve sempre sulla
macchina su cui è in esecuzione il gateway:

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://host.velxio.internal:8000/api/reading");
int status = http.GET();
```

Qualsiasi altra cosa sulla tua LAN è raggiungibile tramite il suo normale IP o nome host
senza mDNS, esattamente come da una scheda reale sulla tua rete WiFi.

## Note

- Il gateway si lega solo al tuo loopback e rifiuta connessioni senza
  il codice di associazione, quindi nient'altro sulla tua rete — o qualsiasi altra pagina
  web — può usarlo.
- Il traffico attraverso il gateway locale non tocca mai i server di Velxio, ed è
  solitamente più veloce perché elimina il round trip.
- Il sorgente è pubblico su
  [github.com/velxio/velxiogw](https://github.com/velxio/velxiogw); i
  binari sono scaricabili gratuitamente, e il flusso di associazione nell'editor è la
  funzionalità del piano Maker.
- Nell'app desktop Velxio non serve nulla di tutto ciò: la simulazione è già
  in esecuzione sulla tua macchina, quindi la scheda è sulla tua rete per costruzione.
