---
title: Raspberry Pi (Linux)
description: Cartes Raspberry Pi, de la Zero à la Pi 5. Python contre le circuit sur le canevas, dans le navigateur par défaut ou dans un invité Linux sur les serveurs de Velxio, avec ce qui fonctionne sur chaque partie mesurée partie par partie.
sidebar:
  order: 7
  badge: PRO
---

La famille Raspberry Pi exécute des **scripts Python contre le circuit sur le
canevas**. Contrairement aux cartes microcontrôleurs, il n'y a rien à compiler :
vous écrivez un script, appuyez sur **Run**, et Velxio choisit l'un des deux
moteurs pour l'exécuter. Aucun des deux moteurs n'est un bureau Raspberry Pi OS,
alors lisez cette page avant de supposer qu'un tutoriel écrit pour du matériel
réel fonctionnera tel quel. La plupart fonctionnent : les tableaux ci-dessous
ont été mesurés contre le produit en ligne, partie par partie, le 2026-09-19.

| Carte                         | Profil CPU          |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

N'importe qui peut placer une Pi sur le canevas et câbler un circuit autour.
Son **exécution** nécessite un forfait payant, ou l'une des **trois sessions
d'essai gratuites de 15 minutes** que chaque compte connecté reçoit pour la
famille Pi (voir [forfaits](/docs/fr/getting-started/plans/)). Un projet qui n'a
rien qu'une Pi puisse exécuter, comme un croquis Arduino `.ino` sur une carte
Pi, est signalé comme tel avant qu'une session d'essai n'y soit consacrée.

![Raspberry Pi 5 sur le canevas Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Deux moteurs

### Instantané (dans votre navigateur)

Le moteur par défaut. Votre script s'exécute sur un interpréteur Python compilé
en WebAssembly dans l'onglet, démarre en quelques secondes et ne nécessite rien
des serveurs de Velxio. Les écritures de broches atteignent directement le
canevas, donc une LED s'allume au moment où `led.on()` s'exécute. I2C, SPI et
1-Wire sont présents sous la forme des fichiers de périphériques qu'une Pi
possède (`/dev/i2c-1`, `/dev/spidev0.0`, l'arborescence
`/sys/bus/w1/devices`), répondus par les composants câblés sur le canevas, donc
les vrais `smbus2`, `w1thermsensor` et Adafruit Blinka s'exécutent sans
modification.

C'est un simple interpréteur, pas un système d'exploitation : il n'y a pas de
shell, pas de `subprocess`, pas de sockets brutes. Un script qui en demande un
est envoyé au moteur Linux à la place ; la **puce de moteur** dans la barre
d'outils indique quel moteur s'exécutera et, lorsqu'il s'agit de Linux, le
fichier et la ligne qui l'ont demandé.

### Linux (sur les serveurs de Velxio)

Un véritable invité Linux démarré dans QEMU (`-M virt`, avec le profil CPU de
votre carte) auquel vous accédez via la console série dans l'espace de travail.
Soyez précis sur ce qu'il est :

- **Alpine Linux**, pas Raspberry Pi OS. `python3` et `pip` sont installés ;
  `apt`, `raspi-config`, le bureau et les outils de firmware Pi ne sont pas
  là.
- **Pas de réseau** depuis l'intérieur de l'invité, volontairement. `pip
  install` ne peut pas atteindre PyPI ; les paquets arrivent via
  `requirements.txt` (ci-dessous).
- **Les bus du connecteur sont de vrais fichiers de périphériques.**
  `/dev/i2c-1`, `/dev/spidev0.0` et `/dev/spidev0.1` répondent aux mêmes
  appels système que sur une Pi, donc une bibliothèque qui les ouvre
  elle-même (Adafruit Blinka), un programme C, ou votre propre code `ioctl`
  communique avec les composants sur le canevas. Une adresse que personne ne
  détient échoue avec `OSError: [Errno 121] Remote I/O error`, comme sur
  matériel.
- **L'UART du connecteur est un vrai port série.** `/dev/serial0` (aussi
  `/dev/ttyAMA0` et `/dev/ttyS0`) est un véritable tty piloté par le pyserial
  non modifié : `serial.tools.list_ports`, `select()` sur le port et `cat
  /dev/serial0` fonctionnent tous, et les octets vont vers ce qui est câblé
  sur GPIO14 et GPIO15 sur le canevas.
- **1-Wire est présent sous la forme de l'arborescence sysfs qu'une Pi
  possède.** Un DS18B20 sur GPIO4 apparaît sous `/sys/bus/w1/devices/28-*/`
  avec `w1_slave` et `temperature`, donc `cat`, les lecteurs de style
  `w1thermsensor` et votre propre code fonctionnent
  (`dtoverlay=w1-gpio,gpiopin=N` dans un `config.txt` du projet déplace la
  broche).
- **`libcamera-jpeg`, `rpicam-jpeg`, `rpicam-still`** prennent une photo
  depuis le composant caméra sur le canevas, comme un script les appelle avec
  `subprocess`. Dans ce moteur, l'image est la **mire de test** du composant :
  l'invité s'exécute sur les serveurs de Velxio, et les pixels de votre webcam
  ne quittent jamais votre navigateur.
- Il n'y a **pas** de `/dev/gpiomem`, `/dev/gpiochip0` ou `/sys/class/gpio`.
  Le GPIO passe par `RPi.GPIO` et `gpiozero`, qui sont présents ; `libgpiod`,
  `gpioinfo` et `pigpio` n'ont rien avec quoi communiquer.
- Le démarrage prend environ 20 à 30 secondes, plus longtemps lorsque le
  serveur est occupé ; une superposition « Booting » en suit la progression.
  Une session invitée se termine après **2 heures** au plus tard.
- L'invité exécute **`script.py`** depuis votre projet au démarrage. Nommez
  votre fichier principal ainsi en mode Linux (le moteur instantané exécute le
  premier `.py` qu'il trouve).

Le bouton **Linux terminal** dans l'espace de travail fixe ce moteur pour le
reste de la session lorsque vous voulez le shell, par exemple pour inspecter
des fichiers ou exécuter un script à la main. Le choix n'est pas enregistré
avec le projet : rouvrez-le demain et Run revient à la réponse du détecteur.
Tout ce que le moteur instantané peut exécuter est plus rapide sans lui.

## Ce qui fonctionne, partie par partie

Chaque ligne est un script écrit comme un tutoriel Pi l'écrit, exécuté via le
produit en ligne avec le composant câblé sur le canevas, sur une Raspberry
Pi 4. Les lignes d'affichage sont vérifiées sur le canevas lui-même : le
panneau doit s'allumer, pas seulement le script se terminer.

| Quoi | Bibliothèque utilisée par le script | Instantané | Linux |
| --- | --- | --- | --- |
| LED et bouton poussoir | `gpiozero` | Oui | Oui |
| Servo (PWM) | `gpiozero.Servo` | Oui | Oui |
| Accéléromètre MPU6050 | `smbus2` | Oui | Oui |
| Horloge temps réel DS3231 | `smbus2` | Oui | Oui |
| Capteur de pression BMP280 | `smbus2` | Oui | Oui |
| Température et humidité SHT31 | `smbus2` | Oui | Oui |
| Pilote PWM 16 canaux PCA9685 | `smbus2` | Oui | Oui |
| CAN ADS1115 | `smbus2` | Oui | Oui |
| LCD 16x2, backpack I2C | `smbus2` ou `RPLCD.i2c` | Oui | Oui |
| LCD 16x2, parallèle (RS, E, D4 à D7) | `RPLCD.gpio` | Oui | Oui |
| OLED SSD1306 | `smbus2` | Oui | Oui |
| OLED SSD1306 | `luma.oled` | Oui | Oui |
| OLED SSD1306 | Adafruit Blinka + `adafruit_ssd1306` | Oui | Oui |
| TFT ILI9341 | `spidev` | Oui | Oui |
| Carte microSD (mode SPI) | `spidev` | Oui | Oui |
| Sonde de température DS18B20 | 1-Wire sysfs, `w1thermsensor` | Oui | Oui |
| Module GPS sur l'UART du connecteur | `pyserial` sur `/dev/serial0` | Oui | Oui |
| E-paper 7,5" (UC8179) | `spidev` + `RPi.GPIO`, pilote de style Waveshare | Oui | Oui |
| Potentiomètre directement sur un GPIO | | Non (voir ci-dessous) | Non |

Les lignes OLED et LCD ont aussi été exécutées sur une Raspberry Pi Zero dans
le moteur Linux, qui est un invité 32 bits avec sa propre image.

## Ce qui ne fonctionne pas

- **Entrée analogique sur un GPIO.** Une Raspberry Pi n'a **pas de CAN**, sur
  matériel réel non plus. Un potentiomètre, une LDR ou un capteur de pouls
  câblé directement à un GPIO ne lit jamais que haut ou bas, et la console
  d'exécution le dit. Placez un **ADS1115** (I2C) ou un **MCP3008** (SPI)
  entre le capteur et la Pi, exactement comme vous le feriez sur un établi ;
  les deux sont dans le catalogue, et la galerie a un exemple MCP3008 avec un
  potentiomètre.
- **Votre webcam dans le moteur Linux.** `picamera2` dans le moteur instantané
  peut utiliser votre webcam, car le script s'exécute dans votre navigateur.
  L'invité s'exécute sur nos serveurs, donc ses outils de caméra obtiennent la
  mire de test à la place.
- **Un pilote d'e-paper qui envoie son image au mauvais endroit.** Sur un
  panneau UC8179 (le 7,5"), la commande `0x10` est l'image précédente et
  `0x13` est celle que le verre affiche. Un pilote qui n'écrit que `0x10`
  n'obtient qu'un rafraîchissement vide ici, exactement comme sur le panneau
  réel, et le moniteur série (le terminal Linux, dans ce moteur) en explique
  la raison. La broche BUSY suit aussi le contrôleur : LOW pendant qu'un
  panneau UltraChip travaille, HIGH sur un SSD168x.
- **`pigpio`, `libgpiod` / `gpiod`, `/dev/gpiomem`.** Aucun démon et aucun
  périphérique caractère GPIO dans l'un ou l'autre moteur. Utilisez `RPi.GPIO`
  ou `gpiozero`.
- **Un script copié d'un tutoriel MicroPython.** `import machine`, `from
  gpio_lcd import GpioLcd` et compagnie existent sur un Pico ou un ESP32, pas
  sur une carte qui exécute le Python complet. La console nomme l'équivalent
  Pi (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) au lieu de proposer
  un paquet à installer.
- **PyTorch, TensorFlow.** Des gigaoctets, et rien ici pour les accélérer.
  Ils sont refusés avec cette explication.

## Modules Python dans chaque moteur

Les deux moteurs embarquent la bibliothèque standard. « Préinstallé »
signifie que cela fonctionne dès la ligne `import`, sans `requirements.txt`,
comme Raspberry Pi OS a ses bibliothèques matérielles dans l'image.

| Module | Instantané (navigateur) | Linux (invité) |
| --- | --- | --- |
| `RPi.GPIO` | Préinstallé | Préinstallé |
| `gpiozero` | Préinstallé | Préinstallé (2.0.1) |
| `smbus2` / `smbus` | Préinstallé (la vraie bibliothèque) | Préinstallé |
| `spidev` | Préinstallé | Préinstallé |
| `serial` (pyserial) | Uniquement les chemins UART de la Pi | Le vrai pyserial 3.5 sur un vrai tty |
| `w1thermsensor` | Préinstallé | Via `requirements.txt` (l'arborescence 1-Wire est présente) |
| `luma.core`, `luma.oled`, `luma.lcd` | Préinstallé | Préinstallé |
| `RPLCD` | Préinstallé | Préinstallé |
| `ST7789` | Préinstallé | Préinstallé |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Préinstallé | Préinstallé |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Préinstallé | Préinstallé |
| `PIL` (Pillow), `numpy` | Préinstallé | Préinstallé (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Oui | Non (pas de build pour l'invité) |
| `picamera2` | Oui, via votre webcam | Non (utilisez `rpicam-jpeg` / `libcamera-jpeg`) |
| `velxio_screen` | Oui | Oui |
| `requests` / `urllib` | Oui, via le proxy de sortie de Velxio avec une liste d'autorisation | Pas de réseau |
| Tout le reste | Via `requirements.txt` | Via `requirements.txt` |

Les polices DejaVu sont dans l'invité au chemin qu'utilise Raspberry Pi OS
(`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), car les tutoriels
d'affichage le codent en dur.

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

Ajoutez un fichier `requirements.txt` à côté de votre script, un paquet par
ligne ; Velxio le résout avant l'exécution et vous indique, dans la console
d'exécution, ce qu'il a installé. Lorsqu'un script importe un paquet manquant,
la console propose la ligne à ajouter et un bouton l'écrit pour vous. Quel
moteur peut accepter un paquet dépend de la façon dont il est construit :

- Un paquet pur Python (une roue `py3-none-any`) s'exécute dans les deux
  moteurs.
- Un paquet avec du code compilé s'exécute dans le moteur **instantané**
  lorsque l'environnement d'exécution du navigateur le fournit (numpy, pillow,
  opencv-python, scikit-learn entre autres), et dans le moteur **Linux**
  uniquement si PyPI dispose d'une roue **musl aarch64** pour lui (numpy,
  pandas, scipy et psutil en ont). Les paquets qui ne publient que des roues
  glibc `manylinux` ne peuvent pas être installés dans l'invité.
- Sur une Raspberry Pi Zero, 1 ou 2, l'invité est 32 bits, et PyPI n'a
  presque aucune roue compilée pour lui : là, restez avec ce qui est
  préinstallé ou avec des paquets purs Python.
- Les noms que l'invité fournit déjà (`RPi.GPIO`, `smbus2`, `spidev`,
  `pyserial`, `gpiozero`) ne sont jamais téléchargés, donc un
  `requirements.txt` de tutoriel qui les liste ne fait aucun mal.

Les roues comptent contre le même quota de stockage que les bibliothèques
Arduino.

## Fichiers

Un **panneau de fichiers** dans l'espace de travail Pi téléverse des scripts
et des fichiers de données dans le projet ; en mode Linux, ils sont copiés
dans le répertoire personnel de l'invité avant que `script.py` ne démarre.

## L'UNIHIKER M10

Le SBC éducatif de DFRobot (une carte Linux avec écran tactile intégré)
s'exécute sur les deux mêmes moteurs, avec ses propres modules `pinpong` et
`unihiker` à la place des shims Pi. C'est une carte payante avec ses propres
trois sessions d'essai ; trouvez-la dans le sélecteur à côté de la famille Pi.

## Illustration des cartes et brochages

L'illustration sur le canevas et la carte complète des broches de chaque
carte, générées depuis le simulateur :

[Raspberry Pi 3 (illustration aussi pour Zero/1/2)](/docs/fr/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/fr/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/fr/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/fr/boards/reference/unihiker-m10/)
