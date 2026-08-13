---
title: Agent-Modus – baut mit Ihnen zusammen
description: Der Assistent platziert Bauteile, verdrahtet sie, schreibt den Sketch, kompiliert und führt aus.
sidebar:
  order: 3
---

Der **Agent**-Modus gibt dem Assistenten „Hände“. Fragen Sie nach einer Schaltung, und er fügt
die Bauteile hinzu, verdrahtet sie, schreibt den Code, kompiliert und führt ihn aus –
direkt auf Ihrer Arbeitsfläche, während Sie zusehen:

![Das KI-Panel im Agent-Modus](../../../../assets/docs/ai/mode-agent.png)

Probieren Sie Aufforderungen wie:

- _„Baue eine Ampel mit 3 LEDs.“_
- _„Füge diesem Board ein OLED-Display hinzu und zeige einen Zähler darauf an.“_
- _„Meine Tastenwerte prellen – korrigiere den Sketch.“_
- _„Konvertiere dieses Projekt zu MicroPython.“_

## Sie behalten die Kontrolle

Jede Aktion landet in Ihrem normalen Projekt: Teile erscheinen auf der Arbeitsfläche,
Bearbeitungen werden im Code-Editor angezeigt, und der Verlauf zum Rückgängigmachen gehört Ihnen. Prüfen Sie,
was es getan hat, passen Sie es an oder fragen Sie nach dem nächsten Schritt. Wenn ein Lauf fehlschlägt,
liest der Agent die Compiler-Ausgabe und das serielle Monitorprotokoll (Serial Monitor) genauso, wie Sie es
tun würden, und iteriert.

## Gut mit dem Agenten arbeiten

- **Kleine Schritte schlagen lange Aufsätze** – „füge einen DHT22 hinzu und gib die Temperatur aus“
  führt zu besseren Ergebnissen als ein Absatz voller Anforderungen.
- **Lassen Sie es zu Ende arbeiten** – eine Agenten-Runde kann aus mehreren Aktionen bestehen (platzieren, verdrahten,
  Code schreiben, kompilieren, ausführen); das Panel berichtet währenddessen.
- Fügen Sie ein Bild einer Schaltung bei, die Sie nachgebaut haben möchten – es kann anhand eines
  Fotos oder Schaltplans arbeiten.

Agenten-Runden kosten mehr **Zyklen** als Chat-Antworten; der Kontingentzähler unten
im Panel zeigt an, was heute noch übrig ist. Siehe
[Pläne](/docs/de/getting-started/plans/).
