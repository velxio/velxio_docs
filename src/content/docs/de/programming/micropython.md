---
title: MicroPython-Schnellstart
description: "Führen Sie echte MicroPython-Firmware aus — inklusive REPL — auf ESP32- und Pico-Boards aus."
sidebar:
  order: 3
---

Velxio approximiert MicroPython nicht — es bootet die **echte
MicroPython-Firmware** auf dem emulierten Chip. `import machine` verhält
sich wie auf echter Hardware, und der [serielle Monitor](/docs/de/programming/serial-monitor/)
dient gleichzeitig als REPL.

## Probieren Sie es mit einem Klick aus

Öffnen Sie das Nachtlicht-Beispiel aus der Galerie — ein LDR
(Fotowiderstand), der eine LED steuert, in reinem MicroPython:

![Das MicroPython-Nachtlicht-Beispiel](../../../../assets/docs/programming/micropython-editor.png)

Beachten Sie die Symbolleiste: Der Sprachwähler zeigt **MicroPython** und
die Dateibaum zeigt `main.py` anstelle eines Sketches. Drücken Sie **Run**:

![Das laufende Nachtlicht — ziehen Sie den LDR und beobachten Sie die LED](../../../../assets/docs/programming/micropython-running.png)

Während es läuft, klicken Sie auf den **Fotowiderstand** und ziehen Sie
seine Lichtstärke — der ADC-Wert ändert sich und die LED schaltet genau so
um, wie es der Code vorgibt.

## Das Wesentliche

```python
from machine import Pin, ADC
import time

led = Pin(4, Pin.OUT)
ldr = ADC(Pin(34))

while True:
    if ldr.read() < 1000:   # dunkel
        led.on()
    else:
        led.off()
    time.sleep_ms(200)
```

- **`machine.Pin` / `ADC` / `PWM` / `I2C` / `SPI`** — steuern Sie dieselben
  simulierten Peripheriegeräte wie Arduino-Sketches.
- **Die REPL** — stoppen Sie Ihr Skript und geben Sie Python interaktiv im
  seriellen Monitor ein; `help()` funktioniert, Tab-Vervollständigung
  funktioniert.
- **WiFi** — auf ESP32-Boards verbindet sich `network.WLAN` mit
  `Velxio-GUEST` wie auf echter Hardware: siehe [ESP32-WiFi](/docs/de/wifi-iot/esp32-wifi/).
- **Zusätzliche Module** — fügen Sie reine Python-Dateien neben `main.py`
  hinzu und importieren Sie sie; siehe [Bibliotheken verwenden](/docs/de/programming/libraries/).

## Welche Boards

MicroPython ist verfügbar auf dem Raspberry Pi **Pico / Pico W** (seiner
Heimat) und in der gesamten **ESP32-Familie** — die vollständige Matrix
finden Sie unter [Sprachen](/docs/de/programming/languages/). Stellen Sie jedes
unterstützte Board mit dem Sprachwähler in der Symbolleiste auf MicroPython
um; Velxio tauscht den Dateisatz für Sie aus.
