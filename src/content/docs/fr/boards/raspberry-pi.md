---
title: Raspberry Pi (Linux)
description: Cartes Raspberry Pi, de la Zero à la Pi 5. Du Python face au circuit sur le canevas, dans le navigateur par défaut ou dans un invité Linux sur les serveurs de Velxio, avec ce qui fonctionne sur chaque partie mesurée, pièce par pièce.
sidebar:
  order: 7
  badge: PRO
---

La famille Raspberry Pi exécute des **scripts Python face au circuit sur le
canevas**. Contrairement aux cartes à microcontrôleur, il n'y a rien à
compiler : vous écrivez un script, appuyez sur **Run**, et Velxio choisit
l'un de deux moteurs pour l'exécuter. Aucun des deux moteurs n'est un bureau
Raspberry Pi OS, alors lisez cette page avant de supposer qu'un tutoriel
écrit pour du matériel réel fonctionnera tel quel. La plupart fonctionnent :
les tableaux ci-dessous ont été mesurés sur le produit réel, pièce par
pièce, les 2026-09-19 et 2026-09-20.

| Carte                         | Profil CPU          |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

N'importe qui peut placer une Pi sur le canevas et câbler un circuit autour.
Son **exécution** nécessite un forfait payant, ou l'une des **trois
sessions d'essai gratuites de 15 minutes** que chaque compte connecté
obtient pour la famille Pi (voir
[forfaits](/docs/fr/getting-started/plans/)). Un projet qui n'a rien qu'une Pi
puisse exécuter, comme un croquis Arduino `.ino` sur une carte Pi, est
signalé comme tel avant qu'une session d'essai n'y soit consacrée.

![Raspberry Pi 5 sur le canevas Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Deux moteurs

### Instantané (dans votre navigateur)

Le moteur par défaut. Votre script s'exécute sur un interpréteur Python
compilé en WebAssembly dans l'onglet, démarre en quelques secondes et n'a
besoin de rien des serveurs de Velxio. Les écritures de broches atteignent
directement le canevas, donc une LED s'allume au moment où `led.on()`
s'exécute. I2C, SPI et 1-Wire sont présents sous la forme des fichiers de
périphériques qu'a une Pi (`/dev/i2c-1`, `/dev/spidev0.0`, l'arborescence
`/sys/bus/w1/devices`), répondus par les pièces câblées sur le canevas, donc
les vrais `smbus2`, `w1thermsensor` et Adafruit Blinka s'exécutent sans
modification.

C'est un simple interpréteur, pas un système d'exploitation : pas de shell,
pas de `subprocess`, pas de sockets brutes. Un script qui en demande un est
envoyé au moteur Linux à la place ; la **puce de moteur** dans la barre
d'outils indique quel moteur va s'exécuter et, quand c'est Linux, le fichier
et la ligne qui l'ont demandé.

### Linux (sur les serveurs de Velxio)

Un véritable invité Linux démarré dans QEMU (`-M virt`, avec le profil CPU
de votre carte) auquel vous accédez via la console série dans l'espace de
travail. Soyez précis sur ce que c'est :

- **Alpine Linux**, pas Raspberry Pi OS. `python3` et `pip` sont installés ;
  `apt`, `raspi-config`, le bureau et les outils de firmware Pi ne sont pas
  là.
- **Pas de réseau** depuis l'intérieur de l'invité, volontairement. Rien
  là-dedans ne peut atteindre PyPI ; les paquets qu'un projet déclare dans
  `requirements.txt` sont importables dès que l'invité démarre, et `pip`
  lui-même fonctionne hors ligne contre un wheelhouse local (ci-dessous).
- **Les bus du connecteur sont de vrais fichiers de périphériques.**
  `/dev/i2c-0`, `/dev/i2c-1`, `/dev/spidev0.0` et `/dev/spidev0.1`
  répondent aux mêmes appels système que sur une Pi, donc une bibliothèque
  qui les ouvre elle-même (Adafruit Blinka), un programme C, ou votre propre
  code `ioctl` parle aux pièces sur le canevas. Une adresse que personne ne
  détient échoue avec `OSError: [Errno 121] Remote I/O error`, comme sur le
  matériel.
- **`smbus2` et `spidev` sont les paquets amont**, pas des substituts
  Velxio : `import smbus2` vous donne le vrai smbus2, `import spidev` un
  py-spidev compilé, et les deux passent par ces nœuds de périphérique.
  Donc les règles du noyau s'appliquent comme sur une carte. Un transfert
  par bloc SMBus de plus de 32 octets échoue avec une erreur au lieu d'être
  discrètement raccourci, et l'ouverture d'un bus qui n'existe pas,
  `SMBus(2)` par exemple, lève une exception à l'appel d'ouverture plutôt
  qu'à la première lecture.
- **L'UART du connecteur est un vrai port série.** `/dev/serial0` (aussi
  `/dev/ttyAMA0` et `/dev/ttyS0`) est un véritable tty piloté par le
  pyserial non modifié : `serial.tools.list_ports`, `select()` sur le port
  et `cat /dev/serial0` fonctionnent tous, et les octets vont vers ce qui
  est câblé sur GPIO14 et GPIO15 sur le canevas.
- **1-Wire est là sous la forme de l'arborescence sysfs qu'a une Pi.** Un
  DS18B20 sur GPIO4 apparaît sous `/sys/bus/w1/devices/28-*/` avec
  `w1_slave` et `temperature`, donc `cat`, les lecteurs de style
  `w1thermsensor` et votre propre code fonctionnent
  (`dtoverlay=w1-gpio,gpiopin=N` dans un `config.txt` du projet déplace la
  broche).
- **`libcamera-jpeg`, `rpicam-jpeg`, `rpicam-still` et `libcamera-still`**
  prennent une photo depuis la pièce caméra sur le canevas, comme un script
  les appelle avec `subprocess`. L'image est la **mire de test** de la pièce
  sauf si vous autorisez l'invité à utiliser votre webcam, ce que Velxio
  demande la première fois qu'un programme prend une photo (voir ci-dessous).
- **GPIO a un vrai périphérique de caractères.** `/dev/gpiochip0` est là,
  et l'interface obsolète `/sys/class/gpio` aussi, en plus de `RPi.GPIO` et
  `gpiozero`. Il n'y a toujours **pas** de `/dev/gpiomem`, donc `pigpio`,
  qui veut les registres de périphériques, n'a rien à qui parler (voir
  ci-dessous).
- Le démarrage prend environ 20 à 30 secondes, plus longtemps quand le
  serveur est occupé ; une superposition « Booting » le suit. Une session
  d'invité se termine après **2 heures** au plus tard.
- L'invité exécute **`script.py`** de votre projet à son démarrage. Nommez
  votre fichier principal ainsi en mode Linux (le moteur instantané exécute
  le premier `.py` qu'il trouve).

Le bouton **Linux terminal** dans l'espace de travail fixe ce moteur pour le
reste de la session quand vous voulez le shell, par exemple pour inspecter
des fichiers ou exécuter un script à la main. Le choix n'est pas enregistré
avec le projet : rouvrez-le demain et Run revient à la réponse du détecteur.
Tout ce que le moteur instantané peut exécuter est plus rapide sans lui.

## GPIO dans le moteur Linux : gpiochip0 et libgpiod

L'invité enregistre un périphérique de caractères GPIO avec l'identité
propre de la Pi, donc la pile moderne qu'enseignent la documentation de
Bookworm et de la Pi 5 fonctionne ici. `gpiodetect` répond :

```text
gpiochip0 [pinctrl-bcm2835] (54 lines)
```

Les outils sont installés (`gpiodetect`, `gpioinfo`, `gpioget`, `gpioset`,
`gpiomon`), et une ligne qu'ils pilotent atteint la pièce câblée à cette
broche sur le canevas.

L'image embarque **libgpiod version 1**, donc écrivez les commandes à la
manière de la version 1 : la puce est un argument positionnel, pas une
option `--chip`.

```bash
gpioset gpiochip0 17=1     # drive GPIO17 high
gpioget gpiochip0 5        # read GPIO5, prints 0 or 1
gpiomon gpiochip0 5        # print edges on GPIO5 as they arrive
```

L'orthographe de la version 2 (`gpioset --chip gpiochip0 17=1`) n'est pas
comprise. Si un tutoriel l'utilise, supprimez l'option et passez la puce
seule.

Les liaisons Python sont également préinstallées, là encore avec l'API de
la version 1 :

```python
import gpiod

chip = gpiod.Chip("gpiochip0")
line = chip.get_line(17)
line.request(consumer="velxio", type=gpiod.LINE_REQ_DIR_OUT)
line.set_value(1)
```

`RPi.GPIO` et `gpiozero` ne sont pas touchés par cela et restent la façon la
plus courte d'écrire un script. L'interface sysfs obsolète sous
`/sys/class/gpio` fonctionne aussi, donc un vieux tutoriel qui exporte une
broche en écrivant dans des fichiers fait ce qu'il dit. Ce qui manque
toujours, c'est `/dev/gpiomem`, et avec lui `pigpio` : cette bibliothèque
mappe directement les registres de périphériques, et il n'y a rien ici à
mapper.

Le moteur instantané n'a pas de périphérique de caractères : dans votre
navigateur, GPIO c'est `RPi.GPIO`, `gpiozero` ou Blinka.

## La caméra dans le moteur Linux

Par défaut, les outils de caméra de l'invité renvoient la **mire de test**
de la pièce caméra, et un script qui prend une photo obtient une image sans
que rien ne soit demandé à personne.

La première fois qu'un programme demande une photo dans le moteur Linux avec
la pièce caméra en mode webcam, Velxio demande s'il peut utiliser votre
vraie webcam pour cela. Il doit le demander à cause de l'endroit où le code
s'exécute : dans le moteur instantané, les images ne quittent jamais votre
machine, tandis que l'invité Linux s'exécute sur les serveurs de Velxio,
donc l'autoriser signifie que les images y sont envoyées.

- Dites **non** et les outils continuent de renvoyer la mire de test. Rien
  ne casse et aucun script n'a besoin d'être modifié.
- Dites **oui** et les photos sont votre vraie webcam, **pour cette session
  de page uniquement**. La réponse n'est pas enregistrée dans le projet et
  n'est pas mémorisée après un rechargement, donc la prochaine fois que vous
  ouvrez la page, on vous redemande.

`picamera2` est une autre affaire : c'est toujours un module du moteur
instantané. Dans l'invité Linux, prenez des photos avec les outils en ligne
de commande.

## Ce qui fonctionne, pièce par pièce

Chaque ligne est un script écrit comme l'écrit un tutoriel Pi, exécuté sur
le produit réel avec la pièce câblée sur le canevas, sur une Raspberry Pi 4.
Les lignes d'affichage sont vérifiées sur le canevas lui-même : le panneau
doit s'allumer, pas seulement le script se terminer.

| Quoi | Bibliothèque utilisée par le script | Instantané | Linux |
| --- | --- | --- | --- |
| LED et bouton poussoir | `gpiozero` | Oui | Oui |
| LED depuis le shell | `gpioset` (libgpiod 1) | Non | Oui |
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

Les lignes OLED et LCD ont aussi été exécutées sur une Raspberry Pi Zero
dans le moteur Linux, qui est un invité 32 bits avec sa propre image.

## Ce qui ne fonctionne pas

- **Entrée analogique sur un GPIO.** Une Raspberry Pi n'a **pas de CAN**,
  sur le matériel réel non plus. Un potentiomètre, une LDR ou un capteur de
  pouls câblé directement à un GPIO ne lit jamais que haut ou bas, et la
  console d'exécution le dit. Placez un **ADS1115** (I2C) ou un **MCP3008**
  (SPI) entre le capteur et la Pi, exactement comme vous le feriez sur un
  banc ; les deux sont dans le catalogue, et la galerie a un exemple MCP3008
  avec un potentiomètre.
- **`picamera2` dans le moteur Linux.** Il utilise votre webcam dans le
  moteur instantané, parce que le script s'exécute dans votre navigateur.
  Dans l'invité, les photos viennent de `rpicam-jpeg` et ses semblables à la
  place, sur la mire de test ou sur votre webcam une fois que vous l'avez
  autorisé (ci-dessus).
- **Un pilote d'e-paper qui envoie son image au mauvais endroit.** Sur un
  panneau UC8179 (le 7,5"), la commande `0x10` est l'image précédente et
  `0x13` est celle que le verre affiche. Un pilote qui n'écrit que `0x10`
  n'obtient ici qu'un rafraîchissement blanc, exactement comme sur le
  panneau réel, et le moniteur série (le terminal Linux, dans ce moteur) en
  dit la raison. La broche BUSY suit aussi le contrôleur : LOW pendant qu'un
  panneau UltraChip travaille, HIGH sur un SSD168x.
- **`pigpio` et `/dev/gpiomem`.** `pigpio` atteint les broches en mappant
  les registres de périphériques, et aucun des deux moteurs ne lui donne ce
  mappage. Utilisez `RPi.GPIO`, `gpiozero` ou, dans le moteur Linux,
  `libgpiod` (ci-dessus).
- **`libgpiod` / `gpiod` dans le moteur instantané.** Le périphérique de
  caractères est une affaire de moteur Linux ; dans le navigateur, il n'y a
  pas de `/dev/gpiochip0` à ouvrir.
- **Un script copié d'un tutoriel MicroPython.** `import machine`,
  `from gpio_lcd import GpioLcd` et compagnie existent sur un Pico ou un
  ESP32, pas sur une carte qui exécute le Python complet. La console nomme
  l'équivalent Pi (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) au
  lieu de proposer un paquet à installer.
- **PyTorch, TensorFlow.** Des gigaoctets, et rien ici pour les accélérer.
  Ils sont refusés avec cette explication.

## Modules Python dans chaque moteur

Les deux moteurs embarquent la bibliothèque standard. « Préinstallé »
signifie que cela fonctionne dès la ligne `import` seule, sans
`requirements.txt`, comme Raspberry Pi OS a ses bibliothèques matérielles
dans l'image.

| Module | Instantané (navigateur) | Linux (invité) |
| --- | --- | --- |
| `RPi.GPIO` | Préinstallé | Préinstallé |
| `gpiozero` | Préinstallé | Préinstallé (2.0.1) |
| `gpiod` (libgpiod 1) | Pas de périphérique de caractères dans le navigateur | Préinstallé, avec les outils `gpio*` |
| `smbus2` / `smbus` | Préinstallé (la vraie bibliothèque) | Préinstallé (la vraie bibliothèque) |
| `spidev` | Préinstallé | Préinstallé (un py-spidev compilé) |
| `serial` (pyserial) | Les chemins UART de la Pi uniquement | Le vrai pyserial 3.5 sur un vrai tty |
| `w1thermsensor` | Préinstallé | Via `requirements.txt` (l'arborescence 1-Wire est là) |
| `luma.core`, `luma.oled`, `luma.lcd` | Préinstallé | Préinstallé |
| `RPLCD` | Préinstallé | Préinstallé |
| `ST7789` | Préinstallé | Préinstallé |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Préinstallé | Préinstallé |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Préinstallé | Préinstallé |
| `PIL` (Pillow), `numpy` | Préinstallé | Préinstallé (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Oui | Non (pas de build pour l'invité) |
| `picamera2` | Oui, sur votre webcam | Non (utilisez `rpicam-jpeg` / `libcamera-jpeg`) |
| `velxio_screen` | Oui | Oui |
| `requests` / `urllib` | Oui, via le proxy de sortie de Velxio avec une liste d'autorisation | Pas de réseau |
| Tout le reste | Via `requirements.txt` | Via `requirements.txt` |

Les polices DejaVu sont dans l'invité au chemin qu'utilise Raspberry Pi OS
(`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), parce que les
tutoriels d'affichage le codent en dur.

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
ligne ; Velxio le résout avant l'exécution et vous dit, dans la console
d'exécution, ce qu'il a installé. Quand un script importe un paquet
manquant, la console propose la ligne à ajouter et un bouton l'écrit pour
vous. Le moteur qui peut prendre un paquet dépend de la façon dont il est
construit :

- Un paquet pur Python (une wheel `py3-none-any`) s'exécute dans les deux
  moteurs.
- Un paquet avec du code compilé s'exécute dans le moteur **instantané**
  quand le runtime du navigateur l'embarque (numpy, pillow, opencv-python,
  scikit-learn entre autres), et dans le moteur **Linux** seulement si PyPI
  a une wheel **musl aarch64** pour lui (numpy, pandas, scipy et psutil en
  ont). Les paquets qui ne publient que des wheels glibc `manylinux` ne
  peuvent pas être installés dans l'invité.
- Sur une Raspberry Pi Zero, 1 ou 2, l'invité est 32 bits, et PyPI n'a
  presque aucune wheel compilée pour lui : là, restez avec ce qui est
  préinstallé ou avec des paquets purs Python.
- Les noms que l'invité fournit déjà (`RPi.GPIO`, `smbus2`, `spidev`,
  `pyserial`, `gpiozero`, `gpiod`) ne sont jamais téléchargés, donc un
  `requirements.txt` de tutoriel qui les liste ne fait aucun mal.

Les wheels comptent contre le même quota de stockage que les bibliothèques
Arduino.

### Exécuter pip à la main dans l'invité Linux

Vous n'avez jamais à le faire. Ce que `requirements.txt` déclare est
importable dès que l'invité démarre, sans aucune étape d'installation. La
vraie commande fonctionne aussi, pour quelqu'un qui suit un tutoriel qui
l'épelle :

```bash
python3 -m venv --system-site-packages ~/.venv
~/.venv/bin/pip install -r requirements.txt
```

L'invité n'a pas de réseau, donc `pip` résout contre un wheelhouse local
qui est livré avec les paquets du projet ; il installe ce que le projet
déclare, et ne peut pas atteindre PyPI pour autre chose.

Sachez ce que cela coûte avant de commencer, et ne lisez pas le silence
comme un blocage : sur le CPU émulé, créer un virtualenv **avec** pip prend
environ quatre minutes (environ six secondes sans lui), et l'installation
elle-même environ une demi-minute. L'attente ne vous apporte rien que vous
n'aviez pas déjà, puisque les paquets que vous avez déclarés sont déjà
importés au moment où vous obtenez une invite. C'est là pour les fois où
vous voulez le vrai flux de travail.

Le Python système est marqué comme géré en externe (PEP 668), exactement
comme sur Raspberry Pi OS Bookworm, donc un `pip install` nu en dehors d'un
virtualenv refuse avec le même message qu'il donne sur la carte.

## Fichiers

Un **panneau de fichiers** dans l'espace de travail Pi téléverse des
scripts et des fichiers de données dans le projet ; en mode Linux, ils sont
copiés dans le répertoire personnel de l'invité avant que `script.py` ne
démarre.

## L'UNIHIKER M10

Le SBC éducatif de DFRobot (une carte Linux avec un écran tactile intégré)
fonctionne sur les deux mêmes moteurs, avec ses propres modules `pinpong`
et `unihiker` à la place des bibliothèques Pi. C'est une carte payante avec
ses propres trois sessions d'essai ; trouvez-la dans le sélecteur à côté de
la famille Pi.

## Illustration des cartes et brochages

L'illustration sur le canevas et la carte complète des broches de chaque
carte, générées depuis le simulateur :

[Raspberry Pi 3 (illustration aussi pour Zero/1/2)](/docs/fr/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/fr/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/fr/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/fr/boards/reference/unihiker-m10/)
