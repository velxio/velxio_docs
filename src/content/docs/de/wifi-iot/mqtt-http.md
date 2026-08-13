---
title: MQTT- und HTTP-Projekte
description: Kommunizieren Sie von Ihrem simulierten Board mit echten Brokern und APIs.
sidebar:
  order: 3
---

Mit [verbundenem WiFi](/docs/de/wifi-iot/esp32-wifi/) kann Ihr simulierter
ESP32 echte IoT-Workloads ausführen. Die Beispielgalerie enthält eine
ganze Kategorie **ESP32 MQTT**, die Sie direkt öffnen und ausführen
können.

## MQTT

Der klassische PubSubClient-Ablauf funktioniert unverändert: Verbinden Sie
sich mit `Velxio-GUEST`, stellen Sie eine Verbindung zu einem öffentlichen
Broker her, veröffentlichen und abonnieren Sie. Öffnen Sie die
MQTT-Beispiele in der Galerie, um Folgendes zu sehen:

- Veröffentlichen von Sensorwerten über einen Timer,
- Abonnieren eines Themas und Ansteuern eines Ausgangs über empfangene Nachrichten,
- einen vollständigen bidirektionalen Dashboard-Austausch mit einem öffentlichen Broker.

Da der Broker real ist, können Sie die Nachrichten Ihres simulierten
Boards mit einem beliebigen MQTT-Client auf Ihrem Telefon oder Laptop
beobachten — und auch zurücksenden.

## HTTP

`HTTPClient` (Arduino) und `urequests` (MicroPython) funktionieren mit
echten Endpunkten: Rufen Sie eine REST-API ab, laden Sie eine Datei
herunter, senden Sie einen Webhook. Halten Sie die Nutzlasten angemessen —
der emulierte Chip hat dieselben RAM-Grenzen wie der echte.

## Hinweise und Grenzen

- Der Zugangspunkt ist **offen** (kein Passwort) und bietet NAT-Internetzugang —
  es gibt keinen eingehenden Zugriff aus dem Internet auf Ihr simuliertes Board.
- DNS, TCP, UDP und TLS verhalten sich wie auf Hardware; schwere
  TLS-Handshakes kosten echte emulierte CPU-Zeit, daher sollten Sie damit
  rechnen, dass sie einen Moment dauern.
- Wenn eine Verbindung fehlschlägt, prüfen Sie zuerst den seriellen Monitor —
  die eigenen Protokollzeilen des WiFi-Stacks (`wifi:connected`, `got ip`)
  zeigen Ihnen, welcher Schritt nicht stattgefunden hat.
