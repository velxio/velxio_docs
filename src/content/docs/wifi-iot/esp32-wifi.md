---
title: ESP32 WiFi in the simulator
description: Join a network from a simulated ESP32, broadcast your own SSID, capture the traffic as a PCAP and reach your real LAN.
sidebar:
  order: 2
---

ESP32 boards in Velxio come with **working WiFi**. The emulated radio scans,
associates, gets an IP address over DHCP and reaches the internet through the
emulator's NAT gateway. It is the real WiFi stack from the vendor SDK running
on an emulated radio, not a stub: the same sketch, unchanged, runs on the
physical chip.

This page goes from a first connection to your own networks, packet captures
and your real LAN.

## Your first connection

1. Open the gallery example **Connect to WiFi**
   ([`/example/esp32-wifi-connect`](/example/esp32-wifi-connect)), or drop any
   ESP32 board on the canvas and paste the sketch below.
2. Press **Run**. The first compile of a session takes longer; later ones are
   cached.
3. Open the **Serial** monitor from the toolbar under the canvas.
4. Watch the join: the SDK's own boot chatter, then the DHCP lease.

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // built-in, open network

void setup() {
  Serial.begin(115200);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }

  Serial.printf("\nConnected. IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Gateway:      %s\n", WiFi.gatewayIP().toString().c_str());
  Serial.printf("RSSI:         %d dBm\n", WiFi.RSSI());
}

void loop() {}
```

The serial monitor shows the join and the address the emulated DHCP server
handed out:

![Serial monitor: Connecting to Espressif, then Connected with IP 10.13.37.42, the MAC address and the signal strength](../../../assets/docs/wifi-iot/serial-wifi.png)

One thing surprises everybody the first time: the log says
`Connecting to Espressif` even though the sketch names `Velxio-GUEST`. That
is the SSID rewrite doing its job, and the next section explains it.

The IP is real inside the simulation: sockets, HTTP clients and MQTT
libraries work from here on. See [MQTT and HTTP](/docs/wifi-iot/mqtt-http/)
for complete projects.

## The built-in networks

Without any access-point part on the canvas, the radio beacons four demo
networks. A station associates with exactly one of them:

| SSID            | Channel | Signal  | Auth      |
| --------------- | ------- | ------- | --------- |
| `Velxio-GUEST`  | 6       | -20 dBm | Open      |
| `PICSimLabWifi` | 1       | -25 dBm | WPA2-PSK  |
| `Espressif`     | 5       | -30 dBm | WPA2-PSK  |
| `MasseyWifi`    | 10      | -40 dBm | WPA2-PSK  |

### The SSID in your sketch does not matter

While the project has no access point part, the network name you write is
**not** the one the board joins. On its way to the emulator the compiler
rewrites every SSID literal to `Espressif` and blanks every password literal,
whether it is a variable, an array, a `#define` or a struct field:

```cpp
const char* ssid = "MyHomeNetwork";   // compiled as "Espressif"
#define WIFI_PASS "hunter2"           // compiled as ""
```

That is why a sketch copied from any tutorial connects here without being
edited, why passing a wrong password never fails, and why the serial log
names a network you did not type. Nothing is wrong when that happens.

Two consequences worth knowing:

- **Adding an access point part switches the rewrite off.** From then on the
  project defines its own airspace, so what you type is what exists and the
  SSID has to match a part.
- **Firmware that arrives already built never passes through the rewrite.**
  It hunts for the SSID baked into the binary, which is why an otherwise
  working `.bin` can sit there failing to associate. Either rebuild it
  naming one of the four networks above, or broadcast the SSID it expects
  with an access point part.

## MicroPython

```python
import network
import time

WIFI_SSID = "Velxio-GUEST"

sta = network.WLAN(network.STA_IF)
sta.active(True)
sta.connect(WIFI_SSID)

while not sta.isconnected():
    time.sleep(0.25)

print("Connected. ifconfig:", sta.ifconfig())
```

`sta.scan()` returns the same networks the Arduino API sees, as
`(ssid, bssid, channel, rssi, authmode, hidden)` tuples.

## Your own networks

With a Maker plan you are not limited to the demo networks. A **WiFi Access
Point** part makes the emulated radio broadcast **your** SSID.

1. Click **Add Component** on the canvas toolbar.
2. Search for `WiFi Access Point` and place it. It needs no wiring: it has no
   pins, it is airspace.
3. Select the part and set **ssid** to the network you want, for example
   `HomeNet`.
4. Point the sketch at that name and press **Run**.

```cpp
WiFi.begin("HomeNet");   // the SSID on your Access Point part
```

![A WiFi Access Point part on the canvas next to an ESP32 board, broadcasting HomeNet on channel 6](../../../assets/docs/wifi-iot/access-point-part.png)

**As soon as a project contains one access point part, the built-in networks
go silent.** A scan then sees exactly what the canvas defines, which is what
makes network-selection code testable.

### Part properties

| Property   | Default     | What it does                                                                           |
| ---------- | ----------- | -------------------------------------------------------------------------------------- |
| `ssid`     | `MyNetwork` | The network name your sketch connects to.                                                |
| `password` | empty       | Stored and shown on the card. The network still broadcasts open auth until WPA2 lands, so sketches that pass a password connect anyway. |
| `channel`  | `6`         | WiFi channel, 1 to 13. Reported by scans.                                                |
| `rssi`     | `-50`       | Signal strength in dBm as the board sees it, -90 to -20. Repeated scans jitter a few dB the way real ones do. |
| `internet` | on          | Off makes the network isolated: the board associates and gets an IP, but nothing routes out. |
| `bssid`    | empty       | AP MAC address. Empty means a stable one generated from the SSID.                        |

Try it in one click: **Connect to your own WiFi network**
([`/example/esp32-custom-wifi-ap`](/example/esp32-custom-wifi-ap)) opens with
the part already placed. Running it scans, finds exactly your network, and
joins it:

![Serial monitor: the scan lists only HomeNet, then the board connects and gets an IP](../../../assets/docs/wifi-iot/custom-ap-serial.png)

### Several networks at once

Add one part per network to exercise a picker or a "strongest first" policy.
Each carries its own channel and signal, so a scan comes back ordered the way
a real one would:

```cpp
int n = WiFi.scanNetworks();
for (int i = 0; i < n; i++) {
  Serial.printf("%2d: %-16s ch %2d  %d dBm\n",
                i + 1, WiFi.SSID(i).c_str(), WiFi.channel(i), WiFi.RSSI(i));
}
```

**Scan several WiFi networks**
([`/example/esp32-wifi-scan-multi`](/example/esp32-wifi-scan-multi)) ships
three parts: `HomeNet` at -40 dBm, `Office_5G` at -62 dBm and `CoffeeShop` at
-78 dBm.

### Captive portals and provisioning

Turn **internet** off on a part and the network becomes isolated. The board
associates and gets a DHCP lease, but no traffic leaves. That is the
provisioning scenario: the device comes up, finds no way out, and serves its
own configuration page.

**Captive portal on an isolated network**
([`/example/esp32-wifi-captive-portal`](/example/esp32-wifi-captive-portal))
sets this up with an AP named `SetupAP`.

## The WiFi panel

A WiFi badge appears on the canvas toolbar **when you press Run**, and leaves
on Stop: it belongs to the running simulation, so there is nothing to open
before starting one. It is gray while the stack boots and green once the
board has an address.

The badge is a split button. The icon keeps its one-click action: with an IP,
it opens the board's web server through the IoT gateway. The caret next to it
opens the **WiFi panel**:

![The WiFi panel showing the networks on the air for this project, Download PCAP and the local gateway section](../../../assets/docs/wifi-iot/wifi-panel.png)

The panel shows:

- **Networks on the air**, with channel and signal. The heading says
  *this project* when access point parts define them, and *built-in* when the
  four demo networks are on air:

  ![The WiFi panel listing the four built-in networks with their channels and signal strengths](../../../assets/docs/wifi-iot/wifi-panel-builtin.png)

- the board's association state and its IP once DHCP completes;
- **Download PCAP**, the run's 802.11 traffic as a capture file;
- the [local network gateway](/docs/wifi-iot/local-gateway/) section. On a
  Maker plan it holds the pairing field; on the free plan it explains what
  the gateway does and links to the plans.

### Capture the traffic and open it in Wireshark

1. Press **Run** and let the sketch do its network work.
2. Open the WiFi panel and click **Download PCAP**.
3. Open the file in Wireshark.

The capture holds management frames, DHCP, DNS and TCP, with simulated-time
stamps, so `dhcp` or `dns` as a display filter isolates the handshake you are
debugging. The file is produced in your browser: nothing is uploaded.

## Reaching your own machine

The networks above route to the public internet. To reach the MQTT broker,
Home Assistant or dev server running on **your** machine, run the local
gateway: see [Local network gateway](/docs/wifi-iot/local-gateway/). Sketches
then reach your machine as `host.velxio.internal`.

## Ready-made examples

| Example                                                                      | What it shows                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------- |
| [Connect to WiFi](/example/esp32-wifi-connect)                               | The minimal join to a built-in network            |
| [Scan WiFi networks](/example/esp32-wifi-scan)                               | `scanNetworks()` against the built-in set         |
| [Connect to your own WiFi network](/example/esp32-custom-wifi-ap)            | One access point part, scan and join              |
| [Scan several WiFi networks](/example/esp32-wifi-scan-multi)                 | Three networks with different channels and signal |
| [Captive portal on an isolated network](/example/esp32-wifi-captive-portal)  | `internet` off, provisioning flow                 |
| [NTP clock over your WiFi](/example/esp32-wifi-ntp-clock)                    | UDP out to a real time server                     |
| [Fetch JSON from a web API](/example/esp32-wifi-http-json)                   | HTTPClient against a real REST API                |
| [Reach a service on your own network](/example/esp32-wifi-local-http)        | `host.velxio.internal` through the local gateway  |
| [MQTT](/example/esp32-wifi-mqtt)                                             | Publish and subscribe on a public broker          |

## Troubleshooting

| Symptom                                            | Cause                                                                     | Fix                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Uploaded firmware never associates                  | Its SSID is baked in, so the compiler could not rewrite it                 | Name a built-in network, or add an access point part with that SSID         |
| A scan returns only your networks                   | Working as intended: one access point part silences the built-in set       | Remove the parts to get the demo networks back                              |
| Associates and gets an IP, but nothing routes out   | The part has **internet** turned off                                       | Turn it on, unless you are testing a captive portal                         |
| A password does not get rejected                    | WPA2 emulation is not in yet, the network broadcasts open auth             | Expected for now; the password is stored on the part                        |
| `host.velxio.internal` does not resolve             | No local gateway paired                                                    | See [Local network gateway](/docs/wifi-iot/local-gateway/)                  |

## Which boards

WiFi is available across the simulated ESP32 family: the classic ESP32
boards, ESP32-S3, ESP32-C3, ESP32-C6 and ESP32-C5, plus their XIAO, Nano and
M5Stack variants. The Raspberry Pi Pico W has its own
[CYW43 emulation](/docs/boards/pico/). Bluetooth advertising state is also
reported for sketches that initialize BLE.
