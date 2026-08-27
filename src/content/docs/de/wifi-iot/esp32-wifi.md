---
title: ESP32-WiFi im Simulator
description: Treten Sie dem integrierten Velxio-GUEST-Netzwerk bei und erreichen Sie das echte Internet von einem simulierten ESP32.
sidebar:
  order: 2
---

ESP32-Boards in Velxio verfügen über **funktionierendes WiFi**: Das emulierte Funkmodul sieht einen offenen Zugangspunkt namens **`Velxio-GUEST`**, verbindet sich, erhält eine IP-Adresse über DHCP und erreicht das Internet über das NAT-Gateway des Emulators. Derselbe Sketch läuft auf dem physischen Chip.

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

Der serielle Monitor zeigt das bekannte `wifi:connected`-Startprotokoll und den DHCP-Lease — weil es _der_ echte WiFi-Stack ist, der läuft:

![Serieller Monitor während eines WiFi-Beitritts](../../../../assets/docs/wifi-iot/serial-wifi.png)

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

## Eigene Netzwerke: benutzerdefinierte Zugangspunkte

Mit einem Maker-Plan sind Sie nicht auf die integrierten Demo-Netzwerke beschränkt: Fügen Sie ein **WiFi Access Point**-Bauteil (auf Deutsch: WLAN-Zugangspunkt) zur Leinwand hinzu (suchen Sie „WiFi Access Point" in der Bauteilauswahl) und das emulierte Funkmodul sendet stattdessen **Ihre SSID**. Der Sketch verbindet sich dann mit dem Netzwerk, das er tatsächlich nennt:

```cpp
WiFi.begin("HomeNet", "");   // die SSID auf Ihrem Access Point-Bauteil
```

![Ein WiFi Access Point-Bauteil auf der Leinwand neben einem ESP32, das HomeNet auf Kanal 6 sendet](../../../../assets/docs/wifi-iot/access-point-part.png)

Das Bauteil hat keine Pins — es ist kein elektrisches Bauteil, es ist Luftraum. Sobald ein Projekt mindestens ein Access-Point-Bauteil enthält, verstummen die integrierten Netzwerke: Ein Scan sieht genau das, was die Leinwand definiert. Fügen Sie mehrere Bauteile hinzu, um eine Netzwerkauswahl-Benutzeroberfläche zu testen; jedes hat seinen eigenen Kanal und seine eigene Signalstärke, und wiederholte Scans schwanken um ein paar dB, so wie es echte tun.

Zwei Eigenschaften sind wissenswert:

- **Internet** — schalten Sie es aus und das Netzwerk wird isoliert: Das Board verbindet sich und erhält eine IP über DHCP, aber nichts wird nach außen geroutet. Das ist das Provisionierungs-/Captive-Portal-Szenario, jetzt im Simulator testbar.
- **Password** — wird mit dem Bauteil gespeichert und auf seiner Karte angezeigt, aber das Netzwerk sendet weiterhin offene Authentifizierung, bis die WPA2-Emulation verfügbar ist. Sketches, die ein Passwort übergeben, verbinden sich trotzdem.

Auch hochgeladene Firmware profitiert: Ein anderswo erstelltes Binärprogramm verbindet sich mit jedem Netzwerk, das es nennt, solange ein Access-Point-Bauteil diese SSID sendet — kein Neubau erforderlich.

Wenn es läuft, findet der Scan genau Ihr Netzwerk und das Board tritt bei:

![Serieller Monitor: Der Scan listet nur HomeNet auf, dann verbindet sich das Board und erhält IP 10.13.37.42](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

Probieren Sie es mit einem Klick aus: Das Galerie-Beispiel **Connect to your own WiFi network** (auf Deutsch: Mit Ihrem eigenen WiFi-Netzwerk verbinden) öffnet sich mit dem Bauteil bereits auf der Leinwand.

## Das WiFi-Panel

Das WiFi-Symbol in der Symbolleiste ist ein geteilter Button. Das Symbol selbst behält seine Ein-Klick-Aktion — mit einer IP öffnet es den Webserver des Boards über das IoT-Gateway. Das kleine Dreieck daneben öffnet das **WiFi-Panel**:

![Das WiFi-Panel: Netzwerke in der Luft mit Kanal und Signalstärke, Board-Verbindung und IP, Download PCAP und die lokale Gateway-Kopplung](../../../../assets/docs/wifi-iot/wifi-panel.png)

- die Netzwerke, die derzeit in der Luft sind (Ihre Zugangspunkte oder der integrierte Satz), wobei das verbundene markiert ist;
- den Verbindungsstatus und die IP des Boards;
- **Download PCAP** — den 802.11-Verkehr des Laufs als Erfassungsdatei, die Wireshark direkt öffnet (Verwaltungsframes, DHCP, DNS, TCP, mit simulierten Zeitstempeln). Es wird nichts hochgeladen; die Datei wird in Ihrem Browser erzeugt;
- die [Kopplung mit dem lokalen Netzwerk-Gateway](/docs/de/wifi-iot/local-gateway/).

## Was Sie erreichen können

Sobald verbunden, funktionieren Standard-TCP/UDP-Sockets, HTTP-Clients und MQTT-Bibliotheken gegen **echte Server im Internet** — öffentliche MQTT-Broker, REST-APIs, NTP. Siehe [MQTT und HTTP](/docs/de/wifi-iot/mqtt-http/) für vollständige Projekte.

## Welche Boards

WiFi ist in der gesamten simulierten ESP32-Familie verfügbar — die klassischen ESP32-Boards, ESP32-S3, ESP32-C3, ESP32-C6 und ESP32-C5 (und ihre XIAO / Nano / M5Stack-Varianten). Der Bluetooth-Werbestatus wird auch für Sketches gemeldet, die BLE initialisieren.
