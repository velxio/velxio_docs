---
title: GitHub-Synchronisierung
description: Jedes Projektspeichern überträgt den Sketch, den Canvas-Zustand und eine README per Commit an ein GitHub-Repository, das Sie kontrollieren.
sidebar:
  order: 5
  badge: PRO
---

Jedes Mal, wenn Sie ein Velxio-Projekt speichern, überträgt die **GitHub-Synchronisierung** den Sketch, den Canvas-Zustand und eine generierte README per Commit an ein GitHub-Repository, das Ihnen gehört. Ihr Code bleibt in Ihrer eigenen Versionskontrolle – Velxio ist nur der Editor darüber.

Die GitHub-Synchronisierung ist Teil der **Pro**-Stufe – siehe [Pläne](/docs/de/getting-started/plans/).

## Was synchronisiert wird

Bei jedem erfolgreichen Speichern schreibt Velxio in das Stammverzeichnis Ihres Repositorys:

- **`sketch.ino`** – plus alle zusätzlichen `.ino`- / `.h`- / `.c`- / `.py`-Dateien in der Dateigruppe des aktiven Boards.
- **`velxio.json`** – den vollständigen Canvas-Zustand: Board-Typ, platzierte Komponenten, Verbindungen und Layout pro Board. Jeder, der Ihr Repository klont, kann das Projekt in Velxio öffnen und dieselbe Schaltung sehen.
- **`README.md`** – automatisch generiert, mit Projektname, Beschreibung und einem „In Velxio öffnen“-Deep-Link. Sie können sie frei überschreiben, sobald Sie eine umfangreichere README wünschen.

Velxio berührt niemals Dateien außerhalb dieser Pfade – CI-Konfiguration, Dokumentation, Fotos und alles andere im Repository bleiben unangetastet.

## So aktivieren Sie es

1. Öffnen Sie ein beliebiges gespeichertes Projekt. Klicken Sie auf das **…**-Überlaufmenü in der Editor-Symbolleiste und wählen Sie **Sync to GitHub** (Mit GitHub synchronisieren).
2. Nur beim ersten Mal: Klicken Sie auf **Connect GitHub** (GitHub verbinden). GitHub fragt, in welche Repositories Velxio schreiben darf – Velxio erhält installationsbezogenen Zugriff auf _nur_ diese Repositories, keine pauschale Berechtigung für „alle Ihre Repositories“.
3. Wählen Sie das Ziel-Repository aus dem Dropdown-Menü und klicken Sie auf **Link & sync now** (Jetzt verknüpfen und synchronisieren). Velxio überträgt den ersten Commit und zeigt den SHA sowie einen Link an.
4. Das war's. Jedes weitere Speichern überträgt einen weiteren Commit; das Sync-Modal zeigt die letzte Synchronisierungszeit und einen direkten Link zum Commit.

## Sicherheitsmodell

Velxio verwendet eine **GitHub-App**, kein persönliches OAuth-Token:

- **Opt-in pro Repository** – Sie wählen bei der Installation aus, in welche Repositories Velxio schreiben darf, und können jederzeit Repositories widerrufen oder hinzufügen unter [github.com/settings/installations](https://github.com/settings/installations).
- **Keine langlebigen Tokens** – jede Synchronisierung erstellt ein frisches Installations-Token mit ~1 Stunde Gültigkeit; Benutzer-OAuth-Tokens werden genau einmal verwendet (um Ihr GitHub-Profil während der Verbindung abzurufen) und dann verworfen.
- **Isoliertes Rate-Limit** – die App hat ihr eigenes Kontingent, getrennt von dem Ihrer persönlichen Tools.
- **Sauberes Trennen** – das Löschen der Velxio-App aus Ihren GitHub-Einstellungen entzieht sofort den Zugriff; Velxio erkennt den Webhook und trennt die Verbindung ohne veralteten Zustand.

## Konflikte und manuelle Bearbeitungen

Die Synchronisierung ist derzeit ein **Einweg-Push**: Velxio → GitHub. Manuelle Bearbeitungen, die zwischen Velxio-Speicherungen auf GitHub vorgenommen werden, werden beim nächsten Speichern überschrieben – Velxio ist die Quelle der Wahrheit für die synchronisierten Dateien.

Möchten Sie eine Weile lokal in VS Code entwickeln? **Verknüpfen Sie** das Projekt (Sync-Modal → _Verknüpfung aufheben_), arbeiten Sie in Ihrem lokalen Klon und verknüpfen Sie es erneut, wenn Sie wieder von Velxio aus steuern möchten. Bidirektionale Synchronisierung ist auf der Roadmap.

## FAQ

**Was passiert, wenn eine Synchronisierung fehlschlägt?**
Fehler werden im Sync-Modal mit einer Wiederherstellungsaktion angezeigt (GitHub erneut verbinden, anderes Repository wählen, später erneut versuchen). Das Speichern selbst wird nie blockiert – Ihr Projekt wird immer in Velxio gespeichert.

**Kann ich mit einem Repository synchronisieren, das mir nicht gehört?**
Ja, solange die GitHub-App in der Organisation installiert ist und Sie dort Schreibzugriff haben.

**Was ist mit privaten Repositories?**
Vollständig unterstützt – was auch immer Sie während der Installation autorisieren, wird beschreibbar, ob öffentlich oder privat.

**Kann ich die README anpassen?**
Velxio überschreibt `README.md` derzeit bei jeder Synchronisierung. Auf der Roadmap: Überschreiben überspringen, sobald Sie die Datei übernommen haben.
