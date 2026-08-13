---
title: Analogsimulation
description: Die SPICE-Engine hinter der Leinwand – was sie modelliert und wie man ihr Abzeichen liest.
sidebar:
  order: 3
---

Velxio propagiert nicht nur digitale High- und Low-Pegel. Die analogen Teile
Ihrer Schaltung – Widerstände, Dioden, Transistoren, Stromquellen – werden
von einer **SPICE-Engine** gelöst, die gekoppelt mit der digitalen Simulation
läuft, so wie es Mixed-Mode-Simulatoren auf dem Desktop tun.

## Das SPICE-Abzeichen

Das gelbe Abzeichen über der Schaltung meldet das analoge Netzwerk:

- **nets** – wie viele elektrische Knoten die Engine löst.
- **solve time** – was die letzte Analyse gekostet hat.

Wenn ein Board-Pin ein analoges Netzwerk ansteuert (z. B. einen GPIO über einen
Widerstand zu einer LED), speisen Pin-Flanken aus der Firmware die analoge
Lösung, und die resultierenden Spannungen und Ströme steuern, was Sie sehen –
einschließlich der LED-Helligkeit.

## Was modelliert wird

- **Passives** – Widerstände, Potentiometer und die Verdrahtung selbst.
- **Dioden und LEDs** – echtes exponentielles I/V-Verhalten mit
  farbspezifischen Durchlassspannungen.
- **Transistoren** – Bipolartransistoren (NPN/PNP) mit korrekten
  Sperrschichtmodellen; Motor-Treiber- und Relaisschaltungen verhalten sich
  realistisch.
- **Logikfamilien** – diskrete Logik-ICs (74xx und Verwandte) mit
  familien-genauen Pegeln modelliert.
- **Stromversorgung** – Netzteile, Regler, Batterien in der Kategorie
  Stromversorgung.

Die Engine wird mit jeder Version weiter verbessert; wenn sich eine exotische
analoge Ecke unerwartet verhält, vereinfachen Sie die Schaltung oder fragen
Sie in der Community.

## Der Schaltungsprüfer

Vor einem Lauf prüft Velxio die Schaltung auf Konfigurationen, die echte
Bauteile beschädigen würden – der Klassiker ist eine LED über einer
Stromversorgung **ohne Vorwiderstand**. Im elektrischen Modus blockiert der
Prüfer den Lauf und zeigt auf das Problem; beheben Sie die Verdrahtung und
starten Sie erneut. Das ist ein Feature: Der Simulator lehrt die Gewohnheit,
die echte LEDs rettet.
