---
title: "WiFi ESP32 dans le simulateur"
description: "Rejoignez le réseau intégré Velxio-GUEST et accédez à Internet réel depuis un ESP32 simulé."
sidebar:
  order: 2
---

Les cartes ESP32 dans Velxio sont équipées d'un **WiFi fonctionnel** : la radio émulée
voit un point d'accès ouvert nommé **`Velxio-GUEST`**, s'y associe, obtient
une adresse IP via DHCP, et accède à Internet via la passerelle NAT de l'émulateur.
Le même sketch exact fonctionne sur la puce physique.

## Arduino

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // open AP, no password

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) { delay(250); Serial.print("."); }
  Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());
}
```

Le moniteur série affiche le bavardage de démarrage `wifi:connected` familier et
le bail DHCP — car c'est _réellement_ la pile WiFi qui s'exécute.

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

## Ce que vous pouvez atteindre

Une fois connecté, les sockets TCP/UDP standard, les clients HTTP et les bibliothèques MQTT
fonctionnent avec **de vrais serveurs sur Internet** — courtiers MQTT publics, API
REST, NTP. Voir [MQTT et HTTP](/docs/fr/wifi-iot/mqtt-http/) pour des projets
complets.

## Quelles cartes

Le WiFi est disponible sur toute la famille ESP32 simulée — les cartes ESP32
classiques, ESP32-S3 et ESP32-C3 (et leurs variantes XIAO/Nano). L'état de
publicité Bluetooth est également rapporté pour les sketches qui initialisent le BLE.
