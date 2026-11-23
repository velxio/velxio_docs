---
title: "BBC micro:bit"
description: "La BBC micro:bit V2 et sept cartes DFRobot pour celle-ci, exécutant le firmware MicroPython officiel dans votre navigateur."
sidebar:
  order: 5.5
---

La **BBC micro:bit V2** s'exécute dans Velxio avec son propre firmware
MicroPython officiel (2.1.1), non modifié, sur un moteur en navigateur pour
sa puce nRF52833. Écrivez du MicroPython, appuyez sur Run, et le programme
s'exécute dans l'onglet de votre navigateur, sur toutes les offres, y compris
la gratuite.

![La BBC micro:bit V2 sur le canevas Velxio](../../../../assets/docs/boards/microbit-v2.png)

## Ce qui s'exécute

- La matrice de LED 5x5, les boutons A et B et le logo tactile, sur un dessin
  sur lequel vous pouvez cliquer.
- Le capteur de mouvement (inclinez le socle sous la carte), ainsi que le cap
  de la boussole, la température, le niveau de lumière et le niveau sonore,
  réglés depuis le panneau de capteurs de la carte.
- Le haut-parleur, une fois le son activé dans ce panneau, et le connecteur
  de bord : câblez des LED, des potentiomètres, des servos ou des capteurs
  Grove sur ses anneaux et ses bandes comme sur la vraie carte.
- Un REPL dans le Serial Monitor, et **Upload firmware** pour un fichier
  MicroPython `.hex` enregistré par python.microbit.org, dont les fichiers
  s'ouvrent dans l'éditeur.

**MicroPython uniquement** pour l'instant : pas d'Arduino/C++ ni de blocs
MakeCode (un `.hex` MakeCode n'est pas encore pris en charge). La radio entre deux
micro:bit et le Bluetooth ne sont pas modélisés.

## Pour commencer

- [Hello, World! sur la matrice de LED](https://velxio.dev/example/microbit-v2-hello)
- [Boutons A et B](https://velxio.dev/example/microbit-v2-buttons)
- [Niveau à bulle](https://velxio.dev/example/microbit-v2-spirit-level), sur
  l'accéléromètre
- [Thermomètre](https://velxio.dev/example/microbit-v2-thermometer), sur la
  température propre à la puce

## Cartes DFRobot pour la micro:bit

Sept cartes DFRobot sont dans Velxio, chacune étant sa propre carte sur le
canevas : placez-la et la micro:bit vient se loger dans son support, la
matrice et les boutons restant accessibles. Une carte dotée de puces s'ouvre
avec un pilote MicroPython à côté de `main.py` (`maqueen.py`,
`maqueen_v5.py`, `microdriver.py`, `microiobox.py`) qui écrit les mêmes
octets que les blocs MakeCode de DFRobot.

![La micro:bit V2 logée sur une DFRobot Maqueen Lite sur le canevas Velxio](../../../../assets/docs/boards/microbit-v2-maqueen-lite.png)

### Maqueen Lite

Le petit robot à deux roues de DFRobot (ROB0148-EN) : deux moteurs derrière un
pilote sur I2C, deux phares, deux capteurs de ligne, quatre LED RVB et un
support à ultrasons. Dans un Monde 3D, la Maqueen elle-même est le robot.
[Suiveur de ligne](https://velxio.dev/example/microbit-v2-maqueen-lite-line) ·
[Conduire et faire clignoter les phares](https://velxio.dev/example/microbit-v2-maqueen-lite-drive) ·
[Boutique DFRobot](https://www.dfrobot.com/product-1783.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite)

### Maqueen Lite V5

La Maqueen Lite actuelle (MBT0046) : phares RVB, trois capteurs de ligne,
deux capteurs de lumière et un niveau de batterie derrière son propre
contrôleur sur I2C.
[Phares couleur et capteurs de lumière](https://velxio.dev/example/microbit-v2-maqueen-lite-v5-lights) ·
[Boutique DFRobot](https://www.dfrobot.com/product-2937.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite-v5)

### micro:Driver

Quatre sorties de moteur CC et huit broches de servo depuis une seule puce
PCA9685 sur I2C (DFR0548), plus neuf broches micro:bit sur des broches à
3 fils.
[Deux servos et un moteur CC](https://velxio.dev/example/microbit-v2-micro-driver-servos) ·
[Boutique DFRobot](https://www.dfrobot.com/product-1738.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-driver)

### micro:IO-BOX

Un contrôleur de robot compact (MBT0005) : un pilote de moteur bidirectionnel
sur I2C, neuf broches d'E/S, des ports I2C et UART et un buzzer sur P0.
[Deux moteurs en avant et en arrière](https://velxio.dev/example/microbit-v2-io-box-motors) ·
[Boutique DFRobot](https://www.dfrobot.com/product-1847.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-box)

### IO Extender

Une carte de dérivation (MBT0008) avec chaque broche du connecteur de bord
sur une broche à 3 fils (signal, 3,3 V, masse), trois ports I2C et un buzzer
sur P0 avec un interrupteur.
[Un capteur de lumière sur P1](https://velxio.dev/example/microbit-v2-io-extender-light) ·
[Boutique DFRobot](https://www.dfrobot.com/product-1867.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-extender)

### micro:Mate

Une carte de la taille de la micro:bit (DFR0518) qui se visse sur sa face
avant, avec six broches Gravity à 3 fils : P0, P1 et P2 à 3,3 V, P8, P12 et
P16 à 5 V.
[Un capteur de lumière sur P0](https://velxio.dev/example/microbit-v2-micro-mate-light) ·
[Boutique DFRobot](https://www.dfrobot.com/product-1699.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-mate)

### Robotics & Power IO Extender

Une carte de dérivation complète pour la micro:bit (DFR1231) avec les broches
de l'IO Extender dans le même ordre et les mêmes noms de broches, de sorte
qu'un projet passe de l'une à l'autre sans renommer un fil.
[Un capteur de lumière sur P1](https://velxio.dev/example/microbit-v2-robotics-io-extender-light) ·
[Boutique DFRobot](https://www.dfrobot.com/product-2963.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-robotics-io-extender)

_Les liens vers la boutique sur cette page sont des liens d'affiliation : Velxio perçoit une petite commission, sans coût supplémentaire pour vous._

## Illustration des cartes et brochages

L'illustration sur le canevas et la carte complète des broches de chaque
carte, générées à partir du simulateur :

[BBC micro:bit V2](/docs/fr/boards/reference/microbit-v2/) ·
[Maqueen Lite](/docs/fr/boards/reference/microbit-v2-maqueen-lite/) ·
[Maqueen Lite V5](/docs/fr/boards/reference/microbit-v2-maqueen-lite-v5/) ·
[micro:Driver](/docs/fr/boards/reference/microbit-v2-micro-driver/) ·
[micro:IO-BOX](/docs/fr/boards/reference/microbit-v2-io-box/) ·
[IO Extender](/docs/fr/boards/reference/microbit-v2-io-extender/) ·
[micro:Mate](/docs/fr/boards/reference/microbit-v2-micro-mate/) ·
[Robotics & Power IO Extender](/docs/fr/boards/reference/microbit-v2-robotics-io-extender/)

---

BBC micro:bit est une marque de la Micro:bit Educational Foundation. Velxio
fonctionne avec la micro:bit ; il n'est ni fabriqué ni approuvé par la
Fondation. La micro:bit elle-même est vendue par les revendeurs listés par la
Fondation sur [microbit.org](https://microbit.org/buy/).
