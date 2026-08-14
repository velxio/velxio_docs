---
title: ESP32 WiFi in the simulator
description: Join the built-in Velxio-GUEST network and reach the real internet from a simulated ESP32.
sidebar:
  order: 2
---

ESP32 boards in Velxio come with **working WiFi**: the emulated radio sees
an open access point named **`Velxio-GUEST`**, associates, gets an IP
address over DHCP, and reaches the internet through the emulator's NAT
gateway. The exact same sketch runs on the physical chip.

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

The serial monitor shows the familiar `wifi:connected` boot chatter and
the DHCP lease — because it _is_ the real WiFi stack running:

![Serial monitor during a WiFi join](../../../assets/docs/wifi-iot/serial-wifi.png)

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

## What you can reach

Once connected, standard TCP/UDP sockets, HTTP clients and MQTT libraries
work against **real servers on the internet** — public MQTT brokers, REST
APIs, NTP. See [MQTT and HTTP](/docs/wifi-iot/mqtt-http/) for complete
projects.

## Which boards

WiFi is available across the simulated ESP32 family — the classic ESP32
boards, ESP32-S3 and ESP32-C3 (and their XIAO/Nano variants). Bluetooth
advertising state is also reported for sketches that initialize BLE.
