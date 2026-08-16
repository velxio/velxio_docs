---
title: Kostenlose und kostenpflichtige Pläne
description: Was Free, Maker und Pro genau beinhalten — KI-Credits, Board-Zugriff, Laufzeitlimits, Teilen, Bibliotheken und Abrechnung.
sidebar:
  order: 8
---

Velxio ist kostenlos nutzbar, und der kostenlose Tarif ist keine Demo.
Der Schaltungseditor, der Code-Editor, der Komponentenkatalog, die
Beispielgalerie und unbegrenzte öffentliche Projekte kosten nichts, und
kein Board wird vor dir verborgen.

Kostenpflichtige Pläne gibt es für die zwei Dinge, die echtes Geld
kosten — **den KI-Assistenten**, bei dem jede Eingabe ein Modellaufruf
ist, und **die serverseitige Emulation**, bei der STM32- und
Raspberry-Pi-Boards als echte QEMU-Prozesse auf Velxios Maschinen
laufen — sowie für die Funktionen, die sich an Personen richten, die
Velxio für die Arbeit nutzen: private Projekte, Exporte, Integrationen
und die Offline-Desktop-App.

Die Tarife sind additiv: **Pro enthält alles aus Maker, was alles aus
Free enthält.**

## Die drei Pläne

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Preis | $0 | 7 $ / Monat | 19 $ / Monat |
| Jährliche Zahlung | — | 69 $ / Jahr | 189 $ / Jahr |
| KI-Credits pro Tag | 20 | 500 | 2.000 |
| KI-Credit-Obergrenze pro Monat | 600 | 15.000 | 60.000 |
| Agent- und Tutor-Modi | Nein | Ja | Ja |
| STM32- und Raspberry-Pi-Emulation | Nein | Ja | Ja |
| Projektsichtbarkeit | Öffentlich | Öffentlich, nicht gelistet | Öffentlich, nicht gelistet, privat |
| Bibliotheksspeicher | 100 MB | 500 MB | 2 GB |

Bei jährlicher Zahlung sparst du etwa zwei Monatsbeiträge im Vergleich
zur monatlichen Zahlung desselben Plans. Beide Zahlungsweisen sind beim
Checkout per Karte (Stripe) oder PayPal verfügbar.

## Der KI-Assistent

Der Assistent hat drei Modi, die nicht alle gleich eingeschränkt sind.

| Modus | Funktion | Pläne |
| --- | --- | --- |
| **Basic** | Beantwortet Fragen mit deinem Projekt als Kontext – „Warum leuchtet meine LED nicht?", „Was bedeutet dieser Compilerfehler?" Er liest die Schaltfläche und den Code, ändert sie aber nicht. | Jeder Plan, einschließlich Free |
| **Agent** | Arbeitet am Projekt: fügt Komponenten hinzu und verdrahtet sie, schreibt und korrigiert Code, führt die Simulation aus, um seine eigene Arbeit zu überprüfen. | Maker und Pro |
| **Tutor** | Lehrt Schritt für Schritt anhand deiner eigenen Schaltung – schlägt Übungen vor, überprüft, was du gebaut hast, erklärt die Theorie. | Maker und Pro |

Der Basic-Modus im kostenlosen Tarif hat ein **eigenes Kontingent von 50
Nachrichten pro Tag**, das deine KI-Credits nicht anfasst. Ein
kostenloses Konto ist also nicht auf 20 KI-Interaktionen pro Tag
beschränkt – es erhält 50 Basic-Chat-Nachrichten plus 20 Credits.

### Wie KI-Credits gezählt werden

Credits (angezeigt als Zähler am unteren Rand des Chat-Bedienfelds)
messen die Arbeit, die der Agent- und der Tutor-Modus leisten:

- Eine normale Anfrage kostet **1 Credit**.
- Eine große Anfrage – eine, die mehr als etwa 30.000 Token Kontext
  umfasst, wie ein langes Gespräch über einen großen Sketch – kostet
  proportional mehr, sodass eine einzige umfangreiche Eingabe mehrere
  Credits verbrauchen kann.
- Der Tageszähler **wird um Mitternacht UTC zurückgesetzt**. Nicht
  genutzte Credits verfallen.
- Die Monatsobergrenze ist ein zweites, unabhängiges Limit zusätzlich
  zum Tageslimit.
- Inline-Code-Vervollständigungen im Editor werden separat gemessen und
  verbrauchen niemals Agent-Credits.

Im [Abschnitt zum KI-Assistenten](/docs/de/ai/overview/) erfährst du, was
jeder Modus tatsächlich kann.

## Boards und Simulation

**Jedes Board im Katalog ist in jedem Plan sichtbar und bearbeitbar**,
und die meisten davon *laufen* auch in jedem Plan. Zwei Familien sind
die Ausnahme, weil sie die teuersten im Hosting sind:

| Board-Familie | Wo es läuft | Free | Kostenpflichtig |
| --- | --- | --- | --- |
| Arduino / AVR, RP2040 / RP2350 (Pico, Badger 2350) | In deinem Browser | Ja, ohne Zeitlimit | Ja |
| ESP32-Familie (Classic, S3, C3, C6), M5Stack, XIAO | Velxios Server | Ja, 1 Stunde pro Lauf | Ja, ohne Limit pro Lauf |
| **STM32** (Blue Pill, Black Pill, F4 Discovery…) | Velxios Server | Nein | Ja |
| **Raspberry Pi Linux** (Zero, 1, 2, 3, 4, 5, UNIHIKER) | Velxios Server | Nein | Ja |

Die Boards, die einen kostenpflichtigen Plan benötigen, sind genau die
STM32-Familie und die Raspberry-Pi-Linux-Familie – sie tragen ein
**PRO-Abzeichen** in der Komponentenauswahl. Markenboards wie das M5Stack
Cardputer, das Pimoroni Badger 2350 oder die XIAO-Familie sind **nicht**
hinter einer Bezahlschranke, auch wenn sie Teil des gehosteten Katalogs
sind.

Zwei Limits gelten für alle, auch für zahlende Nutzer:

- Eine Simulation, die **2 Stunden lang inaktiv** ist, stoppt
  automatisch.
- Eine Raspberry-Pi-Sitzung hat eine **harte Obergrenze von 2 Stunden**
  pro Sitzung.

Einige einzelne Funktionen erfordern ebenfalls einen kostenpflichtigen
Plan: Pico-W-WiFi-Emulation, Hochladen von Dateien auf eine simulierte
microSD-Karte, das private IoT-Gateway und eine kleine Gruppe von
Premium-Komponenten (sie zeigen das PRO-Abzeichen in der Auswahl).

## Projekte und Teilen

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Öffentliche Projekte (in der Galerie gelistet) | Unbegrenzt | Unbegrenzt | Unbegrenzt |
| Nicht gelistete Projekte (nur mit Link, in der Galerie verborgen) | Nein | Ja | Ja |
| Private Projekte (nur für dich) | Nein | Nein | Ja |
| Einbetten ohne das „Powered by Velxio"-Abzeichen | Nein | Nein | Ja |
| Simulationsverlauf und -wiedergabe | Nein | Nein | Ja |

Wenn ein kostenpflichtiger Plan ausläuft, **wird nichts gelöscht**.
Projekte, die bereits privat oder nicht gelistet sind, behalten diese
Sichtbarkeit – du kannst nur keine neuen erstellen oder die Sichtbarkeit
eines Projekts ändern, bis du dich wieder anmeldest.

## Bibliotheken und Kompilieren

Das Kompilieren mit `arduino-cli` und das Installieren von Bibliotheken
über den Bibliotheksmanager funktioniert in jedem Plan. Was sich ändert,
ist der Speicherplatz und wie Bibliotheken hinzugefügt werden:

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Bibliotheksmanager + Kompilieren | Ja | Ja | Ja |
| Speicher für installierte und hochgeladene Bibliotheken | 100 MB | 500 MB | 2 GB |
| Eigene Bibliothek als `.zip` hochladen | Nein | Ja | Ja |
| Priorisierte Kompilierwarteschlange zu Spitzenzeiten | Nein | Ja | Ja |

Unter [Bibliotheken](/docs/de/programming/libraries/) erfährst du, wie das
Kontingent berechnet wird.

## Desktop, Exporte und Integrationen

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Velxio Desktop, offline (Linux, Windows, macOS) | Nein | Ja | Ja |
| Privates IoT-Gateway | Nein | Ja | Ja |
| KI-Baukasten für eigene Komponenten – programmiere deine eigenen simulierbaren Chips | Nein | Nein | Ja |
| Stücklisten-Export (CSV, bereit für Mouser oder Digi-Key) | Nein | Nein | Ja |
| Schaltplan-Export (PNG) | Nein | Nein | Ja |
| [GitHub-Synchronisierung](/docs/de/getting-started/github-sync/) | Nein | Nein | Ja |
| Direkter Support vom Entwickler | Nein | Nein | Ja |

## Kostenlose Testversion

Du kannst den Agent- und den Tutor-Modus **7 Tage lang kostenlos**
testen, ohne Karte. Die Testversion läuft mit 500 Credits pro Tag – die
gleiche Tageszuteilung wie bei Maker – und schaltet den Pro-Funktionsumfang
frei, damit du alles bewerten kannst. Eine Testversion pro Konto; starte
sie über die [Preisseite](https://velxio.dev/pricing).

## Abrechnung

- **Zahlungsmethoden**: Karte über Stripe Checkout oder PayPal. Beide
  unterstützen monatliche und jährliche Abrechnung.
- **Jederzeit kündbar**, über das Abonnementportal in deinem
  Kontomenü. Durch Kündigung wird die nächste Verlängerung gestoppt; du
  behältst den Zugriff bis zum Ende des bereits bezahlten Zeitraums.
- **Erstattungen**: innerhalb von 14 Tagen nach der letzten Belastung,
  ohne Wenn und Aber. E-Mail an davidmonterocrespo24@gmail.com.
- **Tarifwechsel**: Kündige zuerst das aktuelle Abonnement und abonniere
  dann das andere.

Schritt-für-Schritt-Anleitungen findest du unter
[Abonnement und Abrechnung](/docs/de/account/subscription/).

## Klassenzimmer und Bildungseinrichtungen

[Velxio für Klassenzimmer](https://velxio.dev/for-schools) bietet jedem
Schüler in einem Kurs vollen Pro-Zugang unter einem institutionellen
Vertrag, ab 40 $ pro Schüler und Jahr mit Mengenrabatten.

## Selbsthosting

Velxio ist Open Source unter der AGPLv3, und die gehostete App unter
velxio.dev wird aus derselben Quelle erstellt. Du kannst sie selbst
kostenlos ausführen – die kostenpflichtigen Pläne finanzieren den
gehosteten Dienst, die Emulationsserver und die KI-Anbieter dahinter.

Aktuelle Preise und den Checkout findest du auf der
[Preisseite](https://velxio.dev/pricing).
