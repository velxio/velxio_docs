---
title: WiFi- und IoT-Übersicht
description: Simuliertes WiFi auf ESP32-Boards, MQTT/HTTP-Projekte und das Flashen echter Hardware direkt aus dem Browser.
sidebar:
  order: 1
---

ESP32-Boards in Velxio verfügen über **simuliertes WiFi**: Ihre Firmware erkennt
ein Netzwerk, verbindet sich, erhält eine IP-Adresse über DHCP und kann mit
dem Internet kommunizieren — derselbe Sketch, der auf Ihrem Schreibtisch läuft, läuft auch im Simulator.

In diesem Abschnitt:

- **ESP32 WiFi** — wie das simulierte Netzwerk funktioniert, welche Chips es unterstützen,
  und WiFi aus Arduino und MicroPython.
- **MQTT und HTTP** — verbinden Sie Ihr simuliertes Board mit echten Brokern und APIs.
- **Web-Flash** — wenn Sie mit dem Projekt zufrieden sind, flashen Sie es auf einen echten
  ESP32 über USB direkt aus dem Browser, ohne installierte Toolchain.
