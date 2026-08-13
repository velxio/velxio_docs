---
title: Fehlerbehebung
description: Die Prüfungen, die die meisten Probleme beheben, in der richtigen Reihenfolge.
sidebar:
  order: 4
---

## Die Simulation startet nicht

1. Überprüfen Sie die **Output console** (Ausgabekonsole) — wenn die Kompilierung fehlgeschlagen ist, finden Sie den Fehler dort, mit Datei und Zeile. Siehe
   [Kompilierungsfehler lesen](/docs/de/programming/compile-and-run/).
2. Eine **circuit verifier** (Schaltungsprüfer)-Warnung (z. B. eine LED ohne Vorwiderstand
   im elektrischen Modus) blockiert den Start absichtlich — beheben Sie die markierte Verdrahtung.
3. Der erste Lauf einer Sitzung kompiliert kalt und kann bei den großen
   Toolchains (ESP-IDF) eine Weile dauern; spätere Läufe sind viel schneller. Geben Sie dem ersten
   Zeit, bevor Sie annehmen, dass er hängt.

## Es läuft, aber nichts passiert

- Ist die **richtige Platine** im Board-Auswahlfeld der Symbolleiste ausgewählt?
- Öffnen Sie den **serial monitor** (seriellen Monitor) — eine Firmware, die abgestürzt ist oder auf
  Eingaben wartet, teilt Ihnen das dort mit.
- Klicken Sie Teile mit der rechten Maustaste an, um ihre **Eigenschaften** zu bestätigen (ein NeoPixel-Streifen, der
  auf 0 LEDs eingestellt ist, zeichnet genau nichts).

## Die Seite selbst verhält sich fehlerhaft

- Velxio benötigt einen **Desktop-Chromium oder Firefox**, einigermaßen aktuell.
- Führen Sie nach Updates einen Hard-Reload durch (Strg+Umschalt+R) — ein veralteter zwischengespeicherter Bundle kann
  schlecht mit einem frischen Backend zusammenpassen.
- Browser-Erweiterungen, die WebAssembly, Canvas oder WebSockets beeinflussen
  (aggressive Datenschutz-Blocker), können die Emulatoren stören — versuchen Sie ein
  Inkognito-Fenster.

## Web-Flash erkennt mein Board nicht

- Verwenden Sie **Chrome oder Edge** — Firefox/Safari liefern die Browser-Serielle-
  API nicht aus.
- Schließen Sie jedes andere Programm, das den Port verwendet (serielle Monitore, IDEs).
- Versuchen Sie ein anderes Kabel — reine Ladekabel sind der klassische Fallstrick.

## WiFi-Beispiele können keine Verbindung herstellen

- Die SSID ist exakt **`Velxio-GUEST`**, offen, ohne Passwort.
- Beobachten Sie den seriellen Monitor auf die Fortschrittszeilen des WiFi-Stacks
  (`wifi:connected`, `got ip`), um zu sehen, welcher Schritt fehlschlägt.

## Immer noch festgefahren?

Fragen Sie den [KI-Assistenten](/docs/de/ai/overview/) bei geöffnetem Projekt — er
liest dieselben Fehler wie Sie. Bei Fehlern erreichen Sie das Team über das **Help** (Hilfe)-
Menü, Discord oder GitHub.
