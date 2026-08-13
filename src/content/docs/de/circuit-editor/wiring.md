---
title: Verdrahtung
description: Verbinden Sie Pins mit Drähten, verlegen Sie sie und kodieren Sie sie farblich wie ein echtes Jumper-Set.
sidebar:
  order: 3
---

## Eine Verbindung herstellen

Klicken Sie auf einen **Pin** an einer beliebigen Komponente – ein Draht folgt Ihrem Cursor. Klicken
Sie auf den Ziel-Pin, um die Verbindung abzuschließen. Drähte werden orthogonal verlegt (im rechten
Winkel), so wie es bei Schaltplänen und Breadboard-Fotos am besten lesbar ist.

- Drücken Sie **Escape**, um einen begonnenen Draht abzubrechen.
- Klicken Sie auf einen Draht, um ihn auszuwählen; **Delete** entfernt ihn.
- Sie können die Verdrahtung auch über den [Bauteil-Inspektor](/docs/de/circuit-editor/part-inspector/) starten:
  Klicken Sie mit der rechten Maustaste auf ein Bauteil und „tippen Sie auf einen Pin, um zu verdrahten“.

## Drahtfarben

Während ein Draht erstellt wird (oder wenn ein Draht ausgewählt ist), drücken Sie eine Taste, um
seine Farbe festzulegen – dieselbe Farbpaletten-Konvention, die Wokwi-Benutzer kennen:

| Taste | Farbe   | Taste                       | Farbe                                    |
| ----- | ------- | --------------------------- | ---------------------------------------- |
| `0`   | Schwarz | `6`                         | Blau                                     |
| `1`   | Braun   | `7`                         | Violett                                  |
| `2`   | Rot     | `8`                         | Grau                                     |
| `3`   | Orange  | `9`                         | Weiß                                     |
| `4`   | Gold    | `c` / `l` / `m` / `p` / `y` | Cyan / Lime / Magenta / Lila / Gelb      |
| `5`   | Grün    |                             |                                          |

Neue Drähte erhalten automatisch eine Jumper-Set-Färbung: Benachbarte Drähte erhalten
deutlich unterscheidbare Farben, wobei Rot und Schwarz für die Stromschienen reserviert sind.

## Breadboards

Wenn die Pins eines Bauteils in Breadboard-Löchern sitzen, erscheinen **grüne Punkte** auf den
eingesetzten Pins – „eingesteckt und verbunden“ ist auf einen Blick sichtbar, ohne darüber zu
fahren. Die internen Schienen des Breadboards (Reihen und Stromleisten) leiten
genau wie beim echten Bauteil.

## Elektrische Realität

Drähte sind nicht nur Zeichnungen: Die analoge Engine löst die Schaltung, die Sie tatsächlich
verdrahtet haben. Ein fehlender Vorwiderstand, ein Kurzschluss, ein schwebender Eingang – alles
verhält sich (und fehlverhält sich) wie auf dem Prüfstand. Wenn eine Verbindung im elektrischen
Modus ein Bauteil durchbrennen würde, warnt Sie der Schaltungsprüfer vor dem **Run**.
----- END PAGE -----
