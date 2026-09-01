---
title: "Meine Chips: Chips speichern und wiederverwenden"
description: Speichern Sie einen benutzerdefinierten Chip einmal und fügen Sie ihn aus Ihrer Komponentenauswahl, markiert mit CUSTOM, in jedes Projekt ein. Pro-Plan.
sidebar:
  order: 4
---

Einen Chip gebaut, den es sich zu behalten lohnt? Speichern Sie ihn unter **Meine Chips** und er wird Teil
*Ihrer* Komponentenauswahl – in jedem Projekt, einsatzbereit, markiert mit
einem violetten **CUSTOM**-Abzeichen. Nur Sie sehen Ihre Bibliothek.

:::note[Pro]
Das Speichern von Chips in Ihrer Bibliothek ist Teil des Pro-Plans: Es ist das eine Stück
benutzerdefinierter Chips, das auf dem Server und nicht in Ihrem Browser lebt.
Schreiben, Kompilieren und Ausführen von Chips sowie das Steuern ihrer
[Live-Schieberegler](/docs/de/custom-chips/programmable-sensors/) sind in jedem
Plan kostenlos; „Mit KI erstellen“ ist ab dem Maker-Plan verfügbar.
:::

Ein gespeicherter Chip behält alles: seinen C-Quellcode, sein Manifest, das kompilierte
WASM und sein [Gesichtsbild](/docs/de/custom-chips/getting-started/#giving-the-chip-a-face),
falls es eines hat.

## Speichern eines Chips

Im Datei-Explorer hat jeder benutzerdefinierte Chip seinen eigenen Abschnitt. Klicken Sie auf die
**Speichern**-Schaltfläche (dt.: *save*) in seiner Kopfzeile (neben Kompilieren), geben Sie ihm einen Namen und eine
optionale Beschreibung, und schon ist er in Ihrer Bibliothek – kompiliert und bereit.
Wenn Sie einen Chip unter einem Namen speichern, den Sie bereits verwendet haben, wird angeboten, den
vorhandenen Eintrag zu aktualisieren, sodass sich ein Chip über Projekte hinweg weiterentwickeln kann.

Der KI-Agent kann das auch: Bitten Sie ihn, *„diesen Chip zu meinen Chips zu speichern“*
(`save_custom_chip`), listen Sie auf, was Sie haben (`list_my_chips`), oder platzieren Sie einen
gespeicherten Chip (`use_my_chip`) – und externe Agenten, die über die
[MCP-Brücke](/docs/de/ai/connect-external-agent/) verbunden sind, erhalten dieselben drei Werkzeuge.

## Verwenden eines gespeicherten Chips

Öffnen Sie die Komponentenauswahl und Ihre Chips sind da, mit CUSTOM-Abzeichen auf der
Karte. Das Ablegen eines Chips **kopiert** ihn in das Projekt – Quelle, Manifest und
kompiliertes Binärprogramm – sodass Projekte vollständig in sich geschlossen bleiben: Das Bearbeiten der
Kopie berührt nie Ihre Bibliothek, und das Teilen des Projekts teilt einen
funktionierenden Chip, nicht nur eine Referenz, die nur Sie auflösen können.

Abgelegte Chips landen direkt im Editor mit ihren `chip.c`- und
`chip.json`-Dateien als gewöhnliche Dateien, wie bei jedem benutzerdefinierten Chip.

## Grenzen

- Bis zu **100 Chips** pro Konto.
- Quelle bis zu 64 KB, kompilierter Chip bis zu ~512 KB.
- Das Löschen eines Projekts löscht nie Bibliotheks-Chips, und das Löschen eines Bibliotheks-
  Chips berührt nie die Projekte, die ihn kopiert haben.

----- END PAGE -----
