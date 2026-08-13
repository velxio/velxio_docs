---
title: Ihr erstes Projekt
description: Öffnen Sie das Blink-Beispiel, führen Sie es aus, beobachten Sie die LED blinken und machen Sie es zu Ihrem eigenen – in fünf Minuten.
sidebar:
  order: 2
---

Der schnellste Weg, Velxio zu verstehen, ist, etwas auszuführen. In diesem
Tutorial öffnen Sie das klassische _Blink_-Beispiel, führen es aus,
beobachten einen simulierten ESP32, der eine echte LED-Schaltung ansteuert,
und ändern dann den Code.

## 1. Öffnen Sie das Beispiel

Gehen Sie zu [velxio.dev/example/esp32-blink-led](https://velxio.dev/example/esp32-blink-led)
(oder finden Sie **ESP32 Blink** in der [Beispielgalerie](/docs/de/getting-started/examples-gallery/)).

![Das Blink-Beispiel, geladen im Editor](../../../../assets/docs/getting-started/first-project-loaded.png)

Sie erhalten ein vollständiges Projekt: den **Code** auf der linken Seite
(ein Arduino-Sketch, der zwei LEDs umschaltet) und die **Schaltung** in der
Mitte – einen ESP32 DevKit, der über einen Widerstand mit einer externen
LED verbunden ist.

## 2. Drücken Sie Run

Klicken Sie auf die grüne Schaltfläche **Run** (Ausführen) in der
Werkzeugleiste (oder drücken Sie **Ctrl+B**, um zuerst zu kompilieren).
Velxio kompiliert Ihren Sketch mit der echten Arduino/ESP-IDF-Toolchain in
der Cloud – die **Output**-Konsole unten links streamt den Fortschritt des
Compilers, genau wie es die Arduino-IDE tun würde.

Die erste Kompilierung einer Sitzung kann etwas dauern; danach sind die
Builds viel schneller.

## 3. Beobachten Sie die Ausführung

Wenn der Build abgeschlossen ist, bootet die Firmware auf dem emulierten
ESP32:

![Das Blink-Beispiel läuft: LED an, serielle Ausgabe fließt](../../../../assets/docs/getting-started/first-project-running.png)

Drei Dinge passieren gleichzeitig:

- **Die LED auf der Leinwand blinkt** – die Simulation steuert die
  tatsächliche Komponente über den tatsächlichen Widerstand an.
- **Der serielle Monitor** zeigt das Boot-Protokoll und dann `LED ON` /
  `LED OFF`, direkt von `Serial.println()` im Sketch.
- Das gelbe **SPICE-Abzeichen** über der Schaltung zeigt, dass die
  analoge Engine den Strompfad der LED berechnet.

## 4. Machen Sie es zu Ihrem eigenen

Bearbeiten Sie den Sketch – ändern Sie zum Beispiel die Verzögerung, um ihn
schneller blinken zu lassen:

```cpp
delay(100);   // was 500
```

Drücken Sie erneut **Run**. Das ist die ganze Schleife: bearbeiten,
ausführen, beobachten.

## 5. Speichern Sie es

Klicken Sie auf das **Speichern-Symbol** über der Dateibaum (oder
**Ctrl+S**), geben Sie dem Projekt einen Namen, und es wird in Ihrem Konto
gespeichert. Siehe [Projekte speichern und öffnen](/docs/de/getting-started/projects/).

> **Tipp:** An einem Punkt festgefahren? Öffnen Sie den KI-Assistenten auf
> der rechten Seite und fragen Sie – „Warum blinkt meine LED nicht?" ist
> einer seiner Beispiel-Prompts aus gutem Grund. Siehe
> [KI-Assistent](/docs/de/ai/overview/).

## Wo es weitergeht

- [Oberflächentour](/docs/de/getting-started/interface-tour/) – was jedes
  Bedienfeld und jede Schaltfläche tut.
- [Schaltungseditor](/docs/de/circuit-editor/overview/) – bauen Sie eine
  Schaltung von Grund auf, statt mit einem Beispiel zu beginnen.
- [Unterstützte Boards](/docs/de/boards/overview/) – tauschen Sie den ESP32
  gegen einen Arduino UNO, einen Pi Pico, einen STM32…
