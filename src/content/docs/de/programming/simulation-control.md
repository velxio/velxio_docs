---
title: Steuerung der Simulation
description: Ausführen, Stoppen, Zurücksetzen und Interagieren mit einer Live-Schaltung.
sidebar:
  order: 6
---

## Ausführen / Stoppen / Zurücksetzen

Die drei Transport-Schaltflächen in der Symbolleiste:

- **Run** (Ausführen) — kompiliert bei Bedarf, startet die Firmware, startet die Welt.
- **Stop** (Stoppen) — hält die Simulation an. Die Schaltung behält ihre Zeichnung, aber
  nichts wird ausgeführt.
- **Reset** (Zurücksetzen) — startet die Firmware von Anfang an neu, ohne neu zu kompilieren.

Der Statuspunkt neben dem Namen der Platine im Dateibaum verfolgt den Zustand:
Leerlauf, Kompiliert, Läuft.

## Interagieren während der Ausführung

Die Leinwand ist während der Simulation live:

- **Buttons und Schalter** reagieren auf Klicks.
- **Potentiometer, Encoder und Sensoren** bieten Bedienelemente zur Änderung ihrer
  Werte — die Temperatur eines DHT22, der Lichtpegel eines LDR — und die Firmware
  sieht die Änderung sofort.
- **Displays, LEDs und Motoren** rendern ihren tatsächlich angesteuerten Zustand.

Eigenschaftsänderungen aus dem [Bauteil-Inspektor](/docs/de/circuit-editor/part-inspector/)
werden ebenfalls live übernommen.

## Mehrere Platinen

Ein Projekt kann **mehr als eine Platine** enthalten, jede mit eigenem Code, eigenem
Seriell-Tab und eigenem Run-Zustand — der Platinen-Selektor in der Symbolleiste wählt aus,
welche der Code-Editor und die Transport-Schaltflächen ansteuern. Platinen können über
verdrahtete Busse miteinander kommunizieren, so funktionieren die Multi-Chip-Beispiele.

## Die Analog-Engine

Digitale Pin-Aktivität und analoge Bauteile werden gemeinsam gelöst: Das gelbe
**SPICE-Abzeichen** über der Schaltung zeigt die Größe des analogen Netzwerks und die
Lösungszeit. Wenn eine Schaltung ein Bauteil beschädigen würde (eine LED ohne
Vorwiderstand im elektrischen Modus), markiert der Prüfer dies vor dem Start — korrigieren
Sie die Verdrahtung oder den Wert und führen Sie **Run** erneut aus.
