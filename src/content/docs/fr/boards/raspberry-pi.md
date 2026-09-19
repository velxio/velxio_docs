---
title: Raspberry Pi (Linux)
description: Cartes Raspberry Pi, de la Zero à la Pi 5. Python face au circuit sur le canevas, dans le navigateur par défaut ou dans un invité Linux sur les serveurs de Velxio, avec ce qui fonctionne sur chaque partie mesurée pièce par pièce.
sidebar:
  order: 7
  badge: PRO
---

La famille Raspberry Pi exécute des **scripts Python face au circuit sur le
canevas**. Contrairement aux cartes à microcontrôleur, il n'y a rien à compiler :
vous écrivez un script, appuyez sur **Run**, et Velxio choisit l'un des deux moteurs pour
l'exécuter. Aucun des deux moteurs n'est un bureau Raspberry Pi OS, alors lisez cette page
avant de supposer qu'un tutoriel écrit pour du matériel réel fonctionnera tel quel.
La plupart fonctionnent : les tableaux ci-dessous ont été mesurés sur le produit réel,
pièce par pièce, le 2026-09-19.

| Carte                         | Profil CPU          |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

N'importe qui peut placer un Pi sur le canevas et câbler un circuit autour. Le **faire tourner**
nécessite un forfait payant, ou l'une des **trois sessions d'essai gratuites de 15
minutes** que chaque compte connecté reçoit pour la famille Pi (voir
[forfaits](/docs/fr/getting-started/plans/)). Un projet qui n'a rien qu'un Pi puisse
exécuter, comme un croquis Arduino `.ino` sur une carte Pi, est signalé comme tel avant qu'une session d'essai
n'y soit consacrée.

![Raspberry Pi 5 sur le canevas Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Deux moteurs

### Instantané (dans votre navigateur)

Le moteur par défaut. Votre script s'exécute sur un interpréteur Python compilé en
WebAssembly dans l'onglet, démarre en quelques secondes et ne nécessite rien
des serveurs de Velxio. Les écritures de broches atteignent directement le canevas, donc une LED
s'allume au moment où `led.on()` s'exécute. I2C, SPI et 1-Wire sont présents sous la forme des
fichiers de périphériques qu'un Pi possède (`/dev/i2c-1`, `/dev/spidev0.0`, l'arborescence
`/sys/bus/w1/devices`), répondus par les pièces câblées sur le canevas, de sorte
que les vrais `smbus2`, `w1thermsensor` et Adafruit Blinka s'exécutent sans modification.

C'est un simple interpréteur, pas un système d'exploitation : il n'y a pas de shell, pas de
`subprocess`, pas de sockets brutes. Un script qui en demande un est envoyé
au moteur Linux à la place ; la **puce de moteur** dans la barre d'outils indique quel
moteur s'exécutera et, lorsqu'il s'agit de Linux, le fichier et la ligne qui l'ont demandé.

### Linux (sur les serveurs de Velxio)

Un véritable invité Linux démarré dans QEMU (`-M virt`, avec le profil CPU de votre
carte) auquel vous accédez via la console série dans l'espace de travail. Soyez
précis sur ce que c'est :

- **Alpine Linux**, pas Raspberry Pi OS. `python3` et `pip` sont installés ;
  `apt`, `raspi-config`, le bureau et les outils du firmware Pi ne sont pas
  présents.
- **Pas de réseau** depuis l'intérieur de l'invité, volontairement. `pip install` ne peut pas
  atteindre PyPI ; les paquets arrivent via `requirements.txt` (ci-dessous).
- **Les bus du connecteur sont de vrais fichiers de périphériques.** `/dev/i2c-1`,
  `/dev/spidev0.0` et `/dev/spidev0.1` répondent aux mêmes appels système qu'ils
  le font sur un Pi, donc une bibliothèque qui les ouvre elle-même (Adafruit Blinka), un programme C,
  ou votre propre code `ioctl` parle aux pièces sur le canevas. Une
  adresse que personne ne détient échoue avec `OSError: [Errno 121] Remote I/O error`,
  comme sur le matériel.
- **L'UART du connecteur est un vrai port série.** `/dev/serial0` (aussi
  `/dev/ttyAMA0` et `/dev/ttyS0`) est un véritable tty piloté par le
  pyserial non modifié : `serial.tools.list_ports`, `select()` sur le port
  et `cat /dev/serial0` fonctionnent tous, et les octets vont vers ce qui est câblé à
  GPIO14 et GPIO15 sur le canevas.
- Il n'y a **pas** de `/dev/gpiomem`, `/dev/gpiochip0`, `/sys/class/gpio` ni
  d'arborescence 1-Wire. Le GPIO passe par `RPi.GPIO` et `gpiozero`, qui sont
  présents ; `libgpiod`, `gpioinfo` et `pigpio` n'ont rien à qui parler.
- Le démarrage prend environ 20 à 30 secondes, plus longtemps quand le serveur est occupé ; une
  superposition "Booting" le suit. Une session invitée se termine après **2 heures** au
  plus tard.
- L'invité exécute **`script.py`** de votre projet au démarrage. Nommez votre
  fichier principal ainsi en mode Linux (le moteur instantané exécute le premier
  `.py` qu'il trouve).

Le bouton **Linux terminal** dans l'espace de travail fixe ce moteur pour le
reste de la session lorsque vous voulez le shell, par exemple pour inspecter des fichiers
ou exécuter un script à la main. Le choix n'est pas enregistré avec le projet : rouvrez-le
demain et Run revient à la réponse du détecteur. Tout ce que le
moteur instantané peut exécuter est plus rapide sans lui.

## Ce qui fonctionne, pièce par pièce

Chaque ligne est un script écrit comme un tutoriel Pi l'écrit, exécuté via
le produit réel avec la pièce câblée sur le canevas, sur un Raspberry Pi 4.
Les lignes d'affichage sont vérifiées sur le canevas lui-même : le panneau doit s'allumer,
pas seulement le script se terminer.

| Quoi | Bibliothèque utilisée par le script | Instantané | Linux |
| --- | --- | --- | --- |
| LED et bouton-poussoir | `gpiozero` | Oui | Oui |
| Servo (PWM) | `gpiozero.Servo` | Oui | Oui |
| Accéléromètre MPU6050 | `smbus2` | Oui | Oui |
| Horloge temps réel DS3231 | `smbus2` | Oui | Oui |
| Capteur de pression BMP280 | `smbus2` | Oui | Oui |
| Température et humidité SHT31 | `smbus2` | Oui | Oui |
| Pilote PWM 16 canaux PCA9685 | `smbus2` | Oui | Oui |
| ADC ADS1115 | `smbus2` | Oui | Oui |
| LCD 16x2, backpack I2C | `smbus2` ou `RPLCD.i2c` | Oui | Oui |
| LCD 16x2, parallèle (RS, E, D4 à D7) | `RPLCD.gpio` | Oui | Oui |
| OLED SSD1306 | `smbus2` | Oui | Oui |
| OLED SSD1306 | `luma.oled` | Oui | Oui |
| OLED SSD1306 | Adafruit Blinka + `adafruit_ssd1306` | Oui | Oui |
| TFT ILI9341 | `spidev` | Oui | Oui |
| Carte microSD (mode SPI) | `spidev` | Oui | Oui |
| Sonde de température DS18B20 | 1-Wire sysfs, `w1thermsensor` | Oui | **Non** |
| Potentiomètre directement sur un GPIO | | Non (voir ci-dessous) | Non |

Les lignes OLED et LCD ont aussi été exécutées sur un Raspberry Pi Zero dans le moteur
Linux, qui est un invité 32 bits avec sa propre image.

## Ce qui ne fonctionne pas

- **Entrée analogique sur un GPIO.** Un Raspberry Pi n'a **pas d'ADC**, sur du matériel
  réel non plus. Un potentiomètre, une LDR ou un capteur de pouls câblé directement à un
  GPIO ne lit jamais que haut ou bas, et la console d'exécution le dit. Placez un
  **ADS1115** (I2C) ou un **MCP3008** (SPI) entre le capteur et le Pi,
  exactement comme vous le feriez sur un banc ; les deux sont dans le catalogue, et la galerie
  a un exemple MCP3008 avec un potentiomètre.
- **1-Wire dans le moteur Linux.** Le noyau de l'invité n'a pas de support 1-Wire, donc
  un script DS18B20 n'y trouve pas de `/sys/bus/w1/devices`. Cela fonctionne dans le
  moteur instantané, où un script qui n'importe que
  `w1thermsensor` s'exécute de toute façon.
- **La caméra dans le moteur Linux.** `picamera2` fonctionne dans le moteur instantané, alimenté par votre webcam ou une mire de test ; l'invité n'a pas de caméra.
- **`pigpio`, `libgpiod` / `gpiod`, `/dev/gpiomem`.** Aucun démon et aucun périphérique de caractères GPIO
  dans l'un ou l'autre moteur. Utilisez `RPi.GPIO` ou `gpiozero`.
- **Un script copié d'un tutoriel MicroPython.** `import machine`,
  `from gpio_lcd import GpioLcd` et compagnie existent sur un Pico ou un ESP32, pas
  sur une carte qui exécute le Python complet. La console nomme l'équivalent Pi
  (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) au lieu de proposer un
  paquet à installer.
- **PyTorch, TensorFlow.** Des gigaoctets, et rien ici pour les accélérer.
  Ils sont refusés avec cette explication.

## Modules Python dans chaque moteur

Les deux moteurs embarquent la bibliothèque standard. "Préinstallé" signifie que cela fonctionne dès
la ligne `import` seule, sans `requirements.txt`, comme Raspberry Pi OS
a ses bibliothèques matérielles dans l'image.

| Module | Instantané (navigateur) | Linux (invité) |
| --- | --- | --- |
| `RPi.GPIO` | Préinstallé | Préinstallé |
| `gpiozero` | Préinstallé | Préinstallé (2.0.1) |
| `smbus2` / `smbus` | Préinstallé (la vraie bibliothèque) | Préinstallé |
| `spidev` | Préinstallé | Préinstallé |
| `serial` (pyserial) | Les chemins UART du Pi uniquement | Le vrai pyserial 3.5 sur un vrai tty |
| `w1thermsensor` | Préinstallé | Non disponible (pas de 1-Wire) |
| `luma.core`, `luma.oled`, `luma.lcd` | Préinstallé | Préinstallé |
| `RPLCD` | Préinstallé | Préinstallé |
| `ST7789` | Préinstallé | Préinstallé |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Préinstallé | Préinstallé |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Préinstallé | Préinstallé |
| `PIL` (Pillow), `numpy` | Préinstallé | Préinstallé (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Oui | Non (pas de build pour l'invité) |
| `picamera2` | Oui, via votre webcam | Non |
| `velxio_screen` | Oui | Oui |
| `requests` / `urllib` | Oui, via le proxy de sortie de Velxio avec une liste d'autorisation | Pas de réseau |
| Tout le reste | Via `requirements.txt` | Via `requirements.txt` |

Les polices DejaVu sont dans l'invité au chemin qu'utilise Raspberry Pi OS
(`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), parce que les tutoriels d'affichage
le codent en dur.

```python
from luma.core.interface.serial import i2c
from luma.core.render import canvas
from luma.oled.device import ssd1306

import time

device = ssd1306(i2c(port=1, address=0x3C))
with canvas(device) as draw:
    draw.text((10, 20), "Hello from a Pi", fill="white")

# luma clears the panel when the script ends, as it does on hardware,
# so keep the script alive for as long as the text should stay up.
while True:
    time.sleep(1)
```

### Les autres paquets tiers nécessitent un `requirements.txt`

Ajoutez un fichier `requirements.txt` à côté de votre script, un paquet par ligne ;
Velxio le résout avant l'exécution et vous indique, dans la console d'exécution, ce qu'il
a installé. Lorsqu'un script importe un paquet manquant, la console
propose la ligne à ajouter et un bouton l'écrit pour vous. Quel moteur peut prendre
un paquet dépend de la façon dont il est construit :

- Un paquet pur Python (une roue `py3-none-any`) s'exécute dans les deux moteurs.
- Un paquet avec du code compilé s'exécute dans le moteur **instantané** lorsque le
  runtime du navigateur le fournit (numpy, pillow, opencv-python, scikit-learn entre
  autres), et dans le moteur **Linux** uniquement si PyPI a une roue **musl aarch64**
  pour lui (numpy, pandas, scipy et psutil en ont). Les paquets qui ne
  publient que des roues glibc `manylinux` ne peuvent pas être installés dans l'invité.
- Sur un Raspberry Pi Zero, 1 ou 2, l'invité est 32 bits, et PyPI n'a presque pas de
  roues compilées pour lui : là, restez avec ce qui est préinstallé ou avec
  des paquets purs Python.
- Les noms que l'invité fournit déjà (`RPi.GPIO`, `smbus2`, `spidev`,
  `pyserial`, `gpiozero`) ne sont jamais téléchargés, donc un `requirements.txt` de tutoriel
  qui les liste ne fait aucun mal.

Les roues comptent contre le même quota de stockage que les bibliothèques Arduino.

## Fichiers

Un **panneau de fichiers** dans l'espace de travail Pi téléverse des scripts et des fichiers de données dans
le projet ; en mode Linux, ils sont copiés dans le répertoire personnel de l'invité
avant que `script.py` ne démarre.

## L'UNIHIKER M10

Le SBC éducatif de DFRobot (une carte Linux avec écran tactile intégré) fonctionne
sur les deux mêmes moteurs, avec ses propres modules `pinpong` et `unihiker` à
la place des shims Pi. C'est une carte payante avec ses propres trois sessions
d'essai ; trouvez-la dans le sélecteur à côté de la famille Pi.

## Illustration des cartes et brochages

L'illustration du canevas et la carte complète des broches de chaque carte, générées à partir du simulateur :

[Raspberry Pi 3 (illustration aussi pour Zero/1/2)](/docs/fr/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/fr/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/fr/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/fr/boards/reference/unihiker-m10/)
