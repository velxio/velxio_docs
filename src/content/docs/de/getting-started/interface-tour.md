---
title: Oberflächentour
description: Der Editor auf einen Blick – Leinwand, Code-Editor, Werkzeugleiste, Konsolen und das KI-Panel.
sidebar:
  order: 4
---

Dies ist der Velxio-Editor mit einem laufenden Projekt:

![Der Velxio-Editor, nach Bereichen beschriftet](../../../../assets/docs/getting-started/first-project-running.png)

## Die Menüleiste

![Die Velxio-Menüleiste: Datei, Bearbeiten, Ansicht, Konto, Hilfe](../../../../assets/docs/getting-started/interface-menu-bar.png)

**Datei · Bearbeiten · Ansicht · Konto · Hilfe** – Projektoperationen, Rückgängig/Wiederholen,
Panel-Sichtbarkeit, Ihr Konto und Ihr Plan sowie Hilferessourcen.

## Die Werkzeugleiste

![Die Editor-Werkzeugleiste, von den Layout-Umschaltern bis zur Schaltfläche Hinzufügen](../../../../assets/docs/getting-started/interface-toolbar.png)

Von links nach rechts:

| Steuerung            | Funktion                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Layout-Umschalter    | **Code**-Editor, **Schaltplan**-Leinwand oder **Beide** nebeneinander anzeigen                            |
| Sprachauswahl        | **Arduino C++**, **MicroPython** oder **ESP-IDF** – pro Board, siehe [Sprachen](/docs/de/programming/languages/) |
| **Kompilieren** (Strg+B) | Ohne Ausführung erstellen                                                                             |
| **Ausführen**        | Bei Bedarf kompilieren, dann die Simulation starten                                                       |
| **Stopp** / **Zurücksetzen** | Simulation anhalten / Firmware von vorne neu starten                                               |
| **Bibliotheken**     | Arduino-Bibliotheken suchen und installieren                                                              |
| Ausgabe-Umschalter   | Compiler-Ausgabekonsole ein-/ausblenden                                                                   |
| Board-Auswahl        | Für welches Board der Code-Editor und **Ausführen** gelten (Projekte können mehrere haben)                |
| **Seriell**          | [Seriellen Monitor](/docs/de/programming/serial-monitor/) umschalten                                          |
| **Oszilloskop**      | [Oszilloskop / Logikanalysator](/docs/de/instruments/oscilloscope/) umschalten                                |
| **Hinzufügen**       | [Bauteilauswahl](/docs/de/circuit-editor/placing-components/) öffnen                                         |

## Das Arbeitsbereich-Panel (links)

![Das Arbeitsbereich-Panel mit der Projektdateibaum](../../../../assets/docs/getting-started/interface-workspace.png)

Der Dateibaum Ihres Projekts: Jedes Board hat seine eigenen Dateien (`sketch.ino`,
`libraries.json`, alles, was Sie hinzufügen). Die Symbole darüber erstellen einen neuen
Arbeitsbereich aus einer [Startvorlage](/docs/de/getting-started/projects/), öffnen
eine Projektdatei und speichern.

## Die Leinwand (Mitte)

![Die Leinwand mit einer ESP32-Blink-Schaltung, dem SPICE-Abzeichen und den Zoom-Steuerungen](../../../../assets/docs/getting-started/interface-canvas.png)

Hier lebt die Schaltung. Scrollen zum Verschieben, Zoom-Steuerungen unten
rechts verwenden, Teile zum Auswählen anklicken, Rechtsklick für deren
[Inspektor](/docs/de/circuit-editor/part-inspector/). Das gelbe **SPICE**-
Abzeichen meldet den Status der analogen Engine für die ausgewählte Schaltung.

## Die Konsolen (unten)

![Die Ausgabekonsole und der serielle Monitor nebeneinander](../../../../assets/docs/programming/serial-monitor.png)

- **Ausgabe** – Compiler- und Systemmeldungen.
- **Serieller Monitor** – ein Tab pro laufendem Board; Eingabefeld zum Senden von Daten
  zurück. Siehe [Serieller Monitor](/docs/de/programming/serial-monitor/).
- **Oszilloskop** – wenn eingeschaltet. Siehe
  [Oszilloskop](/docs/de/instruments/oscilloscope/).

## Das KI-Panel (rechts)

![Das KI-Panel mit den Registerkarten Basis, Agent und Tutor sowie dem Guthabenzähler](../../../../assets/docs/getting-started/interface-ai-panel.png)

Der Assistent in seinen drei Modi – **Basis**, **Agent**, **Tutor** – mit
Ihrem verbleibenden Tageskontingent unten. Siehe
[KI-Assistent](/docs/de/ai/overview/). Minimieren Sie es mit dem Pfeil-Button, wenn
Sie die volle Leinwand möchten.
