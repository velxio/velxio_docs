---
title: Verwenden von Bibliotheken
description: Suchen, installieren und pinnen Sie Arduino-Bibliotheken für Ihr Projekt.
sidebar:
  order: 5
---

Klicken Sie in der Symbolleiste auf **Libraries** (Bibliotheken), um das Arduino-Bibliotheksverzeichnis zu durchsuchen
und Bibliotheken zum aktiven Board hinzuzufügen.

Installierte Bibliotheken werden in der Datei **`libraries.json`** des Boards aufgezeichnet
(im Dateibaum sichtbar), sodass sie mit dem Projekt mitwandern: Jeder, der
es öffnet – einschließlich Ihres zukünftigen Ichs – erhält zur Kompilierzeit dieselben Versionen.
Kein pro-Maschine-Bibliotheksordner, der synchron gehalten werden muss.

## Verwenden einer Bibliothek

Installieren Sie sie und binden Sie sie dann wie gewohnt mit `#include` ein:

```cpp
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
```

Der Cloud-Compiler ruft die deklarierten Bibliotheken (plus deren
Abhängigkeiten) vor dem Build ab. Wenn ein Build mit
`No such file or directory` bei einem Header fehlschlägt, ist die Bibliothek, die diesen
Header bereitstellt, noch nicht deklariert – fügen Sie sie über **Libraries** hinzu.

## MicroPython

Die MicroPython-Firmware wird mit ihren standardmäßig gebündelten Modulen
(`machine`, `network`, `time`, …) ausgeliefert. Reine Python-Hilfsmodule können
als zusätzliche Dateien im Dateibaum neben `main.py` hinzugefügt und normal importiert werden.

## Beispiele sind vorkonfiguriert

Jedes Galerie-Beispiel deklariert die Bibliotheken, die es benötigt – wenn Sie eines öffnen,
erhalten Sie eine bekannte, funktionierende Kombination aus Code + Schaltung + Bibliotheksversionen,
was sie zu guten Ausgangspunkten für Ihre eigenen Projekte macht.
