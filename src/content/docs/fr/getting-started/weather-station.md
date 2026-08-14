---
title: "Tutoriel : station météo"
description: Un vrai projet multi-capteurs — BMP280 sur I2C, DHT22 sur GPIO et un écran TFT ILI9341 sur SPI, en direct sur un ESP32.
draft: true
sidebar:
  order: 3
---

Le [premier projet](/docs/fr/getting-started/first-project/) faisait clignoter une LED.
Celui-ci est un vrai appareil : un ESP32 qui lit la **température et la pression
via I²C** (BMP280), l'**humidité sur une GPIO** (DHT22), et affiche tout sur un
**écran TFT via SPI** (ILI9341) — trois bus fonctionnant en même temps, dans le
navigateur.

![La station météo en fonctionnement : les capteurs alimentent l'écran TFT en direct](../../../../assets/docs/getting-started/weather-station.gif)

## 1. Ouvrir le projet

Ouvrez le projet public :
[velxio.dev/dave/estacin-meteorolgica-esp32](https://velxio.dev/dave/estacin-meteorolgica-esp32).

![La station météo à l'ouverture](../../../../assets/docs/getting-started/weather-loaded.png)

Prenez un instant pour lire le circuit avant de l'exécuter :

- **BMP280** — `SDA`/`SCL` vers les broches I²C de l'ESP32. Deux fils, deux
  mesures (température + pression).
- **DHT22** — une seule GPIO de données avec sa résistance de tirage. Humidité et
  une seconde lecture de température.
- **ILI9341** — le faisceau SPI : `MOSI`, `SCK`, `CS`, `DC`, `RST`. Clic droit
  sur n'importe quelle pièce pour voir [son brochage et sa fiche technique](/docs/fr/circuit-editor/part-inspector/).

Ce projet a été conçu, câblé et programmé de bout en bout par
[l'agent IA de Velxio](/docs/fr/ai/agent-mode/) — vous pouvez construire la même chose en
le demandant.

## 2. L'exécuter

Appuyez sur **Run** (Exécuter). Le croquis compile avec la véritable chaîne d'outils Arduino (regardez
la console **Output** (Sortie) résoudre les bibliothèques Adafruit), l'ESP32 démarre,
et :

![Station météo en cours d'exécution avec écran TFT en direct](../../../../assets/docs/getting-started/weather-running.png)

- Le **TFT** dessine le tableau de bord et se rafraîchit avec les lectures en direct.
- Le **moniteur série** journalise chaque balayage de capteurs :

![Sortie série de la station météo](../../../../assets/docs/getting-started/weather-serial.png)

## 3. Changer la météo

Cliquez sur le **BMP280** ou le **DHT22** pendant que la simulation s'exécute — leurs
panneaux de contrôle de capteurs vous permettent de faire glisser la température, l'humidité et la pression.
Le firmware lit les nouvelles valeurs lors de son prochain sondage I²C/GPIO et l'écran TFT
suit. Cette boucle — ajuster l'entrée, observer le dispositif réagir — est tout l'intérêt
de simuler d'abord.

## 4. Personnalisez-le

Traitez-le comme n'importe quel projet : modifiez la disposition de l'affichage dans le croquis, ajoutez un
seuil qui allume une LED lorsque l'humidité dépasse 70 %, ou remplacez le DHT22
par un autre capteur du [catalogue](/docs/fr/parts/overview/). Ensuite,
[sauvegardez votre copie](/docs/fr/getting-started/projects/).

## Construisez-le plutôt à partir de zéro

Si vous préférez le câbler vous-même : partez d'un [modèle](/docs/fr/getting-started/projects/) ESP32
vierge, ajoutez les trois pièces depuis le
[sélecteur](/docs/fr/circuit-editor/placing-components/), câblez les bus comme
ci-dessus, et ajoutez les bibliothèques **Adafruit BMP280**, **DHT sensor library** et
**Adafruit ILI9341** ([comment faire](/docs/fr/programming/libraries/)).
Ou ouvrez l'[assistant IA](/docs/fr/ai/agent-mode/) et demandez-lui de construire la
station avec vous — c'est ainsi que celle-ci est née.
