---
title: Kompilieren und ausführen
description: Was passiert, wenn Sie Play drücken — Cloud-Kompilierung, echte Firmware und wie Sie Fehler lesen.
sidebar:
  order: 3
---

## Was **Run** bewirkt

**Run** kompiliert den Code des aktiven Boards (falls erforderlich) und startet das Ergebnis
auf dem emulierten Board. Es gibt keine "Simulation Ihres Quellcodes" —
Velxio erstellt eine **echte Firmware-Binärdatei** mit der echten Toolchain
(arduino-cli / ESP-IDF / MicroPython) und führt sie Befehl für Befehl aus.

- **Compile** (Ctrl+B) erstellt ohne auszuführen — nützlich, um Fehler
  schnell zu überprüfen.
- **Stop** beendet die Simulation; **Reset** startet die Firmware neu vom
  Anfang.

## Die Ausgabekonsole

Das **OUTPUT**-Panel unten links streamt den Build: Bibliotheksauflösung,
Compiler-Aufrufe, Speichernutzung und schließlich
`Compilation successful`. Es ist dieselbe Ausgabe, die die Arduino-IDE oder
`idf.py build` Ihnen geben würde.

## Compiler-Fehler lesen

Fehler erscheinen genau so, wie der Compiler sie ausgibt, mit Datei und Zeile:

- `'foo' was not declared in this scope` — Tippfehler oder fehlendes `#include`.
- `No such file or directory` für einen Header — die Bibliothek ist nicht installiert;
  fügen Sie sie über **Libraries** hinzu ([Anleitung](/docs/de/programming/libraries/)).
- Linker-/Abschnittsfehler bei sehr großen Skizzen — die Binärdatei passt nicht in den
  Flash des ausgewählten Boards.

Beheben Sie den Fehler und drücken Sie erneut **Run**. Builds nach dem ersten sind dank
Caching viel schneller.

> **Tipp:** Fügen Sie einen Compiler-Fehler in den [KI-Assistenten](/docs/de/ai/overview/) ein
> — Fehler im Kontext zu erklären, ist das, was sein Basic-Modus am besten kann.

## Während der Ausführung

- Der **Statuspunkt** neben dem Boardnamen im Dateibaum zeigt
  Idle / Compiled / Running.
- Der **serielle Monitor** wird automatisch angehängt —
  siehe [Serieller Monitor](/docs/de/programming/serial-monitor/).
- Interagieren Sie live mit der Schaltung: Drücken Sie Tasten, drehen Sie Potentiometer,
  ändern Sie Sensorwerte über deren Bedienfelder.

```

```
