---
title: WiFi ESP32 nel simulatore
description: Connettiti alla rete Velxio-GUEST integrata e raggiungi Internet reale da un ESP32 simulato.
sidebar:
  order: 2
---

Le schede ESP32 in Velxio dispongono di **WiFi funzionante**: la radio emulata
vede un punto di accesso aperto chiamato **`Velxio-GUEST`**, si associa,
ottiene un indirizzo IP tramite DHCP e raggiunge Internet attraverso il
gateway NAT dell'emulatore. Lo stesso identico sketch funziona sul chip fisico.

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

Il monitor seriale mostra il familiare messaggio di avvio `wifi:connected` e
il lease DHCP — perché _è_ il vero stack WiFi in esecuzione.

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

## Cosa puoi raggiungere

Una volta connessi, i socket TCP/UDP standard, i client HTTP e le librerie
MQTT funzionano contro **server reali su Internet** — broker MQTT pubblici,
API REST, NTP. Vedi [MQTT e HTTP](/docs/it/wifi-iot/mqtt-http/) per progetti
completi.

## Quali schede

Il WiFi è disponibile su tutta la famiglia ESP32 simulata — le classiche
schede ESP32, ESP32-S3 ed ESP32-C3 (e le loro varianti XIAO/Nano). Anche lo
stato di advertising Bluetooth viene riportato per gli sketch che inizializzano BLE.
