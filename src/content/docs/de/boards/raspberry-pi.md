---
title: Raspberry Pi (Linux)
description: Vollwertige Linux-Raspberry-Pi-Boards – vom Zero bis zum Pi 5 – mit echter Shell, GPIO und Python.
sidebar:
  order: 7
  badge: PRO
---

Die Linux-Raspberry-Pi-Familie bootet ein **vollständiges Raspberry Pi OS**
in der Cloud und übergibt dir das Terminal – das sind keine
Mikrocontroller-Simulationen, sondern vollwertige Computer.

| Board                         | CPU-Profil           |
| ----------------------------- | -------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7-Klasse |
| **Raspberry Pi 3**            | Cortex-A53           |
| **Raspberry Pi 4**            | Cortex-A72           |
| **Raspberry Pi 5**            | Cortex-A76           |

Alle Pi-Boards sind **Pro** – siehe [Pläne](/docs/de/getting-started/plans/).

## So funktioniert es

1. Platziere den Pi und drücke **Start** (Ausführen) – die WebSocket-Konsole
   verbindet sich in etwa einer Sekunde, dann bootet Linux (rechne mit
   30–60 s bis zur Shell; ein „Booting…“-Overlay zeigt den Fortschritt).
2. Du landest in einer echten Shell: `python3`, `pip`, `ls /sys/class/gpio` –
   eine echte Benutzerumgebung.
3. **GPIO ist mit der Leinwand verbunden**: Steuere eine LED über
   `gpiozero`, lies einen Taster aus, kommuniziere per I2C/SPI mit den
   platzierten Komponenten – die Protokoll-Shims verbinden das Linux-GPIO
   mit der simulierten Schaltung.
4. Ein **virtuelles Dateisystem-Panel** lädt deine Skripte und Dateien
   in den laufenden Pi hoch.

```python
from gpiozero import LED
from time import sleep

led = LED(17)
while True:
    led.toggle()
    sleep(0.5)
```

## Das UNIHIKER M10

DFRobots Bildungs-SBC (ein Linux-Board mit integriertem Touchscreen) läuft
auf derselben Infrastruktur und ist ebenfalls ein Pro-Board – du findest
es in der Auswahl neben der Pi-Familie.

```

```
