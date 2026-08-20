---
title: Pro-Platinen
description: Der Premium-Board-Katalog – M5Stack, Badger 2350, XIAO Sense, ESP32-C6, Galactic Unicorn, UNIHIKER.
sidebar:
  order: 8
---

Pro-Platinen sind die Premium-Kategorie des Katalogs: Markenhardware mit
umfangreichen integrierten Peripheriegeräten, die tief genug emuliert wird,
um die **Werksfirmware** zu starten. Sie sind Teil des gehosteten Katalogs
auf velxio.dev.

:::note[Welchen Plan benötigen sie?]
**Nur das UNIHIKER M10 erfordert einen kostenpflichtigen Plan.** Jede andere
Platine auf dieser Seite – M5Stack, Pimoroni, XIAO und das ESP32-C6 DevKit –
**läuft mit dem kostenlosen Plan**. Die ausschließlich kostenpflichtigen
Platinen sind genau die STM32-Familie und die Raspberry-Pi-Linux-Familie
(zu der das UNIHIKER gehört). Siehe
[Pläne](/docs/de/getting-started/plans/).
:::

## M5Stack

*Kostenloser Plan.*

### M5 Cardputer ADV

![M5 Cardputer ADV auf der Velxio-Leinwand](../../../../assets/docs/boards/cardputer-adv.png)

Der ESP32-S3-Taschencomputer mit Tastatur und TFT. Startet die echte M5-
Launcher-Firmware; tippe auf der Bildschirmtastatur, starte Apps, nutze
den Lautsprecher.

### M5Stack Core

![M5Stack Core auf der Velxio-Leinwand](../../../../assets/docs/boards/m5stack-core.png)

Der klassische stapelbare ESP32 mit 320x240-TFT und drei Tasten.

## Pimoroni

*Kostenloser Plan.*

### Badger 2350

![Pimoroni Badger 2350 auf der Velxio-Leinwand](../../../../assets/docs/boards/badger-2350.png)

Das RP2350-E-Paper-Abzeichen. Es startet die vollständige **BadgeOS-
Werksfirmware**: Navigiere mit den A/B/C/UP/DOWN-Tasten durch den Launcher,
öffne die Uhr-, Abzeichen- und Galerie-Apps und beobachte, wie sich das
E-Paper so aktualisiert, wie E-Paper es wirklich tut.

### Galactic Unicorn

![Pimoroni Galactic Unicorn auf der Velxio-Leinwand](../../../../assets/docs/boards/galactic-unicorn.png)

Die 53x11-RGB-LED-Matrix (583 Pixel), gesteuert von einem integrierten
Pico 2 W (RP2350), mit den A/B/C/D- und Lautstärke-/Helligkeitstasten.

### Pico Plus 2 W

![Pimoroni Pico Plus 2 W auf der Velxio-Leinwand](../../../../assets/docs/boards/pimoroni-pico-plus-2w.png)

Pimoronis RP2350B-Board im Standard-Pico-Formfaktor (GP0..GP28 plus
Stromversorgung), sodass jede Pico-Verdrahtung direkt darauf passt. GPIO,
UART, USB-Seriell, I2C und SPI werden unterstützt; der CYW43-WiFi-
Koprozessor und PSRAM werden nicht emuliert.

## Seeed Studio XIAO

*Kostenloser Plan.*

### XIAO ESP32S3 Sense

![XIAO ESP32S3 Sense auf der Velxio-Leinwand](../../../../assets/docs/boards/xiao-esp32s3-sense.png)

Das S3 mit Kameramodul, PDM-Mikrofon und microSD.

### XIAO ESP32C6

![XIAO ESP32C6 auf der Velxio-Leinwand](../../../../assets/docs/boards/xiao-esp32c6.png)

WiFi-6-fähiges RISC-V-C6 im XIAO-Formfaktor.

### XIAO RP2040

![XIAO RP2040 auf der Velxio-Leinwand](../../../../assets/docs/boards/xiao-rp2040.png)

Das RP2040-XIAO mit seinem NeoPixel.

## Espressif ESP32-C6

*Kostenloser Plan.*

![ESP32-C6 DevKit auf der Velxio-Leinwand](../../../../assets/docs/boards/esp32-c6.png)

Das **ESP32-C6 DevKit** – der RISC-V-WiFi-6-Chip, mit demselben
Sprach-Trio (Arduino / MicroPython / ESP-IDF) wie der Rest der ESP32-Familie.

## DFRobot UNIHIKER M10

*Kostenpflichtiger Plan erforderlich.*

![DFRobot UNIHIKER M10 auf der Velxio-Leinwand](../../../../assets/docs/boards/unihiker-m10.png)

Ein Linux-Single-Board-Computer mit integriertem Touchscreen – dokumentiert
bei der [Raspberry-Pi-Familie](/docs/de/boards/raspberry-pi/), da er denselben
Voll-Linux-Workflow teilt. Wie der Rest dieser Familie ist es die einzige
Platine auf dieser Seite, die **einen kostenpflichtigen Plan** zum Ausführen
benötigt.

---

Pro-Platinen erscheinen im [Komponenten-Picker](/docs/de/circuit-editor/placing-components/)
mit einem **PRO-Abzeichen**; die [Startvorlagen](/docs/de/getting-started/projects/)
enthalten sofort ausführbare Projekte für jede.

## Board-Grafik und Pinbelegungen

Die Leinwandgrafik und die vollständige Pin-Zuordnung jeder Platine,
generiert aus dem Simulator:

[Badger 2350](/docs/de/boards/reference/badger-2350/) ·
[Galactic Unicorn](/docs/de/boards/reference/galactic-unicorn/) ·
[Pico Plus 2 W](/docs/de/boards/reference/pimoroni-pico-plus-2w/) ·
[M5 Cardputer ADV](/docs/de/boards/reference/cardputer-adv/) ·
[M5Stack Core](/docs/de/boards/reference/m5stack-core/) ·
[ESP32-C6 DevKit](/docs/de/boards/reference/esp32-c6/) ·
[XIAO ESP32S3 Sense](/docs/de/boards/reference/xiao-esp32s3-sense/) ·
[XIAO ESP32C6](/docs/de/boards/reference/xiao-esp32c6/) ·
[XIAO RP2040](/docs/de/boards/reference/xiao-rp2040/) ·
[UNIHIKER M10](/docs/de/boards/reference/unihiker-m10/)
