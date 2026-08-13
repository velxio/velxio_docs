---
title: WiFi ESP32 en el simulador
description: Únase a la red integrada Velxio-GUEST y acceda a internet real desde un ESP32 simulado.
sidebar:
  order: 2
---

Las placas ESP32 en Velxio vienen con **WiFi funcional**: la radio emulada
ve un punto de acceso abierto llamado **`Velxio-GUEST`**, se asocia,
obtiene una dirección IP mediante DHCP y accede a internet a través de la
puerta de enlace NAT del emulador. El mismo sketch exacto se ejecuta en el
chip físico.

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

El monitor serie muestra el conocido mensaje de arranque `wifi:connected` y
la concesión DHCP — porque _es_ la pila WiFi real en ejecución.

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

## Qué puede alcanzar

Una vez conectado, los sockets TCP/UDP estándar, los clientes HTTP y las
bibliotecas MQTT funcionan contra **servidores reales en internet** —
brokers MQTT públicos, API REST, NTP. Consulte [MQTT y HTTP](/docs/es/wifi-iot/mqtt-http/) para proyectos completos.

## Qué placas

WiFi está disponible en toda la familia ESP32 simulada — las placas ESP32
clásicas, ESP32-S3 y ESP32-C3 (y sus variantes XIAO/Nano). El estado de
publicidad Bluetooth también se informa para sketches que inicializan BLE.

----- END PAGE -----
