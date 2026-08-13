---
title: Serieller Monitor
description: Sehen Sie die serielle Ausgabe Ihres Programms und senden Sie Daten zurück.
sidebar:
  order: 4
---

Schalten Sie den seriellen Monitor mit der Schaltfläche **Serial** (Seriell) in der Symbolleiste um. Er
öffnet sich als unteres Bedienfeld mit **einem Tab pro Board** im Projekt:

![Der serielle Monitor während eines Laufs](../../../../assets/docs/programming/serial-monitor.png)

Alles, was Ihre Firmware ausgibt (`Serial.println`, MicroPythons `print`,
das Boot-ROM-Protokoll) erscheint hier in Echtzeit — einschließlich der eigenen
Boot-Meldungen des Chips, da der Emulator die echte Firmware startet.

## Bedienelemente

- **Baud rate** (Baudrate) — entspricht Ihrem `Serial.begin(...)`; 115200 ist üblich.
- **Autoscroll** — folgt der neuesten Ausgabe; deaktivieren, um zurückzuscrollen.
- **Clear** (Löschen) — leert den Puffer.
- **Hardware serial** (Hardware-seriell) — zeigt an, dass der Tab an die UART des Boards angeschlossen ist.

## Eingabe senden

Geben Sie Text in das **message box** (Nachrichtenfeld) unten ein und drücken Sie **Send** (Senden). Der
Zeilenende-Auswähler (Newline / Carriage return / beide / keine) ist wichtig für
Sketche, die `Serial.read()` parsen — genauso wie im Monitor der Arduino-IDE.

Auf MicroPython-Boards fungiert der serielle Monitor auch als **REPL**: Stoppen Sie
Ihr Skript mit Ctrl+C-Interrupts und geben Sie Python interaktiv ein.
