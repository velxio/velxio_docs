---
title: ESP32 WiFi в симуляторе
description: Подключитесь к встроенной сети Velxio-GUEST и получите доступ к реальному интернету с симулированного ESP32.
sidebar:
  order: 2
---

Платы ESP32 в Velxio поставляются с **рабочим WiFi**: эмулированное радио
видит открытую точку доступа с именем **`Velxio-GUEST`**, подключается к ней,
получает IP-адрес по DHCP и выходит в интернет через NAT-шлюз эмулятора.
Точно такой же скетч работает на физическом чипе.

## Arduino

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // открытая точка доступа, без пароля

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) { delay(250); Serial.print("."); }
  Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());
}
```

Монитор последовательного порта показывает знакомые сообщения загрузки `wifi:connected` и
аренду DHCP — потому что это _настоящий_ стек WiFi в действии.

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

## Что доступно

После подключения стандартные TCP/UDP-сокеты, HTTP-клиенты и MQTT-библиотеки
работают с **реальными серверами в интернете** — публичными MQTT-брокерами, REST
API, NTP. Смотрите [MQTT и HTTP](/docs/ru/wifi-iot/mqtt-http/) для полных
проектов.

## Какие платы

WiFi доступен во всем семействе симулированных ESP32 — классические платы
ESP32, ESP32-S3 и ESP32-C3 (а также их варианты XIAO/Nano). Состояние
Bluetooth-рекламы также сообщается для скетчей, которые инициализируют BLE.
