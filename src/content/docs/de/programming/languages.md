---
title: Sprachen — Arduino, MicroPython, ESP-IDF
description: Welche Sprache auf welchem Board läuft und wie man wechselt.
sidebar:
  order: 2
---

Der **Sprachauswahl** (language selector) in der Symbolleiste schaltet um, wie der Code des aktiven Boards geschrieben und gebaut wird. Beim Wechsel der Sprache wird der Dateisatz des Arbeitsbereichs ausgetauscht (eine `sketch.ino` wird zu einer `main.py` usw.).

## Arduino C++

Der Standard fast überall: klassische `setup()` / `loop()`-Sketches, kompiliert mit der echten Arduino-Toolchain für das Ziel. Verwenden Sie die Schaltfläche **Libraries**, um eine beliebige veröffentlichte Arduino-Bibliothek hinzuzufügen — siehe [Bibliotheken](/docs/de/programming/libraries/).

Verfügbar auf jedem Board außer der Linux-Raspberry-Pi-Familie.

## MicroPython

Echte MicroPython-Firmware, die auf dem emulierten Chip läuft — die REPL funktioniert über den seriellen Monitor, `import machine` und Verwandte verhalten sich wie auf echter Hardware.

Verfügbar auf:

- **Raspberry Pi Pico / Pico W** (RP2040)
- **ESP32 classic** — DevKit V1, DevKit-C v4, ESP32-CAM, Lolin32 Lite
- **ESP32-S3** — DevKit, XIAO ESP32-S3, Arduino Nano ESP32
- **ESP32-C3** — DevKit, XIAO ESP32-C3, C3 SuperMini

## ESP-IDF

Reine ESP-IDF-Projekte (ein `app_main()`-Einstiegspunkt, IDF-APIs, kein Arduino-Kern), kompiliert mit derselben ESP-IDF-Toolchain. Für den Fall, dass Sie das schreiben, was Sie in der Produktion flashen würden.

Verfügbar auf denselben ESP32-Familien-Boards wie MicroPython oben.

## Python auf Linux (Raspberry Pi)

Die Linux-Raspberry-Pi-Boards (Zero bis 5) verwenden die Sprachauswahl nicht: Sie booten ein vollständiges Linux, und Sie arbeiten in einer echten Shell — führen Sie Python mit `gpiozero`/`RPi.GPIO` gegen das simulierte GPIO aus, genau wie auf dem physischen Pi. Siehe die [Board-Seiten](/docs/de/boards/overview/).
