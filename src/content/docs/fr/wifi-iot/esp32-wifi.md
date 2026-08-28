---
title: WiFi ESP32 dans le simulateur
description: Rejoignez un réseau depuis un ESP32 simulé, diffusez votre propre SSID, capturez le trafic en PCAP et atteignez votre LAN réel.
sidebar:
  order: 2
---

Les cartes ESP32 dans Velxio sont livrées avec un **WiFi fonctionnel**. La radio émulée analyse,
s'associe, obtient une adresse IP via DHCP et atteint internet via la passerelle NAT de l'émulateur.
Il s'agit de la véritable pile WiFi du SDK du fournisseur fonctionnant sur une radio émulée, et non d'un
simulacre : le même sketch, inchangé, fonctionne sur la puce physique.

Cette page va d'une première connexion à vos propres réseaux, en passant par les captures de paquets
et votre LAN réel.

## Votre première connexion

1. Ouvrez l'exemple de la galerie **Connect to WiFi**
   ([`/example/esp32-wifi-connect`](/example/esp32-wifi-connect)), ou déposez n'importe quelle
   carte ESP32 sur le canevas et collez le sketch ci-dessous.
2. Appuyez sur **Run**. La première compilation d'une session prend plus de temps ; les suivantes sont
   mises en cache.
3. Ouvrez le moniteur **Serial** depuis la barre d'outils sous le canevas.
4. Observez la connexion : le bavardage de démarrage du SDK, puis le bail DHCP.

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // intégré, réseau ouvert

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

Le moniteur série affiche la connexion et l'adresse attribuée par le serveur DHCP émulé :

![Moniteur série : Connexion à Espressif, puis Connecté avec l'IP 10.13.37.42, l'adresse MAC et la force du signal](../../../../assets/docs/wifi-iot/serial-wifi.png)

Une chose surprend tout le monde la première fois : le journal indique
`Connecting to Espressif` même si le sketch nomme `Velxio-GUEST`. C'est
la réécriture de SSID qui fait son travail, et la section suivante l'explique.

L'IP est réelle dans la simulation : les sockets, les clients HTTP et les bibliothèques MQTT
fonctionnent à partir de là. Voir [MQTT et HTTP](/docs/fr/wifi-iot/mqtt-http/)
pour des projets complets.

## Les réseaux intégrés

Sans partie point d'accès sur le canevas, la radio balise quatre réseaux de démonstration.
Une station s'associe à exactement un d'entre eux :

| SSID            | Canal | Signal  | Auth      |
| --------------- | ----- | ------- | --------- |
| `Velxio-GUEST`  | 6     | -20 dBm | Ouvert    |
| `PICSimLabWifi` | 1     | -25 dBm | WPA2-PSK  |
| `Espressif`     | 5     | -30 dBm | WPA2-PSK  |
| `MasseyWifi`    | 10    | -40 dBm | WPA2-PSK  |

### Le SSID dans votre sketch n'a pas d'importance

Tant que le projet n'a pas de partie point d'accès, le nom de réseau que vous écrivez n'est
**pas** celui auquel la carte se connecte. Sur le chemin de l'émulateur, le compilateur
réécrit chaque littéral de SSID en `Espressif` et efface chaque littéral de mot de passe,
qu'il s'agisse d'une variable, d'un tableau, d'un `#define` ou d'un champ de structure :

```cpp
const char* ssid = "MyHomeNetwork";   // compilé comme "Espressif"
#define WIFI_PASS "hunter2"           // compilé comme ""
```

C'est pourquoi un sketch copié depuis n'importe quel tutoriel se connecte ici sans être
modifié, pourquoi un mot de passe erroné n'échoue jamais, et pourquoi le journal série
nomme un réseau que vous n'avez pas tapé. Rien ne va mal quand cela se produit.

Deux conséquences à connaître :

- **L'ajout d'une partie point d'accès désactive la réécriture.** À partir de là, le
  projet définit son propre espace aérien, donc ce que vous tapez est ce qui existe et le
  SSID doit correspondre à une partie.
- **Un firmware qui arrive déjà compilé ne passe jamais par la réécriture.**
  Il recherche le SSID intégré dans le binaire, c'est pourquoi un `.bin` par ailleurs
  fonctionnel peut rester là sans s'associer. Recompilez-le en nommant l'un des quatre
  réseaux ci-dessus, ou diffusez le SSID qu'il attend avec une partie point d'accès.

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

`sta.scan()` renvoie les mêmes réseaux que l'API Arduino, sous forme de
tuples `(ssid, bssid, channel, rssi, authmode, hidden)`.

## Vos propres réseaux

Avec un plan Maker, vous n'êtes pas limité aux réseaux de démonstration. Une partie
**WiFi Access Point** fait diffuser à la radio émulée **votre** SSID.

1. Cliquez sur **Add Component** dans la barre d'outils du canevas.
2. Recherchez `WiFi Access Point` et placez-le. Il ne nécessite aucun câblage : il n'a pas
   de broches, c'est de l'espace aérien.
3. Sélectionnez la partie et définissez **ssid** sur le réseau souhaité, par exemple
   `HomeNet`.
4. Pointez le sketch vers ce nom et appuyez sur **Run**.

```cpp
WiFi.begin("HomeNet");   // le SSID sur votre partie Access Point
```

![Une partie WiFi Access Point sur le canevas à côté d'une carte ESP32, diffusant HomeNet sur le canal 6](../../../../assets/docs/wifi-iot/access-point-part.png)

**Dès qu'un projet contient une partie point d'accès, les réseaux intégrés se taisent.**
Une analyse voit alors exactement ce que le canevas définit, ce qui rend le code de
sélection de réseau testable.

### Propriétés de la partie

| Propriété   | Défaut       | Ce qu'elle fait                                                                           |
| ----------- | ------------ | ----------------------------------------------------------------------------------------- |
| `ssid`      | `MyNetwork`  | Le nom du réseau auquel votre sketch se connecte.                                          |
| `password`  | vide         | Stocké et affiché sur la carte. Le réseau diffuse toujours une authentification ouverte jusqu'à l'arrivée de WPA2, donc les sketches qui passent un mot de passe se connectent quand même. |
| `channel`   | `6`          | Canal WiFi, de 1 à 13. Rapporté par les analyses.                                          |
| `rssi`      | `-50`        | Force du signal en dBm telle que la carte la voit, de -90 à -20. Les analyses répétées varient de quelques dB comme les vraies. |
| `internet`  | activé       | Désactivé rend le réseau isolé : la carte s'associe et obtient une IP, mais rien ne route vers l'extérieur. |
| `bssid`     | vide         | Adresse MAC du point d'accès. Vide signifie une adresse stable générée à partir du SSID.   |

Essayez en un clic : **Connect to your own WiFi network**
([`/example/esp32-custom-wifi-ap`](/example/esp32-custom-wifi-ap)) s'ouvre avec
la partie déjà placée. L'exécuter analyse, trouve exactement votre réseau, et
s'y connecte :

![Moniteur série : l'analyse ne liste que HomeNet, puis la carte se connecte et obtient une IP](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

### Plusieurs réseaux à la fois

Ajoutez une partie par réseau pour tester un sélecteur ou une politique de "puissance décroissante".
Chacune porte son propre canal et son propre signal, donc une analyse revient ordonnée comme
une vraie le serait :

```cpp
int n = WiFi.scanNetworks();
for (int i = 0; i < n; i++) {
  Serial.printf("%2d: %-16s ch %2d  %d dBm\n",
                i + 1, WiFi.SSID(i).c_str(), WiFi.channel(i), WiFi.RSSI(i));
}
```

**Scan several WiFi networks**
([`/example/esp32-wifi-scan-multi`](/example/esp32-wifi-scan-multi)) est livré avec
trois parties : `HomeNet` à -40 dBm, `Office_5G` à -62 dBm et `CoffeeShop` à
-78 dBm.

### Portails captifs et provisionnement

Désactivez **internet** sur une partie et le réseau devient isolé. La carte
s'associe et obtient un bail DHCP, mais aucun trafic ne sort. C'est le
scénario de provisionnement : l'appareil démarre, ne trouve aucune issue, et sert sa
propre page de configuration.

**Captive portal on an isolated network**
([`/example/esp32-wifi-captive-portal`](/example/esp32-wifi-captive-portal))
configure cela avec un point d'accès nommé `SetupAP`.

## Le panneau WiFi

Un badge WiFi apparaît sur la barre d'outils du canevas **lorsque vous appuyez sur Run**, et disparaît
à l'arrêt : il appartient à la simulation en cours, donc il n'y a rien à ouvrir
avant d'en démarrer une. Il est gris pendant le démarrage de la pile et vert une fois que la carte
a une adresse.

Le badge est un bouton partagé. L'icône conserve son action en un clic : avec une IP,
elle ouvre le serveur web de la carte via la passerelle IoT. Le chevron à côté
ouvre le **panneau WiFi** :

![Le panneau WiFi montrant les réseaux en l'air pour ce projet, Download PCAP et la section passerelle locale](../../../../assets/docs/wifi-iot/wifi-panel.png)

Le panneau affiche :

- **Les réseaux en l'air**, avec le canal et le signal. Le titre indique
  *ce projet* lorsque des parties point d'accès les définissent, et *intégrés* lorsque les
  quatre réseaux de démonstration sont en l'air :

  ![Le panneau WiFi listant les quatre réseaux intégrés avec leurs canaux et forces de signal](../../../../assets/docs/wifi-iot/wifi-panel-builtin.png)

- l'état d'association de la carte et son IP une fois le DHCP terminé ;
- **Download PCAP**, le trafic 802.11 de l'exécution sous forme de fichier de capture ;
- la section [passerelle réseau locale](/docs/fr/wifi-iot/local-gateway/). Avec un
  plan Maker, elle contient le champ d'appairage ; avec le plan gratuit, elle explique ce que
  fait la passerelle et renvoie vers les plans.

### Capturez le trafic et ouvrez-le dans Wireshark

1. Appuyez sur **Run** et laissez le sketch faire son travail réseau.
2. Ouvrez le panneau WiFi et cliquez sur **Download PCAP**.
3. Ouvrez le fichier dans Wireshark.

La capture contient les trames de gestion, DHCP, DNS et TCP, avec des horodatages
simulés, donc `dhcp` ou `dns` comme filtre d'affichage isole la poignée de main que vous
déboguez. Le fichier est produit dans votre navigateur : rien n'est téléchargé.

## Atteindre votre propre machine

Les réseaux ci-dessus routent vers l'internet public. Pour atteindre le courtier MQTT,
Home Assistant ou le serveur de développement fonctionnant sur **votre** machine, exécutez la
passerelle locale : voir [Passerelle réseau locale](/docs/fr/wifi-iot/local-gateway/). Les sketches
atteignent alors votre machine sous le nom `host.velxio.internal`.

## Exemples prêts à l'emploi

| Exemple                                                                     | Ce qu'il montre                                    |
| --------------------------------------------------------------------------- | -------------------------------------------------- |
| [Connect to WiFi](/example/esp32-wifi-connect)                              | La connexion minimale à un réseau intégré          |
| [Scan WiFi networks](/example/esp32-wifi-scan)                              | `scanNetworks()` contre l'ensemble intégré        |
| [Connect to your own WiFi network](/example/esp32-custom-wifi-ap)           | Une partie point d'accès, analyse et connexion     |
| [Scan several WiFi networks](/example/esp32-wifi-scan-multi)                | Trois réseaux avec différents canaux et signaux    |
| [Captive portal on an isolated network](/example/esp32-wifi-captive-portal) | `internet` désactivé, flux de provisionnement      |
| [NTP clock over your WiFi](/example/esp32-wifi-ntp-clock)                   | UDP vers un serveur de temps réel                  |
| [Fetch JSON from a web API](/example/esp32-wifi-http-json)                  | HTTPClient contre une vraie API REST               |
| [Reach a service on your own network](/example/esp32-wifi-local-http)       | `host.velxio.internal` via la passerelle locale    |
| [MQTT](/example/esp32-wifi-mqtt)                                            | Publier et s'abonner sur un courtier public        |

## Dépannage

| Symptôme                                             | Cause                                                                     | Correctif                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Le firmware téléversé ne s'associe jamais             | Son SSID est intégré, donc le compilateur n'a pas pu le réécrire           | Nommez un réseau intégré, ou ajoutez une partie point d'accès avec ce SSID   |
| Une analyse ne renvoie que vos réseaux               | Fonctionne comme prévu : une partie point d'accès fait taire l'ensemble intégré | Supprimez les parties pour retrouver les réseaux de démonstration            |
| S'associe et obtient une IP, mais rien ne route      | La partie a **internet** désactivé                                         | Activez-le, sauf si vous testez un portail captif                            |
| Un mot de passe n'est pas rejeté                     | L'émulation WPA2 n'est pas encore là, le réseau diffuse une authentification ouverte | Attendu pour l'instant ; le mot de passe est stocké sur la partie            |
| `host.velxio.internal` ne se résout pas              | Aucune passerelle locale appairée                                          | Voir [Passerelle réseau locale](/docs/fr/wifi-iot/local-gateway/)               |

## Quelles cartes

Le WiFi est disponible sur toute la famille ESP32 simulée : les cartes ESP32 classiques,
ESP32-S3, ESP32-C3, ESP32-C6 et ESP32-C5, ainsi que leurs variantes XIAO, Nano et
M5Stack. Le Raspberry Pi Pico W a sa propre
[émulation CYW43](/docs/fr/boards/pico/). L'état de diffusion Bluetooth est également
signalé pour les sketches qui initialisent le BLE.
