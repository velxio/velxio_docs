---
title: Raspberry Pi (Linux)
description: "Raspberry-Pi-Boards, vom Zero bis zum Pi 5. Python gegen die Schaltung auf der Arbeitsfläche, standardmäßig im Browser oder in einem Linux-Gast auf Velxios Servern, mit dem, was auf jedem Teil funktioniert, Teil für Teil gemessen."
sidebar:
  order: 7
  badge: PRO
---

Die Raspberry-Pi-Familie führt **Python-Skripte gegen die Schaltung auf der
Arbeitsfläche** aus. Anders als bei den Mikrocontroller-Boards gibt es nichts
zu kompilieren: Du schreibst ein Skript, drückst **Run**, und Velxio wählt
eine von zwei Engines, um es auszuführen. Keine der beiden Engines ist ein
Raspberry-Pi-OS-Desktop, lies also diese Seite, bevor du annimmst, dass ein
für echte Hardware geschriebenes Tutorial unverändert funktioniert. Die
meisten tun es: Die Tabellen unten wurden am 19.09.2026 gegen das laufende
Produkt gemessen, Teil für Teil.

| Board                         | CPU-Profil          |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7-Klasse |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

Jeder kann einen Pi auf die Arbeitsfläche setzen und eine Schaltung darum
herum verdrahten. Zum **Ausführen** braucht man einen kostenpflichtigen Plan
oder eine der **drei kostenlosen Testsitzungen von 15 Minuten**, die jedes
angemeldete Konto für die Pi-Familie erhält (siehe
[Pläne](/docs/de/getting-started/plans/)). Bei einem Projekt, das nichts hat,
was ein Pi ausführen kann, etwa ein Arduino-`.ino`-Sketch auf einem
Pi-Board, wird das mitgeteilt, bevor eine Testsitzung dafür verbraucht wird.

![Raspberry Pi 5 auf der Velxio-Arbeitsfläche](../../../../assets/docs/boards/raspberry-pi-5.png)

## Zwei Engines

### Instant (in deinem Browser)

Die Standardeinstellung. Dein Skript läuft auf einem zu WebAssembly
kompilierten Python-Interpreter innerhalb des Tabs, startet in wenigen
Sekunden und benötigt nichts von Velxios Servern. Pin-Schreibvorgänge
erreichen die Arbeitsfläche direkt, sodass eine LED in dem Moment
aufleuchtet, in dem `led.on()` läuft. I2C, SPI und 1-Wire sind als die
Gerätedateien vorhanden, die ein Pi hat (`/dev/i2c-1`, `/dev/spidev0.0`, der
`/sys/bus/w1/devices`-Baum), beantwortet von den auf der Arbeitsfläche
verdrahteten Teilen, sodass die echten `smbus2`, `w1thermsensor` und Adafruit
Blinka unverändert laufen.

Es ist ein reiner Interpreter, kein Betriebssystem: Es gibt keine Shell, kein
`subprocess`, keine Raw-Sockets. Ein Skript, das eines davon anfordert, wird
stattdessen an die Linux-Engine geschickt; der **Engine-Chip** in der
Symbolleiste zeigt an, welche Engine ausgeführt wird, und wenn es Linux ist,
die Datei und Zeile, die es angefordert hat.

### Linux (auf Velxios Servern)

Ein echter Linux-Gast, der in QEMU gebootet wird (`-M virt`, mit dem
CPU-Profil deines Boards), den du über die serielle Konsole im Arbeitsbereich
erreichst. Sei präzise, was er ist:

- **Alpine Linux**, nicht Raspberry Pi OS. `python3` und `pip` sind
  installiert; `apt`, `raspi-config`, der Desktop und die Pi-Firmware-Tools
  gibt es nicht.
- **Kein Netzwerk** aus dem Gast heraus, absichtlich. `pip install` kann PyPI
  nicht erreichen; Pakete kommen über `requirements.txt` (unten).
- **Die Header-Busse sind echte Gerätedateien.** `/dev/i2c-1`,
  `/dev/spidev0.0` und `/dev/spidev0.1` beantworten dieselben Systemaufrufe
  wie auf einem Pi, sodass eine Bibliothek, die sie selbst öffnet (Adafruit
  Blinka), ein C-Programm oder dein eigener `ioctl`-Code mit den Teilen auf
  der Arbeitsfläche spricht. Eine Adresse, die niemand hält, schlägt mit
  `OSError: [Errno 121] Remote I/O error` fehl, wie auf Hardware.
- **Der Header-UART ist ein echter serieller Port.** `/dev/serial0` (auch
  `/dev/ttyAMA0` und `/dev/ttyS0`) ist ein echtes tty, angetrieben vom
  unveränderten pyserial: `serial.tools.list_ports`, `select()` auf dem Port
  und `cat /dev/serial0` funktionieren alle, und die Bytes gehen an das, was
  auf der Arbeitsfläche an GPIO14 und GPIO15 verdrahtet ist.
- Es gibt **kein** `/dev/gpiomem`, `/dev/gpiochip0`, `/sys/class/gpio` oder
  1-Wire-Baum. GPIO läuft über `RPi.GPIO` und `gpiozero`, die vorhanden sind;
  `libgpiod`, `gpioinfo` und `pigpio` haben nichts, womit sie sprechen
  können.
- Das Booten dauert etwa 20 bis 30 Sekunden, länger, wenn der Server
  ausgelastet ist; ein "Booting"-Overlay verfolgt es. Eine Gast-Sitzung endet
  nach spätestens **2 Stunden**.
- Der Gast führt beim Booten **`script.py`** aus deinem Projekt aus. Benenne
  deine Hauptdatei im Linux-Modus so (die Instant-Engine führt die erste
  `.py` aus, die sie findet).

Die Schaltfläche **Linux terminal** im Arbeitsbereich legt diese Engine für
den Rest der Sitzung fest, wenn du die Shell willst, zum Beispiel um Dateien
zu inspizieren oder ein Skript von Hand auszuführen. Die Wahl wird nicht mit
dem Projekt gespeichert: Öffne es morgen erneut, und Run geht zurück zur
Antwort des Detektors. Alles, was die Instant-Engine ausführen kann, ist ohne
sie schneller.

## Was funktioniert, Teil für Teil

Jede Zeile ist ein Skript, geschrieben so, wie ein Pi-Tutorial es schreibt,
ausgeführt gegen das laufende Produkt mit dem auf der Arbeitsfläche
verdrahteten Teil, auf einem Raspberry Pi 4. Die Display-Zeilen werden auf der
Arbeitsfläche selbst geprüft: Das Panel muss leuchten, nicht nur das Skript
fertig werden.

| Was | Vom Skript verwendete Bibliothek | Instant | Linux |
| --- | --- | --- | --- |
| LED und Drucktaster | `gpiozero` | Ja | Ja |
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
| DS18B20-Temperatursonde | 1-Wire-sysfs, `w1thermsensor` | Ja | **Nein** |
| Potentiometer direkt an einem GPIO | | Nein (siehe unten) | Nein |

Die OLED- und LCD-Zeilen wurden auch auf einem Raspberry Pi Zero in der
Linux-Engine ausgeführt, einem 32-Bit-Gast mit eigenem Image.

## Was nicht funktioniert

- **Analogeingang an einem GPIO.** Ein Raspberry Pi hat **keinen ADC**, auch
  auf echter Hardware nicht. Ein Potentiometer, LDR oder Pulssensor, direkt
  an einen GPIO verdrahtet, liest immer nur high oder low, und die
  Ausführungskonsole sagt das auch. Setze einen **ADS1115** (I2C) oder einen
  **MCP3008** (SPI) zwischen den Sensor und den Pi, genau wie du es auf einem
  Labortisch tun würdest; beide sind im Katalog, und die Galerie hat ein
  MCP3008-Beispiel mit einem Potentiometer.
- **1-Wire in der Linux-Engine.** Der Gast-Kernel hat keine
  1-Wire-Unterstützung, daher findet ein DS18B20-Skript dort kein
  `/sys/bus/w1/devices`. Es funktioniert in der Instant-Engine, wo ein
  Skript, das nur `w1thermsensor` importiert, ohnehin läuft.
- **Die Kamera in der Linux-Engine.** `picamera2` funktioniert in der
  Instant-Engine, gespeist von deiner Webcam oder einem Testmuster; der Gast
  hat keine Kamera.
- **`pigpio`, `libgpiod` / `gpiod`, `/dev/gpiomem`.** Kein Daemon und kein
  GPIO-Zeichengerät in beiden Engines. Verwende `RPi.GPIO` oder `gpiozero`.
- **Ein aus einem MicroPython-Tutorial kopiertes Skript.** `import machine`,
  `from gpio_lcd import GpioLcd` und Verwandte existieren auf einem Pico oder
  einem ESP32, nicht auf einem Board, das das vollständige Python ausführt.
  Die Konsole nennt stattdessen das Pi-Äquivalent (`gpiozero`, `RPLCD`,
  `luma.oled`, `w1thermsensor`), anstatt ein zu installierendes Paket
  vorzuschlagen.
- **PyTorch, TensorFlow.** Gigabytes, und hier nichts, um sie zu
  beschleunigen. Sie werden mit dieser Erklärung abgelehnt.

## Python-Module in jeder Engine

Beide Engines liefern die Standardbibliothek mit. "Vorinstalliert" bedeutet,
dass es allein ab der `import`-Zeile funktioniert, ohne `requirements.txt`, so
wie Raspberry Pi OS seine Hardware-Bibliotheken im Image hat.

| Modul | Instant (Browser) | Linux (Gast) |
| --- | --- | --- |
| `RPi.GPIO` | Vorinstalliert | Vorinstalliert |
| `gpiozero` | Vorinstalliert | Vorinstalliert (2.0.1) |
| `smbus2` / `smbus` | Vorinstalliert (die echte Bibliothek) | Vorinstalliert |
| `spidev` | Vorinstalliert | Vorinstalliert |
| `serial` (pyserial) | Nur die Pi-UART-Pfade | Das echte pyserial 3.5 auf einem echten tty |
| `w1thermsensor` | Vorinstalliert | Nicht verfügbar (kein 1-Wire) |
| `luma.core`, `luma.oled`, `luma.lcd` | Vorinstalliert | Vorinstalliert |
| `RPLCD` | Vorinstalliert | Vorinstalliert |
| `ST7789` | Vorinstalliert | Vorinstalliert |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Vorinstalliert | Vorinstalliert |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Vorinstalliert | Vorinstalliert |
| `PIL` (Pillow), `numpy` | Vorinstalliert | Vorinstalliert (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Ja | Nein (kein Build für den Gast) |
| `picamera2` | Ja, über deine Webcam | Nein |
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

Füge eine `requirements.txt`-Datei neben deinem Skript hinzu, ein Paket pro
Zeile; Velxio löst sie vor der Ausführung auf und teilt dir in der
Ausführungskonsole mit, was es installiert hat. Wenn ein Skript ein fehlendes
Paket importiert, bietet die Konsole die hinzuzufügende Zeile an, und eine
Schaltfläche schreibt sie für dich. Welche Engine ein Paket aufnehmen kann,
hängt davon ab, wie es gebaut ist:

- Ein reines Python-Paket (ein `py3-none-any`-Wheel) läuft in beiden Engines.
- Ein Paket mit kompiliertem Code läuft in der **Instant**-Engine, wenn die
  Browser-Laufzeit es mitliefert (numpy, pillow, opencv-python, scikit-learn
  unter anderem), und in der **Linux**-Engine nur, wenn PyPI ein
  **musl-aarch64**-Wheel dafür hat (numpy, pandas, scipy und psutil haben
  eines). Pakete, die nur glibc-`manylinux`-Wheels veröffentlichen, können im
  Gast nicht installiert werden.
- Auf einem Raspberry Pi Zero, 1 oder 2 ist der Gast 32-Bit, und PyPI hat
  fast keine kompilierten Wheels dafür: Bleibe dort bei dem, was
  vorinstalliert ist, oder bei reinen Python-Paketen.
- Namen, die der Gast bereits bereitstellt (`RPi.GPIO`, `smbus2`, `spidev`,
  `pyserial`, `gpiozero`), werden nie heruntergeladen, sodass eine
  `requirements.txt` eines Tutorials, die sie auflistet, keinen Schaden
  anrichtet.

Wheels zählen gegen dasselbe Speicherkontingent wie Arduino-Bibliotheken.

## Dateien

Ein **Datei-Panel** im Pi-Arbeitsbereich lädt Skripte und Datendateien in das
Projekt hoch; im Linux-Modus werden sie in das Home-Verzeichnis des Gastes
kopiert, bevor `script.py` startet.

## Der UNIHIKER M10

DFRobots Bildungs-SBC (ein Linux-Board mit eingebautem Touchscreen) läuft auf
denselben zwei Engines, mit seinen eigenen `pinpong`- und `unihiker`-Modulen
anstelle der Pi-Shims. Es ist ein kostenpflichtiges Board mit seinen eigenen
drei Testsitzungen; du findest es im Auswahlmenü neben der Pi-Familie.

## Board-Grafiken und Pinbelegungen

Die Arbeitsflächen-Grafik und die vollständige Pinbelegung jedes Boards,
generiert aus dem Simulator:

[Raspberry Pi 3 (Grafik auch für Zero/1/2)](/docs/de/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/de/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/de/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/de/boards/reference/unihiker-m10/)
