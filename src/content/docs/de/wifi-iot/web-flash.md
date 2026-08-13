---
title: Echte Hardware aus dem Browser flashen
description: "Schreiben Sie Ihr kompiliertes Projekt über USB auf ein physisches Board — ohne installierte Toolchain."
sidebar:
  order: 4
---

Wenn Ihr Projekt im Simulator funktioniert, können Sie es auf ein **echtes
Board** übertragen, ohne etwas zu installieren: Velxio flasht die kompilierte
Firmware über USB, direkt aus dem Browser.

## Voraussetzungen

- Ein Chromium-basierter Browser (Chrome oder Edge) — der Flasher verwendet
  die serielle Port-API des Browsers, die Firefox und Safari nicht enthalten.
- Ein datenfähiges USB-Kabel zu Ihrem Board.
- Schließen Sie zuerst alles andere, das den Port verwendet (serielle Monitore,
  IDEs) — der Browser benötigt exklusiven Zugriff.

## Flashen

1. Öffnen Sie den **Flash**-Dialog (Flash-Dialog) aus dem Editor.
2. Wählen Sie den USB-Serial-Port — der Dialog erkennt Kandidaten automatisch,
   und der Browser fragt Sie, welchen Port Sie freigeben möchten.
3. Velxio verwendet die Firmware, die es bereits für Ihr Board kompiliert hat —
   dasselbe Binärprogramm, das der Simulator ausgeführt hat.
4. Beobachten Sie den Fortschritt; wenn er abgeschlossen ist, startet das Board
   in Ihr Projekt neu.

RP2040/RP2350-Boards flashen ihre `.uf2`, ESP32-Boards ihre `.bin` — der
Dialog wählt das richtige Protokoll für das Ziel.

## Erst simulieren, dann flashen

Dies schließt den Kreislauf, der Velxio für echte Arbeit nützlich macht:
schnell im Simulator iterieren (kein Kabel, kein Verschleiß an der Hardware,
sofortige Resets), dann genau dasselbe Build-Artefakt flashen, wenn es sich
richtig verhält.
