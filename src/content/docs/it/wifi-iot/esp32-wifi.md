---
title: WiFi ESP32 nel simulatore
description: Unisciti alla rete Velxio-GUEST integrata e raggiungi Internet reale da un ESP32 simulato.
sidebar:
  order: 2
---

Le schede ESP32 in Velxio sono dotate di **WiFi funzionante**: la radio emulata
vede un punto di accesso aperto chiamato **`Velxio-GUEST`**, si associa,
ottiene un indirizzo IP tramite DHCP e raggiunge Internet attraverso il gateway
NAT dell'emulatore. Lo stesso identico sketch funziona sul chip fisico.

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
il lease DHCP — perché _è_ il vero stack WiFi in esecuzione:

![Monitor seriale durante una connessione WiFi](../../../../assets/docs/wifi-iot/serial-wifi.png)

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

## Le tue reti: punti di accesso personalizzati

Con un piano Maker non sei limitato alle reti demo integrate: aggiungi un
componente **WiFi Access Point** (punto di accesso WiFi) alla tela (cerca "WiFi Access Point" nel selettore componenti) e la radio emulata trasmette **il tuo SSID** al suo posto. Lo sketch si connette quindi alla rete che nomina effettivamente:

```cpp
WiFi.begin("HomeNet", "");   // the SSID on your Access Point part
```

![Un componente WiFi Access Point sulla tela accanto a un ESP32, che trasmette HomeNet sul canale 6](../../../../assets/docs/wifi-iot/access-point-part.png)

Il componente non ha pin — non è un componente elettrico, è spazio aereo.
Non appena un progetto contiene almeno un punto di accesso, le reti integrate
tacciono: una scansione vede esattamente ciò che la tela definisce. Aggiungi
più componenti per esercitare un'interfaccia di selezione rete; ciascuno ha il
proprio canale e la propria potenza del segnale, e le scansioni ripetute
oscillano di qualche dB come quelle reali.

Due proprietà meritano attenzione:

- **Internet** — disattivala e la rete diventa isolata: la scheda si associa
  e ottiene un IP tramite DHCP, ma nulla viene instradato all'esterno. Questo è
  lo scenario di provisioning / portale captive, ora testabile nel simulatore.
- **Password** — memorizzata con il componente e mostrata sulla sua scheda, ma
  la rete trasmette comunque autenticazione aperta finché non arriva l'emulazione WPA2.
  Gli sketch che passano una password si connettono comunque.

Anche il firmware caricato ne trae beneficio: un binario compilato altrove si
connette a qualsiasi rete nomini, purché un punto di accesso trasmetta quello
SSID — nessuna ricompilazione necessaria.

Quando viene eseguita, la scansione trova esattamente la tua rete e la scheda vi si unisce:

![Monitor seriale: la scansione elenca solo HomeNet, poi la scheda si connette e ottiene IP 10.13.37.42](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

Provalo con un clic: l'esempio della galleria **Connect to your own WiFi
network** si apre con il componente già sulla tela.

## Il pannello WiFi

L'icona WiFi nella barra degli strumenti è un pulsante diviso. L'icona stessa
mantiene la sua azione con un clic — con un IP apre il server web della scheda
attraverso il gateway IoT. La piccola freccia accanto apre il **pannello WiFi** (WiFi panel):

![Il pannello WiFi: reti in onda con canale e segnale, associazione e IP della scheda, Download PCAP e associazione gateway locale](../../../../assets/docs/wifi-iot/wifi-panel.png)

- le reti attualmente in onda (i tuoi punti di accesso o il set integrato),
  con quella associata spuntata;
- lo stato di connessione e l'IP della scheda;
- **Download PCAP** — il traffico 802.11 dell'esecuzione come file di cattura
  che Wireshark apre direttamente (frame di gestione, DHCP, DNS, TCP, con
  timestamp a tempo simulato). Nulla viene caricato; il file viene generato
  nel tuo browser;
- l'associazione del [gateway di rete locale](/docs/it/wifi-iot/local-gateway/).

## Cosa puoi raggiungere

Una volta connesso, socket TCP/UDP standard, client HTTP e librerie MQTT
funzionano contro **server reali su Internet** — broker MQTT pubblici, API
REST, NTP. Vedi [MQTT e HTTP](/docs/it/wifi-iot/mqtt-http/) per progetti
completi.

## Quali schede

Il WiFi è disponibile su tutta la famiglia ESP32 simulata — le classiche schede
ESP32, ESP32-S3, ESP32-C3, ESP32-C6 ed ESP32-C5 (e le loro varianti XIAO / Nano /
M5Stack). Lo stato di advertising Bluetooth viene inoltre riportato per gli
sketch che inizializzano BLE.
