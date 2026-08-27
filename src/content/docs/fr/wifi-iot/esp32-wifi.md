---
title: "WiFi ESP32 dans le simulateur"
description: "Rejoignez le réseau intégré Velxio-GUEST et accédez à Internet réel depuis un ESP32 simulé."
sidebar:
  order: 2
---

Les cartes ESP32 dans Velxio sont équipées d'un **WiFi fonctionnel** : la radio émulée voit
un point d'accès ouvert nommé **`Velxio-GUEST`**, s'y associe, obtient une adresse IP
via DHCP, et accède à Internet via la passerelle NAT de l'émulateur.
Le même sketch exact fonctionne sur la puce physique.

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

Le moniteur série affiche le bavardage de démarrage habituel `wifi:connected` et
le bail DHCP — car c'est _réellement_ la pile WiFi qui s'exécute :

![Moniteur série lors d'une connexion WiFi](../../../../assets/docs/wifi-iot/serial-wifi.png)

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

## Vos propres réseaux : points d'accès personnalisés

Avec un plan Maker, vous n'êtes pas limité aux réseaux de démonstration intégrés : ajoutez
un composant **WiFi Access Point** (point d'accès WiFi) au canvas (recherchez « WiFi Access Point » dans le
sélecteur de composants) et la radio émulée diffuse **votre SSID** à la place. Le
sketch se connecte alors au réseau qu'il nomme réellement :

```cpp
WiFi.begin("HomeNet", "");   // the SSID on your Access Point part
```

![Un composant WiFi Access Point sur le canvas à côté d'un ESP32, diffusant HomeNet sur le canal 6](../../../../assets/docs/wifi-iot/access-point-part.png)

Le composant n'a pas de broches — ce n'est pas un composant électrique, c'est de l'espace aérien.
Dès qu'un projet contient au moins un composant point d'accès, les réseaux
intégrés se taisent : un scan voit exactement ce que le canvas définit. Ajoutez
plusieurs composants pour tester une interface de sélection de réseau ; chacun porte son propre
canal et sa propre intensité de signal, et les scans répétés varient de quelques dB comme
le feraient de vrais scans.

Deux propriétés méritent d'être connues :

- **Internet** — désactivez-la et le réseau devient isolé : la carte
  s'associe et obtient une IP via DHCP, mais rien ne sort. C'est le
  scénario de provisionnement / portail captif, désormais testable dans le simulateur.
- **Password** (mot de passe) — stocké avec le composant et affiché sur sa carte, mais le
  réseau diffuse toujours une authentification ouverte jusqu'à ce que l'émulation WPA2 arrive.
  Les sketches qui passent un mot de passe se connectent quand même.

Le firmware téléversé en bénéficie aussi : un binaire compilé ailleurs se connecte au
réseau qu'il nomme, tant qu'un composant point d'accès diffuse ce
SSID — aucune recompilation nécessaire.

Lors de l'exécution, le scan trouve exactement votre réseau et la carte le rejoint :

![Moniteur série : le scan liste uniquement HomeNet, puis la carte se connecte et obtient l'IP 10.13.37.42](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

Essayez-le en un clic : l'exemple de la galerie **Connect to your own WiFi
network** (se connecter à votre propre réseau WiFi) s'ouvre avec le composant déjà sur le canvas.

## Le panneau WiFi

L'icône WiFi dans la barre d'outils est un bouton fractionné. L'icône elle-même conserve son
action en un clic — avec une IP, elle ouvre le serveur web de la carte via la
passerelle IoT. La petite flèche à côté ouvre le **WiFi panel** (panneau WiFi) :

![Le panneau WiFi : réseaux en ondes avec canal et signal, association et IP de la carte, Download PCAP, et l'appairage de la passerelle locale](../../../../assets/docs/wifi-iot/wifi-panel.png)

- les réseaux actuellement en ondes (vos points d'accès, ou l'ensemble
  intégré), avec celui auquel la carte est associée coché ;
- l'état de connexion et l'IP de la carte ;
- **Download PCAP** (télécharger PCAP) — le trafic 802.11 de l'exécution sous forme de fichier de capture que
  Wireshark ouvre directement (trames de gestion, DHCP, DNS, TCP, avec
  horodatages en temps simulé). Rien n'est téléversé ; le fichier est généré dans
  votre navigateur ;
- l'appairage de la [passerelle réseau locale](/docs/fr/wifi-iot/local-gateway/).

## Ce que vous pouvez atteindre

Une fois connecté, les sockets TCP/UDP standard, les clients HTTP et les bibliothèques MQTT
fonctionnent contre de **vrais serveurs sur Internet** — courtiers MQTT publics, API
REST, NTP. Voir [MQTT et HTTP](/docs/fr/wifi-iot/mqtt-http/) pour des
projets complets.

## Quelles cartes

Le WiFi est disponible sur toute la famille ESP32 simulée — les cartes ESP32
classiques, ESP32-S3, ESP32-C3, ESP32-C6 et ESP32-C5 (et leurs variantes XIAO / Nano /
M5Stack). L'état de publicité Bluetooth est également rapporté pour les
sketches qui initialisent le BLE.
