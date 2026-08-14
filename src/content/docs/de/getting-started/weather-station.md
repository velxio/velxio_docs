---
title: "Tutorial: Wetterstation"
description: Ein echtes Multi-Sensor-Projekt — BMP280 über I2C, DHT22 auf GPIO und ein ILI9341-TFT über SPI, live auf einem ESP32.
draft: true
sidebar:
  order: 3
---

Das [erste Projekt](/docs/de/getting-started/first-project/) ließ eine LED blinken.
Dieses hier ist ein echtes Gerät: Ein ESP32, der **Temperatur und Druck über
I²C** (BMP280), **Luftfeuchtigkeit auf einem GPIO** (DHT22) liest und alles auf
einem **TFT-Display über SPI** (ILI9341) darstellt — drei Busse gleichzeitig, im
Browser.

![Die laufende Wetterstation: Sensoren speisen das TFT live](../../../../assets/docs/getting-started/weather-station.gif)

## 1. Projekt öffnen

Öffnen Sie das öffentliche Projekt:
[velxio.dev/dave/estacin-meteorolgica-esp32](https://velxio.dev/dave/estacin-meteorolgica-esp32).

![Die Wetterstation beim Öffnen](../../../../assets/docs/getting-started/weather-loaded.png)

Nehmen Sie sich einen Moment Zeit, um die Schaltung zu lesen, bevor Sie sie ausführen:

- **BMP280** — `SDA`/`SCL` an die I²C-Pins des ESP32. Zwei Drähte, zwei
  Messwerte (Temperatur + Druck).
- **DHT22** — ein einzelner Daten-GPIO mit seinem Pull-up. Luftfeuchtigkeit und
  ein zweiter Temperaturmesswert.
- **ILI9341** — das SPI-Bündel: `MOSI`, `SCK`, `CS`, `DC`, `RST`. Klicken Sie
  mit der rechten Maustaste auf ein beliebiges Teil, um [seine Pinbelegung und
  das Datenblatt](/docs/de/circuit-editor/part-inspector/) zu sehen.

Dieses Projekt wurde von [Velxios KI-Agent](/docs/de/ai/agent-mode/) entworfen,
verdrahtet und programmiert — Sie können dasselbe bauen, indem Sie danach fragen.

## 2. Ausführen

Drücken Sie **Run** (Ausführen). Der Sketch wird mit der echten Arduino-Toolchain
kompiliert (beobachten Sie, wie die **Output**-Konsole die Adafruit-Bibliotheken
auflöst), der ESP32 startet, und:

![Laufende Wetterstation mit Live-TFT](../../../../assets/docs/getting-started/weather-running.png)

- Das **TFT** zeichnet das Dashboard und aktualisiert es mit Live-Messwerten.
- Der **serielle Monitor** protokolliert jeden Sensor-Durchlauf:

![Serielle Ausgabe der Wetterstation](../../../../assets/docs/getting-started/weather-serial.png)

## 3. Wetter ändern

Klicken Sie auf **BMP280** oder **DHT22**, während die Simulation läuft — deren
Sensor-Bedienfelder ermöglichen es Ihnen, Temperatur, Luftfeuchtigkeit und Druck
zu ziehen. Die Firmware liest die neuen Werte bei ihrem nächsten I²C/GPIO-Abruf
und das TFT folgt. Diese Schleife — Eingabe anpassen, Reaktion des Geräts
beobachten — ist der eigentliche Sinn des Simulierens.

## 4. Machen Sie es zu Ihrem eigenen

Behandeln Sie es wie jedes Projekt: Ändern Sie das Display-Layout im Sketch,
fügen Sie einen Schwellwert hinzu, der eine LED leuchten lässt, wenn die
Luftfeuchtigkeit 70 % überschreitet, oder tauschen Sie den DHT22 gegen einen
anderen Sensor aus dem [Katalog](/docs/de/parts/overview/) aus. Dann
[speichern Sie Ihre Kopie](/docs/de/getting-started/projects/).

## Stattdessen von Grund auf neu bauen

Wenn Sie es lieber selbst verdrahten möchten: Beginnen Sie mit einer leeren
ESP32-[Vorlage](/docs/de/getting-started/projects/), fügen Sie die drei Teile aus
dem [Picker](/docs/de/circuit-editor/placing-components/) hinzu, verdrahten Sie die
Busse wie oben und fügen Sie die **Adafruit BMP280**-, **DHT-Sensor-Bibliothek**-
und **Adafruit ILI9341**-Bibliotheken hinzu
([Anleitung](/docs/de/programming/libraries/)). Oder öffnen Sie den
[KI-Assistenten](/docs/de/ai/agent-mode/) und bitten Sie ihn, die Station mit Ihnen
zu bauen — so ist diese hier entstanden.
----- END PAGE -----
