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

## Your own networks: custom access points

With a Maker plan you are not limited to the built-in demo networks: add a
**WiFi Access Point** part to the canvas (search "WiFi Access Point" in the
part picker) and the emulated radio broadcasts **your SSID** instead. The
sketch then connects to the network it actually names:

```cpp
WiFi.begin("HomeNet", "");   // the SSID on your Access Point part
```

The part has no pins — it is not an electrical component, it is airspace.
As soon as a project contains at least one access point part, the built-in
networks go silent: a scan sees exactly what the canvas defines. Add
several parts to exercise a network-selection UI; each carries its own
channel and signal strength, and repeated scans jitter a few dB the way
real ones do.

Two properties are worth knowing:

- **Internet** — turn it off and the network becomes isolated: the board
  associates and gets an IP over DHCP, but nothing routes out. That is the
  provisioning / captive-portal scenario, now testable in the simulator.
- **Password** — stored with the part and shown on its card, but the
  network still broadcasts open authentication until WPA2 emulation lands.
  Sketches that pass a password connect anyway.

Uploaded firmware benefits too: a binary built elsewhere connects to
whatever network it names, as long as an access point part broadcasts that
SSID — no rebuild needed.

Try it in one click: the gallery example **Connect to your own WiFi
network** opens with the part already on the canvas.

## The WiFi panel

The WiFi icon in the toolbar is a split button. The icon itself keeps its
one-click action — with an IP it opens the board's web server through the
IoT gateway. The small caret next to it opens the **WiFi panel**:

- the networks currently on the air (your access points, or the built-in
  set), with the associated one ticked;
- the board's connection state and IP;
- **Download PCAP** — the run's 802.11 traffic as a capture file that
  Wireshark opens directly (management frames, DHCP, DNS, TCP, with
  simulated-time stamps). Nothing is uploaded; the file is produced in
  your browser;
- the [local network gateway](/docs/wifi-iot/local-gateway/) pairing.

## What you can reach

Once connected, standard TCP/UDP sockets, HTTP clients and MQTT libraries
work against **real servers on the internet** — public MQTT brokers, REST
APIs, NTP. See [MQTT and HTTP](/docs/wifi-iot/mqtt-http/) for complete
projects.

## Which boards

WiFi is available across the simulated ESP32 family — the classic ESP32
boards, ESP32-S3, ESP32-C3, ESP32-C6 and ESP32-C5 (and their XIAO / Nano /
M5Stack variants). Bluetooth advertising state is also reported for
sketches that initialize BLE.
