---
title: ESP32-WLAN im Simulator
description: Treten Sie von einem simulierten ESP32 einem Netzwerk bei, senden Sie Ihre eigene SSID, erfassen Sie den Datenverkehr als PCAP und erreichen Sie Ihr reales LAN.
sidebar:
  order: 2
---

ESP32-Boards in Velxio verfügen über **funktionierendes WLAN**. Das emulierte
Funkmodul scannt, assoziiert, erhält eine IP-Adresse über DHCP und erreicht
das Internet über das NAT-Gateway des Emulators. Es ist der echte WLAN-Stack
aus dem Hersteller-SDK, der auf einem emulierten Funkmodul läuft, kein
Platzhalter: Derselbe Sketch, unverändert, läuft auf dem physischen Chip.

Diese Seite führt von der ersten Verbindung zu Ihren eigenen Netzwerken,
Paketmitschnitten und Ihrem realen LAN.

## Ihre erste Verbindung

1. Öffnen Sie das Galerie-Beispiel **Connect to WiFi**
   ([`/example/esp32-wifi-connect`](/example/esp32-wifi-connect)), oder
   ziehen Sie ein beliebiges ESP32-Board auf die Leinwand und fügen Sie den
   untenstehenden Sketch ein.
2. Drücken Sie **Run**. Die erste Kompilierung einer Sitzung dauert länger;
   spätere werden zwischengespeichert.
3. Öffnen Sie den **Serial**-Monitor in der Symbolleiste unter der Leinwand.
4. Beobachten Sie den Beitritt: das eigene Startprotokoll des SDK, dann der
   DHCP-Lease.

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // eingebautes, offenes Netzwerk

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

Der serielle Monitor zeigt den Beitritt und die Adresse, die der emulierte
DHCP-Server vergeben hat:

![Serieller Monitor: Verbindung zu Espressif, dann Verbunden mit IP 10.13.37.42, der MAC-Adresse und der Signalstärke](../../../../assets/docs/wifi-iot/serial-wifi.png)

Eines überrascht beim ersten Mal jeden: Das Protokoll sagt
`Connecting to Espressif`, obwohl der Sketch `Velxio-GUEST` nennt. Das
ist die SSID-Umschreibung bei der Arbeit, und der nächste Abschnitt erklärt
sie.

Die IP ist innerhalb der Simulation real: Sockets, HTTP-Clients und
MQTT-Bibliotheken funktionieren von hier an. Siehe [MQTT und HTTP](/docs/de/wifi-iot/mqtt-http/)
für vollständige Projekte.

## Die eingebauten Netzwerke

Ohne Access-Point-Teil auf der Leinwand sendet das Funkmodul vier
Demonstrationsnetzwerke. Eine Station assoziiert mit genau einem von ihnen:

| SSID            | Kanal | Signal  | Authentifizierung |
| --------------- | ----- | ------- | ----------------- |
| `Velxio-GUEST`  | 6     | -20 dBm | Offen             |
| `PICSimLabWifi` | 1     | -25 dBm | WPA2-PSK          |
| `Espressif`     | 5     | -30 dBm | WPA2-PSK          |
| `MasseyWifi`    | 10    | -40 dBm | WPA2-PSK          |

### Die SSID in Ihrem Sketch spielt keine Rolle

Solange das Projekt keinen Access-Point-Teil hat, ist der Netzwerkname, den
Sie schreiben, **nicht** der, dem das Board beitritt. Auf dem Weg zum
Emulator schreibt der Compiler jedes SSID-Literal in `Espressif` um und
leert jedes Passwort-Literal, ob es eine Variable, ein Array, ein `#define`
oder ein Strukturfeld ist:

```cpp
const char* ssid = "MyHomeNetwork";   // kompiliert als "Espressif"
#define WIFI_PASS "hunter2"           // kompiliert als ""
```

Deshalb verbindet sich ein Sketch, der aus einem beliebigen Tutorial kopiert
wurde, hier ohne Bearbeitung, deshalb schlägt ein falsches Passwort nie
fehl, und deshalb nennt das serielle Protokoll ein Netzwerk, das Sie nicht
eingegeben haben. Es ist nichts falsch, wenn das passiert.

Zwei Konsequenzen, die man kennen sollte:

- **Das Hinzufügen eines Access-Point-Teils schaltet die Umschreibung ab.**
  Von da an definiert das Projekt seinen eigenen Luftraum, also ist das, was
  Sie eingeben, das, was existiert, und die SSID muss mit einem Teil
  übereinstimmen.
- **Firmware, die bereits kompiliert ankommt, durchläuft die Umschreibung
  nie.** Sie sucht nach der im Binärformat eingebackenen SSID, weshalb ein
  sonst funktionierender `.bin` einfach dasitzt und keine Verbindung
  herstellen kann. Entweder bauen Sie sie neu auf und benennen eines der
  vier obigen Netzwerke, oder Sie senden die SSID, die sie erwartet, mit
  einem Access-Point-Teil.

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

`sta.scan()` gibt dieselben Netzwerke zurück, die die Arduino-API sieht, als
`(ssid, bssid, channel, rssi, authmode, hidden)`-Tupel.

## Ihre eigenen Netzwerke

Mit einem Maker-Plan sind Sie nicht auf die Demo-Netzwerke beschränkt. Ein
**WiFi Access Point**-Teil lässt das emulierte Funkmodul **Ihre** SSID
senden.

1. Klicken Sie auf **Add Component** in der Leinwand-Symbolleiste.
2. Suchen Sie nach `WiFi Access Point` und platzieren Sie es. Es benötigt
   keine Verkabelung: Es hat keine Pins, es ist Luftraum.
3. Wählen Sie das Teil aus und setzen Sie **ssid** auf das gewünschte
   Netzwerk, z. B. `HomeNet`.
4. Richten Sie den Sketch auf diesen Namen aus und drücken Sie **Run**.

```cpp
WiFi.begin("HomeNet");   // die SSID auf Ihrem Access Point Teil
```

![Ein WiFi Access Point Teil auf der Leinwand neben einem ESP32-Board, das HomeNet auf Kanal 6 sendet](../../../../assets/docs/wifi-iot/access-point-part.png)

**Sobald ein Projekt ein Access-Point-Teil enthält, verstummen die
eingebauten Netzwerke.** Ein Scan sieht dann genau das, was die Leinwand
definiert, was Netzwerkauswahlcode testbar macht.

### Teileigenschaften

| Eigenschaft | Standard   | Was es tut                                                                                                  |
| ----------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `ssid`      | `MyNetwork`| Der Netzwerkname, mit dem sich Ihr Sketch verbindet.                                                         |
| `password`  | leer       | Wird auf der Karte gespeichert und angezeigt. Das Netzwerk sendet weiterhin offene Authentifizierung, bis WPA2 verfügbar ist, also verbinden sich Sketches, die ein Passwort übergeben, trotzdem. |
| `channel`   | `6`        | WLAN-Kanal, 1 bis 13. Wird von Scans gemeldet.                                                               |
| `rssi`      | `-50`      | Signalstärke in dBm, wie das Board sie sieht, -90 bis -20. Wiederholte Scans schwanken ein paar dB, wie es echte tun. |
| `internet`  | an         | Aus macht das Netzwerk isoliert: Das Board assoziiert und erhält eine IP, aber nichts wird nach außen geroutet. |
| `bssid`     | leer       | AP-MAC-Adresse. Leer bedeutet eine stabile, die aus der SSID generiert wird.                                 |

Probieren Sie es mit einem Klick aus: **Connect to your own WiFi network**
([`/example/esp32-custom-wifi-ap`](/example/esp32-custom-wifi-ap)) öffnet
sich mit dem bereits platzierten Teil. Wenn Sie es ausführen, scannt es,
findet genau Ihr Netzwerk und tritt ihm bei:

![Serieller Monitor: Der Scan listet nur HomeNet auf, dann verbindet sich das Board und erhält eine IP](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

### Mehrere Netzwerke gleichzeitig

Fügen Sie ein Teil pro Netzwerk hinzu, um einen Picker oder eine
"Stärkstes zuerst"-Richtlinie zu testen. Jedes hat seinen eigenen Kanal und
sein eigenes Signal, sodass ein Scan so geordnet zurückkommt, wie es ein
echter tun würde:

```cpp
int n = WiFi.scanNetworks();
for (int i = 0; i < n; i++) {
  Serial.printf("%2d: %-16s ch %2d  %d dBm\n",
                i + 1, WiFi.SSID(i).c_str(), WiFi.channel(i), WiFi.RSSI(i));
}
```

**Scan several WiFi networks**
([`/example/esp32-wifi-scan-multi`](/example/esp32-wifi-scan-multi)) enthält
drei Teile: `HomeNet` bei -40 dBm, `Office_5G` bei -62 dBm und `CoffeeShop`
bei -78 dBm.

### Captive Portale und Provisionierung

Schalten Sie **internet** an einem Teil aus, und das Netzwerk wird isoliert.
Das Board assoziiert und erhält einen DHCP-Lease, aber kein Datenverkehr
verlässt das Netzwerk. Das ist das Provisionierungsszenario: Das Gerät
startet, findet keinen Weg nach draußen und stellt seine eigene
Konfigurationsseite bereit.

**Captive portal on an isolated network**
([`/example/esp32-wifi-captive-portal`](/example/esp32-wifi-captive-portal))
richtet dies mit einem AP namens `SetupAP` ein.

## Das WLAN-Panel

Ein WLAN-Abzeichen erscheint in der Leinwand-Symbolleiste, **wenn Sie Run
drücken**, und verschwindet bei Stop: Es gehört zur laufenden Simulation, es
gibt also nichts zu öffnen, bevor man eine startet. Es ist grau, während der
Stack bootet, und grün, sobald das Board eine Adresse hat.

Das Abzeichen ist eine geteilte Schaltfläche. Das Symbol behält seine
Ein-Klick-Aktion: Mit einer IP öffnet es den Webserver des Boards über das
IoT-Gateway. Das Caret daneben öffnet das **WiFi panel**:

![Das WLAN-Panel zeigt die Netzwerke auf dem Kanal für dieses Projekt, Download PCAP und den lokalen Gateway-Bereich](../../../../assets/docs/wifi-iot/wifi-panel.png)

Das Panel zeigt:

- **Netzwerke auf dem Kanal**, mit Kanal und Signal. Die Überschrift sagt
  *this project*, wenn Access-Point-Teile sie definieren, und *built-in*,
  wenn die vier Demo-Netzwerke auf dem Kanal sind:

  ![Das WLAN-Panel listet die vier eingebauten Netzwerke mit ihren Kanälen und Signalstärken auf](../../../../assets/docs/wifi-iot/wifi-panel-builtin.png)

- den Assoziationsstatus des Boards und seine IP, sobald DHCP abgeschlossen
  ist;
- **Download PCAP**, den 802.11-Datenverkehr des Laufs als
  Mitschnittdatei;
- den Abschnitt [Lokales Netzwerk-Gateway](/docs/de/wifi-iot/local-gateway/).
  Bei einem Maker-Plan enthält er das Kopplungsfeld; beim kostenlosen Plan
  erklärt er, was das Gateway tut, und verlinkt auf die Pläne.

### Datenverkehr erfassen und in Wireshark öffnen

1. Drücken Sie **Run** und lassen Sie den Sketch seine Netzwerkarbeit
   erledigen.
2. Öffnen Sie das WLAN-Panel und klicken Sie auf **Download PCAP**.
3. Öffnen Sie die Datei in Wireshark.

Der Mitschnitt enthält Verwaltungsrahmen, DHCP, DNS und TCP mit
simulierten Zeitstempeln, sodass `dhcp` oder `dns` als Anzeigefilter den
Handshake isoliert, den Sie debuggen. Die Datei wird in Ihrem Browser
erstellt: Es wird nichts hochgeladen.

## Ihr eigenes Gerät erreichen

Die obigen Netzwerke routen ins öffentliche Internet. Um den MQTT-Broker,
Home Assistant oder den Entwicklungsserver zu erreichen, der auf **Ihrem**
Rechner läuft, führen Sie das lokale Gateway aus: siehe [Lokales
Netzwerk-Gateway](/docs/de/wifi-iot/local-gateway/). Sketches erreichen Ihren
Rechner dann als `host.velxio.internal`.

## Fertige Beispiele

| Beispiel                                                                     | Was es zeigt                                        |
| ---------------------------------------------------------------------------- | --------------------------------------------------- |
| [Connect to WiFi](/example/esp32-wifi-connect)                               | Der minimale Beitritt zu einem eingebauten Netzwerk |
| [Scan WiFi networks](/example/esp32-wifi-scan)                               | `scanNetworks()` gegen die eingebaute Menge         |
| [Connect to your own WiFi network](/example/esp32-custom-wifi-ap)            | Ein Access-Point-Teil, Scan und Beitritt            |
| [Scan several WiFi networks](/example/esp32-wifi-scan-multi)                 | Drei Netzwerke mit verschiedenen Kanälen und Signal |
| [Captive portal on an isolated network](/example/esp32-wifi-captive-portal)  | `internet` aus, Provisionierungsablauf              |
| [NTP clock over your WiFi](/example/esp32-wifi-ntp-clock)                    | UDP zu einem echten Zeitserver                      |
| [Fetch JSON from a web API](/example/esp32-wifi-http-json)                   | HTTPClient gegen eine echte REST-API                |
| [Reach a service on your own network](/example/esp32-wifi-local-http)        | `host.velxio.internal` über das lokale Gateway      |
| [MQTT](/example/esp32-wifi-mqtt)                                             | Publizieren und Abonnieren auf einem öffentlichen Broker |

## Fehlerbehebung

| Symptom                                             | Ursache                                                                  | Lösung                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Hochgeladene Firmware assoziiert nie                 | Ihre SSID ist eingebacken, der Compiler konnte sie also nicht umschreiben | Benennen Sie ein eingebautes Netzwerk oder fügen Sie ein Access-Point-Teil mit dieser SSID hinzu |
| Ein Scan gibt nur Ihre Netzwerke zurück              | Funktioniert wie vorgesehen: Ein Access-Point-Teil schaltet die eingebaute Menge stumm | Entfernen Sie die Teile, um die Demo-Netzwerke zurückzubekommen            |
| Assoziiert und erhält eine IP, aber nichts wird geroutet | Das Teil hat **internet** ausgeschaltet                                  | Schalten Sie es ein, es sei denn, Sie testen ein Captive Portal            |
| Ein Passwort wird nicht abgelehnt                    | WPA2-Emulation ist noch nicht verfügbar, das Netzwerk sendet offene Authentifizierung | Derzeit erwartet; das Passwort wird auf dem Teil gespeichert               |
| `host.velxio.internal` löst nicht auf                | Kein lokales Gateway gekoppelt                                           | Siehe [Lokales Netzwerk-Gateway](/docs/de/wifi-iot/local-gateway/)            |

## Welche Boards

WLAN ist in der gesamten simulierten ESP32-Familie verfügbar: die klassischen
ESP32-Boards, ESP32-S3, ESP32-C3, ESP32-C6 und ESP32-C5, plus deren XIAO,
Nano- und M5Stack-Varianten. Der Raspberry Pi Pico W hat seine eigene
[CYW43-Emulation](/docs/de/boards/pico/). Der Bluetooth-Werbestatus wird auch
für Sketches gemeldet, die BLE initialisieren.
