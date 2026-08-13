---
title: Progetti MQTT e HTTP
description: Comunica con broker e API reali dalla tua scheda simulata.
sidebar:
  order: 3
---

Con il [WiFi connesso](/docs/it/wifi-iot/esp32-wifi/), il tuo ESP32 simulato
può eseguire carichi di lavoro IoT reali. La galleria di esempi ha un'intera
categoria **ESP32 MQTT** pronta da aprire ed eseguire.

## MQTT

Il flusso classico di PubSubClient funziona senza modifiche: unisciti a `Velxio-GUEST`,
connettiti a un broker pubblico, pubblica e sottoscriviti. Apri gli esempi MQTT
della galleria per vedere:

- pubblicazione di letture dei sensori su un timer,
- sottoscrizione a un topic e pilotaggio di un'uscita dai messaggi ricevuti,
- uno scambio completo bidirezionale con una dashboard contro un broker pubblico.

Poiché il broker è reale, puoi vedere i messaggi della tua scheda simulata
arrivare sul tuo telefono o laptop con qualsiasi client MQTT — e pubblicare
di nuovo verso di essa.

## HTTP

`HTTPClient` (Arduino) e `urequests` (MicroPython) funzionano con endpoint
reali: recupera una API REST, scarica un file, invia un webhook. Mantieni
i payload ragionevoli — il chip emulato ha gli stessi limiti di RAM di
quello reale.

## Note e limiti

- L'AP è **aperto** (senza password) e fornisce accesso internet NAT —
  non c'è accesso in ingresso alla tua scheda simulata da internet.
- DNS, TCP, UDP e TLS si comportano come su hardware; le handshake TLS
  pesanti richiedono tempo CPU emulato reale, quindi aspettati che richiedano
  un momento.
- Se una connessione fallisce, controlla prima il monitor seriale — le
  righe di log dello stack WiFi (`wifi:connected`, `got ip`) ti dicono
  quale passaggio non è avvenuto.
