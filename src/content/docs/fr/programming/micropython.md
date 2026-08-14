---
title: "Démarrage rapide avec MicroPython"
description: "Exécutez un vrai firmware MicroPython — REPL inclus — sur les cartes ESP32 et Pico."
sidebar:
  order: 3
---

Velxio ne simule pas MicroPython — il démarre le **vrai firmware
MicroPython** sur la puce émulée. `import machine` se comporte comme sur
du matériel réel, et le [moniteur série](/docs/fr/programming/serial-monitor/)
fait également office de REPL.

## Essayez en un clic

Ouvrez l'exemple de veilleuse de la galerie — une LDR (photorésistance)
contrôlant une LED, en pur MicroPython :

![L'exemple de veilleuse MicroPython](../../../../assets/docs/programming/micropython-editor.png)

Remarquez la barre d'outils : le sélecteur de langue affiche **MicroPython** et l'arborescence
des fichiers montre `main.py` au lieu d'un sketch. Appuyez sur **Run** (Exécuter) :

![La veilleuse en fonctionnement — faites glisser la LDR et observez la LED](../../../../assets/docs/programming/micropython-running.png)

Pendant l'exécution, cliquez sur la **photorésistance** et faites glisser son niveau de lumière — la
lecture ADC change et la LED bascule exactement comme le code le décide.

## L'essentiel

```python
from machine import Pin, ADC
import time

led = Pin(4, Pin.OUT)
ldr = ADC(Pin(34))

while True:
    if ldr.read() < 1000:   # dark
        led.on()
    else:
        led.off()
    time.sleep_ms(200)
```

- **`machine.Pin` / `ADC` / `PWM` / `I2C` / `SPI`** — pilotez les mêmes
  périphériques simulés que les sketches Arduino.
- **Le REPL** — arrêtez votre script et tapez du Python en mode interactif dans le
  moniteur série ; `help()` fonctionne, la complétion par tabulation fonctionne.
- **WiFi** — sur les cartes ESP32, `network.WLAN` se connecte à `Velxio-GUEST` comme sur
  du matériel réel : voir [ESP32 WiFi](/docs/fr/wifi-iot/esp32-wifi/).
- **Modules supplémentaires** — ajoutez des fichiers purement Python à côté de `main.py` et importez-les ;
  voir [Utilisation des bibliothèques](/docs/fr/programming/libraries/).

## Quelles cartes

MicroPython est disponible sur le Raspberry Pi **Pico / Pico W** (son
environnement natif) et sur toute la **famille ESP32** — la matrice complète se trouve dans
[Langages](/docs/fr/programming/languages/). Basculez n'importe quelle carte prise en charge vers
MicroPython avec le sélecteur de langue de la barre d'outils ; Velxio échange l'ensemble
des fichiers pour vous.
