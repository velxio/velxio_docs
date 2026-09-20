---
title: Raspberry Pi (Linux)
description: "Raspberry-Pi-Boards, vom Zero bis zum Pi 5. Python gegen die Schaltung auf der Arbeitsfläche, standardmäßig im Browser oder in einem Linux-Gast auf Velxios Servern, mit dem, was auf jedem Teil funktioniert, Teil für Teil gemessen."
sidebar:
  order: 7
  badge: PRO
---

Die Raspberry-Pi-Familie führt **Python-Skripte gegen die Schaltung auf der
Arbeitsfläche** aus. Anders als bei den Mikrocontroller-Boards gibt es
nichts zu kompilieren: Du schreibst ein Skript, drückst **Run**, und Velxio
wählt eine von zwei Engines, um es auszuführen. Keine der beiden Engines
ist ein Raspberry Pi OS Desktop, lies also diese Seite, bevor du annimmst,
dass ein für echte Hardware geschriebenes Tutorial unverändert
funktioniert. Die meisten tun es: Die Tabellen unten wurden gegen das
Live-Produkt gemessen, Teil für Teil, am 2026-09-19 und 2026-09-20.

| Board                         | CPU-Profil          |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7-Klasse |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

Jeder kann einen Pi auf die Arbeitsfläche setzen und eine Schaltung
darum herum verdrahten. **Ausführen** erfordert einen kostenpflichtigen
Plan oder eine der **drei kostenlosen Testsitzungen von 15 Minuten**, die
jedes angemeldete Konto für die Pi-Familie erhält (siehe
[Pläne](/docs/de/getting-started/plans/)). Ein Projekt, das nichts enthält,
was ein Pi ausführen kann, wie etwa ein Arduino-`.ino`-Sketch auf einem
Pi-Board, wird darauf hingewiesen, bevor eine Testsitzung dafür
verbraucht wird.

![Raspberry Pi 5 auf der Velxio-Arbeitsfläche](../../../../assets/docs/boards/raspberry-pi-5.png)

## Zwei Engines

### Instant (in deinem Browser)

Der Standard. Dein Skript läuft auf einem Python-Interpreter, der zu
WebAssembly kompiliert wurde, innerhalb des Tabs, startet in wenigen
Sekunden und benötigt nichts von Velxios Servern. Pin-Schreibvorgänge
erreichen die Arbeitsfläche direkt, sodass eine LED in dem Moment
aufleuchtet, in dem `led.on()` läuft. I2C, SPI und 1-Wire sind als die
Gerätedateien vorhanden, die ein Pi hat (`/dev/i2c-1`, `/dev/spidev0.0`,
der `/sys/bus/w1/devices`-Baum), beantwortet von den auf der Arbeitsfläche
verdrahteten Teilen, sodass die echten `smbus2`, `w1thermsensor` und
Adafruit Blinka unverändert laufen.

Es ist ein reiner Interpreter, kein Betriebssystem: Es gibt keine Shell,
kein `subprocess`, keine Raw-Sockets. Ein Skript, das eines davon
verlangt, wird stattdessen an die Linux-Engine geschickt; der
**Engine-Chip** in der Symbolleiste zeigt an, welche Engine ausgeführt
wird, und wenn es Linux ist, die Datei und Zeile, die es verlangt hat.

### Linux (auf Velxios Servern)

Ein echter Linux-Gast, gebootet in QEMU (`-M virt`, mit dem CPU-Profil
deines Boards), den du über die serielle Konsole im Arbeitsbereich
erreichst. Sei präzise, was es ist:

- **Alpine Linux**, nicht Raspberry Pi OS. `python3` und `pip` sind
  installiert; `apt`, `raspi-config`, der Desktop und die
  Pi-Firmware-Werkzeuge sind nicht vorhanden.
- **Kein Netzwerk** von innerhalb des Gasts, absichtlich. Nichts darin
  kann PyPI erreichen; die Pakete, die ein Projekt in `requirements.txt`
  deklariert, sind importierbar, sobald der Gast bootet, und `pip` selbst
  funktioniert offline gegen ein lokales Wheelhouse (unten).
- **Die Header-Busse sind echte Gerätedateien.** `/dev/i2c-0`,
  `/dev/i2c-1`, `/dev/spidev0.0` und `/dev/spidev0.1` beantworten
  dieselben Systemaufrufe wie auf einem Pi, sodass eine Bibliothek, die
  sie selbst öffnet (Adafruit Blinka), ein C-Programm oder dein eigener
  `ioctl`-Code mit den Teilen auf der Arbeitsfläche spricht. Eine Adresse,
  die niemand hält, schlägt mit `OSError: [Errno 121] Remote I/O error`
  fehl, wie auf Hardware.
- **`smbus2` und `spidev` sind die Upstream-Pakete**, keine
  Velxio-Ersatzlösungen: `import smbus2` gibt dir das echte smbus2,
  `import spidev` ein kompiliertes py-spidev, und beide gehen durch diese
  Geräteknoten. Also gelten die Kernel-Regeln wie auf einem Board. Ein
  SMBus-Blocktransfer länger als 32 Bytes schlägt mit einem Fehler fehl,
  statt stillschweigend gekürzt zu werden, und das Öffnen eines Busses,
  den es nicht gibt, `SMBus(2)` zum Beispiel, wirft beim Öffnen-Aufruf
  statt beim ersten Lesen.
- **Die Header-UART ist ein echter serieller Port.** `/dev/serial0`
  (auch `/dev/ttyAMA0` und `/dev/ttyS0`) ist ein echtes tty, angetrieben
  vom unveränderten pyserial: `serial.tools.list_ports`, `select()` auf
  dem Port und `cat /dev/serial0` funktionieren alle, und die Bytes gehen
  an das, was an GPIO14 und GPIO15 auf der Arbeitsfläche verdrahtet ist.
- **1-Wire ist als der sysfs-Baum vorhanden, den ein Pi hat.** Ein
  DS18B20 an GPIO4 erscheint unter `/sys/bus/w1/devices/28-*/` mit
  `w1_slave` und `temperature`, sodass `cat`, `w1thermsensor`-artige
  Leser und dein eigener Code funktionieren (`dtoverlay=w1-gpio,gpiopin=N`
  in einer `config.txt` des Projekts verschiebt den Pin).
- **`libcamera-jpeg`, `rpicam-jpeg`, `rpicam-still` und
  `libcamera-still`** machen ein Standbild vom Kamera-Teil auf der
  Arbeitsfläche, so wie ein Skript sie mit `subprocess` aufruft. Das Bild
  ist das **Testmuster** des Teils, es sei denn, du erlaubst dem Gast,
  deine Webcam zu verwenden, wonach Velxio beim ersten Mal fragt, wenn
  ein Programm ein Standbild macht (siehe unten).
- **GPIO hat ein echtes Character Device.** `/dev/gpiochip0` ist
  vorhanden, und auch das veraltete `/sys/class/gpio`, zusätzlich zu
  `RPi.GPIO` und `gpiozero`. Es gibt weiterhin **kein** `/dev/gpiomem`,
  sodass `pigpio`, das die Peripherieregister will, nichts zum Ansprechen
  hat (siehe unten).
- Das Booten dauert etwa 20 bis 30 Sekunden, länger, wenn der Server
  beschäftigt ist; ein "Booting"-Overlay verfolgt es. Eine Gastsitzung
  endet nach spätestens **2 Stunden**.
- Der Gast führt beim Booten **`script.py`** aus deinem Projekt aus.
  Benenne deine Hauptdatei im Linux-Modus so (die Instant-Engine führt
  die erste `.py` aus, die sie findet).

Die Schaltfläche **Linux terminal** im Arbeitsbereich legt diese Engine
für den Rest der Sitzung fest, wenn du die Shell willst, zum Beispiel um
Dateien zu inspizieren oder ein Skript von Hand auszuführen. Die Wahl
wird nicht mit dem Projekt gespeichert: Öffne es morgen erneut, und Run
kehrt zur Antwort des Detektors zurück. Alles, was die Instant-Engine
ausführen kann, ist ohne sie schneller.

## GPIO in der Linux-Engine: gpiochip0 und libgpiod

Der Gast registriert ein GPIO-Character-Device mit der eigenen Identität
des Pi, sodass der moderne Stack, den Bookworm und die Pi-5-Dokumentation
lehren, hier funktioniert. `gpiodetect` antwortet:

```text
gpiochip0 [pinctrl-bcm2835] (54 lines)
```

Die Werkzeuge sind installiert (`gpiodetect`, `gpioinfo`, `gpioget`,
`gpioset`, `gpiomon`), und eine Leitung, die sie treiben, erreicht das an
diesen Pin verdrahtete Teil auf der Arbeitsfläche.

Das Image liefert **libgpiod Version 1**, schreibe die Befehle also auf
die Version-1-Art: Der Chip ist ein positionelles Argument, keine
`--chip`-Option.

```bash
gpioset gpiochip0 17=1     # drive GPIO17 high
gpioget gpiochip0 5        # read GPIO5, prints 0 or 1
gpiomon gpiochip0 5        # print edges on GPIO5 as they arrive
```

Die Version-2-Schreibweise (`gpioset --chip gpiochip0 17=1`) wird nicht
verstanden. Wenn ein Tutorial sie verwendet, lass die Option weg und übergib
den Chip für sich.

Die Python-Bindings sind ebenfalls vorinstalliert, wieder mit der
Version-1-API:

```python
import gpiod

chip = gpiod.Chip("gpiochip0")
line = chip.get_line(17)
line.request(consumer="velxio", type=gpiod.LINE_REQ_DIR_OUT)
line.set_value(1)
```

`RPi.GPIO` und `gpiozero` sind davon unberührt und weiterhin der kürzeste
Weg, ein Skript zu schreiben. Die veraltete sysfs-Schnittstelle unter
`/sys/class/gpio` funktioniert ebenfalls, sodass ein altes Tutorial, das
einen Pin durch Schreiben in Dateien exportiert, das tut, was es sagt. Was
weiterhin fehlt, ist `/dev/gpiomem` und damit `pigpio`: Diese Bibliothek
mappt die Peripherieregister direkt, und hier gibt es nichts zu mappen.

Die Instant-Engine hat kein Character Device: In deinem Browser ist GPIO
`RPi.GPIO`, `gpiozero` oder Blinka.

## Die Kamera in der Linux-Engine

Standardmäßig liefern die Kamera-Werkzeuge des Gasts das **Testmuster** des
Kamera-Teils, und ein Skript, das ein Standbild macht, bekommt ein Bild,
ohne dass jemand etwas gefragt wird.

Wenn ein Programm im Linux-Modus zum ersten Mal ein Standbild anfordert,
während der Kamera-Teil im Webcam-Modus ist, fragt Velxio, ob es dafür
deine echte Webcam verwenden darf. Es muss fragen, wegen des Ortes, an dem
der Code läuft: In der Instant-Engine verlassen die Frames nie deinen
Rechner, während der Linux-Gast auf Velxios Servern läuft, sodass ein
Erlauben bedeutet, dass die Frames dorthin gesendet werden.

- Sag **nein**, und die Werkzeuge liefern weiterhin das Testmuster. Nichts
  bricht, und kein Skript muss geändert werden.
- Sag **ja**, und die Standbilder sind deine echte Webcam, **nur für diese
  Seitensitzung**. Die Antwort wird nicht im Projekt gespeichert und nicht
  nach einem Neuladen gemerkt, sodass du beim nächsten Öffnen der Seite
  erneut gefragt wirst.

`picamera2` ist eine andere Sache: Es ist weiterhin ein
Instant-Engine-Modul. Mache im Linux-Gast Standbilder mit den
Kommandozeilen-Werkzeugen.

## Was funktioniert, Teil für Teil

Jede Zeile ist ein Skript, geschrieben so, wie ein Pi-Tutorial es
schreibt, ausgeführt durch das Live-Produkt mit dem auf der Arbeitsfläche
verdrahteten Teil, auf einem Raspberry Pi 4. Die Display-Zeilen werden auf
der Arbeitsfläche selbst geprüft: Das Panel muss leuchten, nicht nur das
Skript fertig werden.

| Was | Bibliothek, die das Skript verwendet | Instant | Linux |
| --- | --- | --- | --- |
| LED und Drucktaster | `gpiozero` | Ja | Ja |
| LED aus der Shell | `gpioset` (libgpiod 1) | Nein | Ja |
| Servo (PWM) | `gpiozero.Servo` | Ja | Ja |
| MPU6050-Beschleunigungssensor | `smbus2` | Ja | Ja |
| DS3231-Echtzeituhr | `smbus2` | Ja | Ja |
| BMP280-Drucksensor | `smbus2` | Ja | Ja |
| SHT31-Temperatur und -Luftfeuchtigkeit | `smbus2` | Ja | Ja |
| PCA9685 16-Kanal-PWM-Treiber | `smbus2` | Ja | Ja |
| ADS1115-ADC | `smbus2` | Ja | Ja |
| 16x2-LCD, I2C-Backpack | `smbus2` oder `RPLCD.i2c` | Ja | Ja |
| 16x2-LCD, parallel (RS, E, D4 bis D7) | `RPLCD.gpio` | Ja | Ja |
| SSD1306-OLED | `smbus2` | Ja | Ja |
| SSD1306-OLED | `luma.oled` | Ja | Ja |
| SSD1306-OLED | Adafruit Blinka + `adafruit_ssd1306` | Ja | Ja |
| ILI9341-TFT | `spidev` | Ja | Ja |
| microSD-Karte (SPI-Modus) | `spidev` | Ja | Ja |
| DS18B20-Temperatursonde | 1-Wire sysfs, `w1thermsensor` | Ja | Ja |
| GPS-Modul an der Header-UART | `pyserial` auf `/dev/serial0` | Ja | Ja |
| 7,5"-E-Paper (UC8179) | `spidev` + `RPi.GPIO`, Treiber im Waveshare-Stil | Ja | Ja |
| Potentiometer direkt an einem GPIO | | Nein (siehe unten) | Nein |

Die OLED- und LCD-Zeilen wurden auch auf einem Raspberry Pi Zero in der
Linux-Engine ausgeführt, der ein 32-Bit-Gast mit eigenem Image ist.

## Was nicht funktioniert

- **Analogeingang an einem GPIO.** Ein Raspberry Pi hat **keinen ADC**,
  auch auf echter Hardware nicht. Ein Potentiometer, LDR oder Pulssensor,
  direkt an einen GPIO verdrahtet, liest immer nur high oder low, und die
  Ausführkonsole sagt das auch. Setze einen **ADS1115** (I2C) oder einen
  **MCP3008** (SPI) zwischen den Sensor und den Pi, genau wie du es auf
  einem Labortisch tun würdest; beide sind im Katalog, und die Galerie hat
  ein MCP3008-Beispiel mit einem Potentiometer.
- **`picamera2` in der Linux-Engine.** Es verwendet deine Webcam in der
  Instant-Engine, weil das Skript in deinem Browser läuft. Im Gast kommen
  Standbilder stattdessen von `rpicam-jpeg` und seinen Geschwistern, über
  das Testmuster oder über deine Webcam, sobald du es erlaubt hast (oben).
- **Ein E-Paper-Treiber, der sein Bild an die falsche Stelle sendet.** Bei
  einem UC8179-Panel (dem 7,5") ist Befehl `0x10` das vorherige Bild und
  `0x13` das, was das Glas zeigt. Ein Treiber, der nur `0x10` schreibt,
  bekommt hier eine leere Aktualisierung, genau wie auf dem echten Panel,
  und der serielle Monitor (das Linux-Terminal, in dieser Engine) sagt,
  warum. Der BUSY-Pin folgt ebenfalls dem Controller: LOW, während ein
  UltraChip-Panel arbeitet, HIGH bei einem SSD168x.
- **`pigpio` und `/dev/gpiomem`.** `pigpio` erreicht die Pins durch Mappen
  der Peripherieregister, und keine der beiden Engines gibt ihm dieses
  Mapping. Verwende `RPi.GPIO`, `gpiozero` oder, in der Linux-Engine,
  `libgpiod` (oben).
- **`libgpiod` / `gpiod` in der Instant-Engine.** Das Character Device ist
  eine Sache der Linux-Engine; im Browser gibt es kein `/dev/gpiochip0`
  zum Öffnen.
- **Ein aus einem MicroPython-Tutorial kopiertes Skript.** `import
  machine`, `from gpio_lcd import GpioLcd` und Freunde existieren auf
  einem Pico oder einem ESP32, nicht auf einem Board, das das volle Python
  ausführt. Die Konsole nennt stattdessen das Pi-Äquivalent (`gpiozero`,
  `RPLCD`, `luma.oled`, `w1thermsensor`), statt ein zu installierendes
  Paket vorzuschlagen.
- **PyTorch, TensorFlow.** Gigabytes, und hier nichts, um sie zu
  beschleunigen. Sie werden mit dieser Erklärung abgelehnt.

## Python-Module in jeder Engine

Beide Engines liefern die Standardbibliothek. "Vorinstalliert" bedeutet,
dass es allein ab der `import`-Zeile funktioniert, ohne
`requirements.txt`, so wie Raspberry Pi OS seine Hardware-Bibliotheken im
Image hat.

| Modul | Instant (Browser) | Linux (Gast) |
| --- | --- | --- |
| `RPi.GPIO` | Vorinstalliert | Vorinstalliert |
| `gpiozero` | Vorinstalliert | Vorinstalliert (2.0.1) |
| `gpiod` (libgpiod 1) | Kein Character Device im Browser | Vorinstalliert, mit den `gpio*`-Werkzeugen |
| `smbus2` / `smbus` | Vorinstalliert (die echte Bibliothek) | Vorinstalliert (die echte Bibliothek) |
| `spidev` | Vorinstalliert | Vorinstalliert (ein kompiliertes py-spidev) |
| `serial` (pyserial) | Nur die Pi-UART-Pfade | Das echte pyserial 3.5 auf einem echten tty |
| `w1thermsensor` | Vorinstalliert | Über `requirements.txt` (der 1-Wire-Baum ist da) |
| `luma.core`, `luma.oled`, `luma.lcd` | Vorinstalliert | Vorinstalliert |
| `RPLCD` | Vorinstalliert | Vorinstalliert |
| `ST7789` | Vorinstalliert | Vorinstalliert |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Vorinstalliert | Vorinstalliert |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Vorinstalliert | Vorinstalliert |
| `PIL` (Pillow), `numpy` | Vorinstalliert | Vorinstalliert (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Ja | Nein (kein Build für den Gast) |
| `picamera2` | Ja, über deine Webcam | Nein (verwende `rpicam-jpeg` / `libcamera-jpeg`) |
| `velxio_screen` | Ja | Ja |
| `requests` / `urllib` | Ja, über Velxios Egress-Proxy mit einer Allowlist | Kein Netzwerk |
| Alles andere | Über `requirements.txt` | Über `requirements.txt` |

Die DejaVu-Schriften sind im Gast unter dem Pfad, den Raspberry Pi OS
verwendet (`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), weil
Display-Tutorials ihn fest verdrahten.

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

### Andere Drittanbieter-Pakete brauchen eine `requirements.txt`

Füge eine `requirements.txt`-Datei neben deinem Skript hinzu, ein Paket
pro Zeile; Velxio löst sie vor dem Lauf auf und sagt dir in der
Ausführkonsole, was es installiert hat. Wenn ein Skript ein fehlendes
Paket importiert, bietet die Konsole die hinzuzufügende Zeile an, und eine
Schaltfläche schreibt sie für dich. Welche Engine ein Paket aufnehmen
kann, hängt davon ab, wie es gebaut ist:

- Ein reines Python-Paket (ein `py3-none-any`-Wheel) läuft in beiden
  Engines.
- Ein Paket mit kompiliertem Code läuft in der **Instant**-Engine, wenn
  die Browser-Laufzeit es mitliefert (numpy, pillow, opencv-python,
  scikit-learn unter anderem), und in der **Linux**-Engine nur, wenn PyPI
  ein **musl-aarch64**-Wheel dafür hat (numpy, pandas, scipy und psutil
  haben eines). Pakete, die nur glibc-`manylinux`-Wheels veröffentlichen,
  können im Gast nicht installiert werden.
- Auf einem Raspberry Pi Zero, 1 oder 2 ist der Gast 32-Bit, und PyPI hat
  fast keine kompilierten Wheels dafür: Bleibe dort bei dem, was
  vorinstalliert ist, oder bei reinen Python-Paketen.
- Namen, die der Gast bereits bereitstellt (`RPi.GPIO`, `smbus2`,
  `spidev`, `pyserial`, `gpiozero`, `gpiod`), werden nie heruntergeladen,
  sodass eine `requirements.txt` eines Tutorials, die sie auflistet,
  keinen Schaden anrichtet.

Wheels zählen gegen dasselbe Speicherkontingent wie Arduino-Bibliotheken.

### pip von Hand im Linux-Gast ausführen

Du musst nie. Was `requirements.txt` deklariert, ist importierbar, sobald
der Gast bootet, ganz ohne Installationsschritt. Der echte Befehl
funktioniert ebenfalls, für jemanden, der einem Tutorial folgt, das ihn
ausbuchstabiert:

```bash
python3 -m venv --system-site-packages ~/.venv
~/.venv/bin/pip install -r requirements.txt
```

Der Gast hat kein Netzwerk, sodass `pip` gegen ein lokales Wheelhouse
auflöst, das mit den Paketen des Projekts ausgeliefert wird; es
installiert, was das Projekt deklariert, und kann PyPI für nichts anderes
erreichen.

Wisse, was es kostet, bevor du anfängst, und lies die Stille nicht als
Hänger: Auf der emulierten CPU dauert das Erstellen einer virtuellen
Umgebung **mit** pip etwa vier Minuten (etwa sechs Sekunden ohne sie), und
die Installation selbst etwa eine halbe Minute. Das Warten bringt dir
nichts, was du nicht schon hattest, da die von dir deklarierten Pakete
bereits importiert sind, wenn du eine Eingabeaufforderung bekommst. Es ist
für die Male da, in denen du den echten Workflow willst.

Das System-Python ist als extern verwaltet markiert (PEP 668), genau wie
auf Raspberry Pi OS Bookworm, sodass ein bloßes `pip install` außerhalb
einer virtuellen Umgebung mit derselben Meldung ablehnt, die es auf dem
Board gibt.

## Dateien

Ein **Datei-Panel** im Pi-Arbeitsbereich lädt Skripte und Datendateien in
das Projekt hoch; im Linux-Modus werden sie in das Home-Verzeichnis des
Gasts kopiert, bevor `script.py` startet.

## Der UNIHIKER M10

DFRobots Bildungs-SBC (ein Linux-Board mit eingebautem Touchscreen) läuft
auf denselben zwei Engines, mit seinen eigenen `pinpong`- und
`unihiker`-Modulen anstelle der Pi-Bibliotheken. Es ist ein
kostenpflichtiges Board mit seinen eigenen drei Testsitzungen; finde es im
Auswahlmenü neben der Pi-Familie.

## Board-Grafiken und Pinbelegungen

Die Canvas-Grafik und die vollständige Pinbelegung jedes Boards, generiert
aus dem Simulator:

[Raspberry Pi 3 (Grafik auch für Zero/1/2)](/docs/de/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/de/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/de/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/de/boards/reference/unihiker-m10/)
