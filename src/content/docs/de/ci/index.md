---
title: Velxio CI
description: Führe deine Firmware auf einem simulierten Board von einem Terminal oder einem CI-Job aus und lass den Build fehlschlagen, wenn sich die Firmware falsch verhält.
sidebar:
  order: 1
  badge:
    text: Paid
    variant: tip
---

Velxio CI führt eines deiner Projekte auf unserem Simulator von außerhalb des Browsers aus: deinem Terminal, einem GitHub Actions-Job, jeder CI, die eine Binärdatei ausführen kann. Das Board bootet deine echte kompilierte Firmware, die serielle Ausgabe wird zurückgestreamt, und der Befehl endet mit einem von Null verschiedenen Exit-Code, wenn etwas, das du angefordert hast, nicht eingetreten ist.

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
velxio-cli login                           # approve in the browser, once
cd firmware/blink
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 4 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## Wofür es gedacht ist

- **Eine Firmware-Regression abfangen, bevor es die Hardware tut.** Ein Test, der die Binärdatei bootet und auf eine Zeile der seriellen Ausgabe wartet, ist ein einziger Befehl; ein Test, der einen Button drückt, einen Sensor setzt und einen Pin prüft, ist eine kurze YAML-Datei.
- **Testen, was du nicht auf dem Schreibtisch halten kannst.** Jedes Board, das Velxio simuliert, steht jedem Job zur Verfügung, parallel, ohne Labor und ohne Flashen.
- **Die Toolchain behalten, die du hast.** Kompiliere mit arduino-cli, ESP-IDF, PlatformIO oder cargo in einem vorherigen Schritt; Velxio führt nur aus, was dabei herausgekommen ist.

## Was es kostet

CI wird in **simulierten Minuten** abgerechnet: die Zeit, von der die Gast-Firmware glaubt, dass sie vergangen ist, nicht wie lange unsere Server gebraucht haben. Ein 10-Sekunden-Test kostet 10 Sekunden auf jedem Board, egal ob der Emulator ihn schneller oder langsamer als Echtzeit ausgeführt hat.

| Plan  | CI-Minuten pro Monat | Jobs gleichzeitig | Längster Lauf |
| ----- | -------------------- | ----------------- | ------------- |
| Free  | keine                | keine             | keiner        |
| Maker | 200                  | 1                 | 5 min         |
| Pro   | 2.000                | 2                 | 10 min        |

Ein Lauf, der nie startet (ein unbekanntes Board, eine Firmware, die nicht zum Board passt, ein abgelehntes Szenario), kostet nichts. Die Minuten werden am Ersten des Monats zurückgesetzt, UTC. Dein Guthaben, dein Lauf-Verlauf und deine Tokens findest du unter [/account/ci](https://velxio.dev/account/ci):

![Die CI-Kontoseite: in diesem Monat verbrauchte Minuten, die vorhandenen Tokens mit ihrer jeweiligen letzten Verwendung und eine Tabelle der letzten Läufe mit ihrem Status, simulierten und abgerechneten Sekunden und Exit-Code](../../../../assets/docs/ci/account.png)

## Wie ein Projekt sich selbst beschreibt

Zwei Dateien in dem Verzeichnis, auf das du die CLI richtest:

- `velxio.toml`: das Board und die Firmware. Eine Wokwi `wokwi.toml` funktioniert ebenfalls.
- `diagram.json`: die Schaltung. Wokwis Format, sodass ein vorhandenes Diagramm unverändert läuft.

Füge `scenario.yaml` hinzu, wenn eine serielle Prüfung nicht ausreicht: es kann auf Text warten, Text senden, auf die simulierte Uhr warten, einen Pin prüfen und ein Steuerelement an einem Bauteil setzen. Siehe [Szenarien](/docs/de/ci/scenarios/).

## Weiter

- [Schnellstart](/docs/de/ci/quickstart/): ein erster erfolgreicher Lauf in fünf Minuten.
- [velxio.toml](/docs/de/ci/velxio-toml/): jeder Schlüssel und wie Pfade aufgelöst werden.
- [Szenarien](/docs/de/ci/scenarios/): die Schritte und was sie bedeuten.
- [GitHub Actions](/docs/de/ci/github-action/): die Action und ihre Eingaben.
- [Exit-Codes](/docs/de/ci/exit-codes/): was jeder einzelne für deinen Job bedeutet.
- [Umstieg von Wokwi CI](/docs/de/ci/migrating-from-wokwi/): was sich ändert.
