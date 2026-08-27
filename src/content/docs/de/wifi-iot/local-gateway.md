---
title: Lokales Netzwerk-Gateway
description: Führen Sie velxiogw auf Ihrem Rechner aus, und das simulierte Board tritt Ihrem echten Netzwerk bei – LAN, localhost und alles andere.
sidebar:
  order: 3
---

Standardmäßig erreicht ein simuliertes Board das Internet über das
Cloud-Gateway von Velxio – aber nicht Ihr lokales Netzwerk. Das **lokale
Netzwerk-Gateway** (`velxiogw`) beseitigt diese Einschränkung: ein kleines
Programm, das Sie auf Ihrem eigenen Rechner ausführen, und der
Datenverkehr des Boards verlässt das Netzwerk von dort aus. Ihr
MQTT-Broker, Ihre Home-Assistant-Instanz, die API, die Sie auf `localhost`
entwickeln – alles aus dem Sketch erreichbar. Ein Maker-Plan aktiviert das
Pairing.

## Einrichtung

1. Laden Sie das Gateway für Ihre Plattform vom
   [neuesten Release](https://github.com/velxio/velxiogw/releases/latest)
   herunter und führen Sie es aus:

   ```
   $ ./velxiogw
   velxiogw 0.1.2 — Velxio IoT Network Gateway
     listening on   ws://127.0.0.1:9013
     pairing code   493028
     reach scope    your LAN + localhost + internet
     host alias     host.velxio.internal -> this machine
   ```

2. Öffnen Sie im Editor das **WiFi-Panel** (das Caret neben dem
   WiFi-Symbol). Das Panel erkennt das laufende Gateway automatisch.

3. Geben Sie den **Pairing-Code** ein, den das Gateway ausgegeben hat, und
   klicken Sie auf **Connect** (Verbinden). Ab dem nächsten **Run**
   (Ausführen) ist das Board in Ihrem Netzwerk.

Beim ersten Mal fragt Chrome um Erlaubnis, ob die Seite mit einem Gerät in
Ihrem lokalen Netzwerk kommunizieren darf – klicken Sie auf **Allow**
(Zulassen). (Safari unterstützt dies derzeit nicht; verwenden Sie Chrome,
Edge oder Firefox.)

## Den eigenen Rechner erreichen

Innerhalb eines Sketches löst der Hostname `host.velxio.internal` immer
auf den Rechner auf, auf dem das Gateway läuft:

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://host.velxio.internal:8000/api/reading");
int status = http.GET();
```

Alles andere in Ihrem LAN ist über seine normale IP-Adresse oder den
mDNS-losen Hostnamen erreichbar – genau wie von einem echten Board in
Ihrem WiFi.

## Hinweise

- Das Gateway bindet nur an Ihre Loopback-Schnittstelle und verweigert
  Verbindungen ohne den Pairing-Code. Nichts anderes in Ihrem Netzwerk –
  oder eine andere Webseite – kann es also verwenden.
- Datenverkehr über das lokale Gateway berührt niemals die Server von
  Velxio und ist durch den Wegfall des Roundtrips in der Regel schneller.
- Der Quellcode ist öffentlich unter
  [github.com/velxio/velxiogw](https://github.com/velxio/velxiogw); die
  Binärdateien sind kostenlos herunterladbar, und der Pairing-Ablauf im
  Editor ist ein Feature des Maker-Plans.
- In der Velxio-Desktop-App ist all dies nicht nötig: Die Simulation läuft
  bereits auf Ihrem Rechner, sodass das Board von vornherein in Ihrem
  Netzwerk ist.
