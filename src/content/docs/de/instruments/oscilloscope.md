---
title: Oszilloskop
description: Beobachten Sie die Wellenform eines beliebigen Pins live — Kanäle, Zeitbasis und Triggerung.
sidebar:
  order: 2
---

Schalten Sie das Oszilloskop mit der Schaltfläche **Scope** (Oszilloskop) in der Symbolleiste um. Es öffnet sich als unteres Bedienfeld neben dem seriellen Monitor.

## Hinzufügen eines Kanals

Klicken Sie auf **+ Add Channel** (Kanal hinzufügen) und wählen Sie den zu überwachenden Board-Pin aus:

![Hinzufügen eines Oszilloskop-Kanals](../../../../assets/docs/instruments/oscilloscope-add-channel.png)

Jeder Kanal erhält eine Farbe und ein Label (Board + Pin). Entfernen Sie einen Kanal mit dem kleinen **x** unter seinem Label.

## Lesen der Spur

Hier beobachtet das Oszilloskop **GPIO2** — den Pin der blinkenden LED des [ersten Projekts](/docs/de/getting-started/first-project/):

![Eine Rechteckwelle auf dem Oszilloskop](../../../../assets/docs/instruments/oscilloscope.png)

## Bedienelemente

| Bedienelement       | Funktion                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Time/div**        | Horizontale Skalierung, von 0,1 ms bis 500 ms pro Teilung. Passen Sie sie an Ihr Signal an: Ein 1-s-Blinken liest sich am besten bei etwa 100 ms/div; ein 1-kHz-PWM bei etwa 0,5 ms/div. |
| **Trigger**         | **Auto** (frei laufend), **Normal** (nur bei Trigger zeichnen) oder **Single** (eine Erfassung). Wählen Sie den Triggerkanal und die Flanke — steigend, fallend oder beide. |
| **Pause / Resume**  | Friert die Anzeige ein, um eine Wellenform zu untersuchen.                                                                                             |
| **Clear**           | Löscht die Spuren.                                                                                                                                     |

## Was Sie ausprobieren können

- **Ein PWM-Tastverhältnis messen**: Führen Sie einen `analogWrite()`-Sketch aus, beobachten Sie den Pin bei 0,5 ms/div und vergleichen Sie die High- und Low-Zeiten.
- **Ein einmaliges Ereignis erfassen**: Stellen Sie den Trigger auf **Single**, steigende Flanke, und drücken Sie dann einen Taster in Ihrer Schaltung.
- **Zwei Signale vergleichen**: Fügen Sie zwei Kanäle hinzu — z. B. die A- und B-Ausgänge eines Encoders — und beobachten Sie deren Phasenbeziehung.

----- END PAGE -----
