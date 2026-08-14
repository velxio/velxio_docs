---
title: ESP32 (klassisch)
description: ESP32 DevKit V1, DevKit-C V4, ESP32-CAM und Wemos Lolin32 Lite.
sidebar:
  order: 3
---

Der ursprüngliche Dual-Core-Xtensa-ESP32 — das Arbeitstier des Katalogs, mit
**WiFi und Bluetooth** im Simulator verfügbar.

| Board                  | Highlights                                           |
| ---------------------- | ---------------------------------------------------- |
| **ESP32 DevKit V1**    | Das Standard-30-Pin-Devkit; eingebaute LED auf GPIO2 |
| **ESP32 DevKit-C V4**  | Offizielles Espressif-Devkit, 38 GPIO                |
| **ESP32-CAM**          | ESP32 + 2-MP-Kameramodul + microSD-Steckplatz        |
| **Wemos Lolin32 Lite** | Kompakt, mit LiPo-Ladegerät-Footprint                |

**Sprachen:** Arduino C++, MicroPython, ESP-IDF — umschaltbar über den
[Sprachauswahl](/docs/de/programming/languages/) in der Symbolleiste.

## Was funktioniert

- **WiFi**: Verbinde dich mit `Velxio-GUEST` und erreiche das echte Internet — siehe
  [ESP32 WiFi](/docs/de/wifi-iot/esp32-wifi/).
- **Peripherie**: GPIO, PWM (LEDC), ADC, I2C, SPI, UART und die
  Timer/Interrupt-Mechanik — deine Firmware startet mit dem echten ROM-Log.
- **ESP32-CAM** stellt seine Kamera und microSD in den Komponenten-Panels
  des Simulators bereit.
- **Web-Flash**: Übertrage dasselbe Binärprogramm per USB auf einen physischen ESP32 —
  [Anleitung](/docs/de/wifi-iot/web-flash/).

## Hinweise

- Der erste ESP-IDF/Arduino-Compile einer Sitzung dauert am längsten; spätere
  Builds werden zwischengespeichert.
- Das eingebaute Blink-Beispiel
  ([dein erstes Projekt](/docs/de/getting-started/first-project/)) zielt auf
  das DevKit V1.
