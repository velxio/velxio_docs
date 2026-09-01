---
title: Programmierbare Sensoren
description: Bauen Sie einen Sensor, dessen Messwert Sie während der Simulation mit einem Schieberegler ändern, und verstehen Sie genau, wie der Schieberegler Ihren laufenden Chip erreicht.
sidebar:
  order: 3
---

Ein **programmierbarer Sensor** ist ein gewöhnlicher benutzerdefinierter Chip, dessen Messwerte Sie über einen Schieberegler steuern, *während die Simulation läuft*. Ein CO2-Sensor, dessen ppm-Wert Sie durchfahren, um eine Alarmschwelle zu testen. Eine Temperatursonde, die Sie über 85 °C schieben, um zu sehen, was die Firmware tut. Ein Lichtsensor, den Sie von Hand dimmen.

Am Chip selbst ändert sich nichts: Es ist dieselbe WebAssembly-Komponente, die in [Erste Schritte](/docs/de/custom-chips/getting-started/) beschrieben wird. Was diese Seite hinzufügt, ist der Draht, der einen Schiebereglerwert in einen bereits laufenden Chip bringt, ohne etwas neu zu kompilieren oder neu zu starten.

## Der Vertrag, in drei Teilen

Jeder programmierbare Sensor besteht aus genau diesen drei Teilen.

**1. Ein Attribut** hält den einstellbaren Wert.

```c
S.ppm = vx_attr_register("ppm", 1000);
```

**2. Ein `controls`-Eintrag** in `chip.json` bringt einen Schieberegler auf den Bildschirm. Er adressiert das Attribut **über dieselbe ID**:

```json
"controls": [
  { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
    "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
]
```

**3. Ihr Code liest das Attribut erneut**, jedes Mal, wenn er den Wert benötigt:

```c
double ppm = vx_attr_read(S.ppm);   /* der aktuelle Wert des Schiebereglers */
```

Drücken Sie **Run** (Ausführen), klicken Sie auf den Chip, und es öffnet sich Folgendes:

![Das Live-Bedienfeld eines laufenden CO2-Sensor-Chips: ein Schieberegler von 400 bis 5000 ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Dieser dritte Punkt ist der, über den die Leute stolpern. Lesen Sie das Attribut einmal in `chip_setup()` und speichern Sie es in einer Variablen zwischen, dann erscheint der Schieberegler, lässt sich bewegen und tut absolut nichts. `vx_attr_read` ist günstig; rufen Sie es in Ihrem Timer-Callback, in Ihrem I2C-Lese-Handler, überall dort auf, wo der Wert tatsächlich benötigt wird.

:::tip[Sie haben vielleicht schon Schieberegler]
Wenn Sie den Abschnitt `controls` komplett weglassen, erhält **jedes Attribut, das sowohl `min` als auch `max` deklariert, trotzdem einen Schieberegler**. Chips, die Sie geschrieben haben, bevor es das gab, sind oft bereits einstellbar. Mit `controls` können Sie einen Schieberegler umbenennen, ihm eine Einheit geben, ihn logarithmisch machen oder in einen Button verwandeln.
:::

## Wie der Wert Ihren Chip erreicht

Wissenswert, weil die beiden Simulations-Engines unterschiedliche Wege gehen und die Fehlerbilder unterschiedlich sind.

| Schritt | Was passiert |
| --- | --- |
| Sie ziehen den Schieberegler | Das Bedienfeld schreibt in das Sensor-Update-Register, schlüsselbasiert auf diese Chip-Instanz |
| Browser-Engine (AVR, RP2040, ESP32 im Browser) | Der Wert wird direkt in die Attributzuordnung geschrieben, die die laufende WebAssembly bei jedem `vx_attr_read` liest. Kein Nachrichtenaustausch, kein Neustart |
| ESP32 unter QEMU | Der Chip lebt in einem Worker, daher wird der Wert als Attribut-Update an ihn weitergeleitet und dort angewendet |
| Alle 250 ms Ruhe | Die letzten Werte werden in die gespeicherten Eigenschaften der Komponente gespiegelt, sodass die Schiebereglerposition ein Speichern und Neuladen übersteht |

Zwei Konsequenzen, die man kennen sollte:

- **Es gibt keinen "Anwenden"-Schritt.** Der nächste `vx_attr_read` gibt den neuen Wert zurück. Wenn Ihr Chip das Attribut nur einmal pro Sekunde liest, dauert es so lange, bis der Schieberegler sichtbar etwas bewirkt.
- **Das Bedienfeld ist pro Instanz.** Zwei Kopien desselben Chips auf einer Leinwand haben unabhängige Schieberegler, da die Steuerelemente aus dem jeweiligen Manifest jeder Instanz synthetisiert werden.

## Designzeit-Standardwerte versus Live-Werte

Es sind verschiedene Oberflächen, und Leute verwechseln sie:

- **Gestoppt**: Klicken Sie mit der rechten Maustaste auf den Chip, um den Teile-Inspektor zu öffnen. Was Sie dort einstellen, ist der gespeicherte Standardwert des Attributs, der Wert, mit dem der Chip startet.
- **Läuft**: Klicken Sie auf den Chip. Das Schieberegler-Bedienfeld öffnet sich. Was Sie dort einstellen, ist der Live-Wert, der sofort angewendet wird.

## Probieren Sie zuerst eines aus

Jedes Muster hat eine lauffähige Schaltung in der Galerie. Drücken Sie **Run** (Ausführen) und klicken Sie dann auf den Chip:

| Beispiel | Was es lehrt |
| --- | --- |
| [CO2-Sensor (Live-Schieberegler)](https://velxio.dev/example/co2-sensor-live-slider) | Das analoge Rezept: Schieberegler zu Spannung zu `analogRead` |
| [I2C-Umweltsensor (Live-Schieberegler)](https://velxio.dev/example/i2c-env-sensor-live-sliders) | Zwei Schieberegler hinter einer Registerkarte bei `0x44` |
| [Bewegungssensor (Simulations-Button)](https://velxio.dev/example/motion-sensor-sim-button) | Das `button`-Steuerelement: Momentanauslöser plus ein Halte-Schieberegler |
| [Nachtlicht (log. Lux-Schieberegler)](https://velxio.dev/example/night-light-log-slider) | `scale: "log"`: fünf Dekaden Lux auf einem Schieberegler, Lampe schaltet unter 50 lx ab |
| [SPI-Thermometer (Live-Schieberegler)](https://velxio.dev/example/spi-thermometer-live-slider) | SPI-Slave-Timing: Latch bei fallender CS-Flanke |
| [UART-Luftsensor (Live-Schieberegler)](https://velxio.dev/example/uart-air-sensor-live-slider) | Push-artiger serieller Sensor in SoftwareSerial |

## Wo es weitergeht

- [Tutorial: Ein analoger CO2-Sensor](/docs/de/custom-chips/programmable-sensors/co2-analog/)
  — das kürzeste vollständige Beispiel, vom leeren Chip bis zum `analogRead`, das einem Schieberegler folgt.
- [Tutorial: Temperatur und Luftfeuchtigkeit über I2C](/docs/de/custom-chips/programmable-sensors/i2c-env/)
  — das Muster für jeden Sensor mit digitalem Protokoll, mit zwei Schiebereglern und einer Registerkarte.
- [`controls`-Referenz](/docs/de/custom-chips/programmable-sensors/reference/)
  — jedes Feld, die automatischen Fallback-Regeln und was zu prüfen ist, wenn ein Schieberegler nichts tut.

:::note[Kostenlos]
Alles auf dieser Seite ist kostenlos, in jedem Tarif: einen Chip schreiben, kompilieren, ausführen und seine Schieberegler ziehen. Bezahlt wird nur, wenn die KI einen Chip für Sie schreibt (Maker und höher) und die [My Chips](/docs/de/custom-chips/my-chips/)-Serverbibliothek (Pro).
:::
