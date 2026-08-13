---
title: WiFi do ESP32 no simulador
description: Conecte-se à rede integrada Velxio-GUEST e alcance a internet real a partir de um ESP32 simulado.
sidebar:
  order: 2
---

As placas ESP32 no Velxio vêm com **WiFi funcional**: o rádio emulado enxerga
um ponto de acesso aberto chamado **`Velxio-GUEST`**, associa-se, obtém um
endereço IP via DHCP e alcança a internet através do gateway NAT do emulador.
O mesmo sketch exato roda no chip físico.

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

O monitor serial mostra o familiar diálogo de inicialização `wifi:connected` e
a concessão DHCP — porque _é_ a pilha WiFi real em execução.

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

## O que você pode acessar

Uma vez conectado, sockets TCP/UDP padrão, clientes HTTP e bibliotecas MQTT
funcionam contra **servidores reais na internet** — brokers MQTT públicos, APIs
REST, NTP. Veja [MQTT e HTTP](/docs/pt-br/wifi-iot/mqtt-http/) para projetos
completos.

## Quais placas

O WiFi está disponível em toda a família ESP32 simulada — as placas ESP32
clássicas, ESP32-S3 e ESP32-C3 (e suas variantes XIAO/Nano). O estado de
propaganda Bluetooth também é reportado para sketches que inicializam BLE.

----- END PAGE -----
