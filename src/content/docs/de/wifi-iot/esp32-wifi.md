---
title: ESP32-WLAN im Simulator
description: Treten Sie dem integrierten Velxio-GUEST-Netzwerk bei und erreichen Sie das echte Internet von einem simulierten ESP32.
sidebar:
  order: 2
---

ESP32-Boards in Velxio verfügen über **funktionierendes WLAN**: Das emulierte Funkmodul
sieht einen offenen Zugangspunkt namens **`Velxio-GUEST`**, verbindet sich,
erhält eine IP-Adresse über DHCP und erreicht das Internet über das NAT-Gateway
des Emulators. Derselbe Sketch läuft auf dem physischen Chip.

## Arduino

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // offener AP, kein Passwort

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) { delay(250); Serial.print("."); }
  Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());
}
```

Der serielle Monitor zeigt das bekannte `wifi:connected`-Startprotokoll und
den DHCP-Leasevertrag — weil es _der_ echte WiFi-Stack ist, der läuft.

## MicroPython

```python
import network

WIFI_SSID = "Velxio-GUEST"

sta = network.WLAN(network.STA_IF)
sta.active(True)
sta.connect(WIFI_SSID)
while not sta.isconnected():
    pass
print("Connected, IP:", sta.ifconfig()[0])
```

## Was Sie erreichen können

Sobald die Verbindung steht, funktionieren Standard-TCP/UDP-Sockets, HTTP-Clients
und MQTT-Bibliotheken gegen **echte Server im Internet** — öffentliche MQTT-Broker,
REST-APIs, NTP. Siehe [MQTT und HTTP](/docs/de/wifi-iot/mqtt-http/) für vollständige
Projekte.

## Welche Boards

WLAN ist in der gesamten simulierten ESP32-Familie verfügbar — die klassischen
ESP32-Boards, ESP32-S3 und ESP32-C3 (sowie deren XIAO/Nano-Varianten). Der
Bluetooth-Werbungsstatus wird ebenfalls für Sketches gemeldet, die BLE initialisieren.
