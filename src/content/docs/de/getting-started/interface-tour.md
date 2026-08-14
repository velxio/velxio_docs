---
title: Oberfläche im Überblick
description: Der Editor auf einen Blick — Leinwand, Code-Editor, Werkzeugleiste, Konsolen und das KI-Panel.
sidebar:
  order: 3
---

Dies ist der Velxio-Editor mit einem laufenden Projekt:

![Der Velxio-Editor, nach Bereichen beschriftet](../../../../assets/docs/getting-started/first-project-running.png)

## Die Menüleiste

**File · Edit · View · Account · Help** — Projektoperationen, Rückgängig/Wiederholen,
Panel-Sichtbarkeit, Ihr Konto und Plan sowie Hilferessourcen.

## Die Werkzeugleiste

Von links nach rechts:

| Steuerung            | Funktion                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Layout-Umschalter    | Zeigt den **Code**-Editor, die **Circuit**-Leinwand oder **Both** (beide) nebeneinander                          |
| Sprachauswahl        | **Arduino C++**, **MicroPython** oder **ESP-IDF** — pro Board, siehe [Sprachen](/docs/de/programming/languages/) |
| **Compile** (Strg+B) | Kompilieren ohne Ausführung                                                                                      |
| **Run**              | Bei Bedarf kompilieren, dann Simulation starten                                                                  |
| **Stop** / **Reset** | Simulation anhalten / Firmware von vorne neu starten                                                             |
| **Libraries**        | Arduino-Bibliotheken suchen und installieren                                                                     |
| Ausgabe-Umschalter   | Compiler-Ausgabekonsole ein-/ausblenden                                                                          |
| Board-Auswahl        | Für welches Board der Code-Editor und **Run** gelten (Projekte können mehrere haben)                             |
| **Serial**           | [Seriellen Monitor](/docs/de/programming/serial-monitor/) umschalten                                             |
| **Scope**            | [Oszilloskop / Logikanalysator](/docs/de/instruments/oscilloscope/) umschalten                                   |
| **Add**              | [Komponentenauswahl](/docs/de/circuit-editor/placing-components/) öffnen                                         |

## Das Arbeitsbereich-Panel (links)

Der Dateibaum Ihres Projekts: Jedes Board hat seine eigenen Dateien (`sketch.ino`,
`libraries.json`, alles, was Sie hinzufügen). Die Symbole darüber erstellen einen
neuen Arbeitsbereich aus einer [Startvorlage](/docs/de/getting-started/projects/), öffnen
eine Projektdatei und speichern.

## Die Leinwand (Mitte)

Hier lebt die Schaltung. Scrollen zum Schwenken, Zoom-Steuerung unten
rechts verwenden, Teile zum Auswählen anklicken, Rechtsklick für deren
[Inspektor](/docs/de/circuit-editor/part-inspector/). Das gelbe **SPICE**-
Abzeichen meldet den Zustand der analogen Engine für die ausgewählte Schaltung.

## Die Konsolen (unten)

- **Output** — Compiler- und Systemmeldungen.
- **Serial monitor** — ein Tab pro laufendem Board; Eingabefeld zum Senden von
  Daten zurück. Siehe [Serieller Monitor](/docs/de/programming/serial-monitor/).
- **Oscilloscope** — wenn eingeschaltet. Siehe
  [Oszilloskop](/docs/de/instruments/oscilloscope/).

## Das KI-Panel (rechts)

Der Assistent in seinen drei Modi — **Basic**, **Agent**, **Tutor** — mit
Ihrem verbleibenden Tageskontingent unten. Siehe
[KI-Assistent](/docs/de/ai/overview/). Minimieren Sie es mit dem Pfeil-Button, wenn
Sie die volle Leinwand möchten.
