---
title: Oscilloscope
description: "Regardez la forme d'onde de n'importe quelle broche en direct — canaux, base de temps et déclenchement."
sidebar:
  order: 2
---

Activez l'oscilloscope avec le bouton **Scope** dans la barre d'outils. Il s'ouvre
comme un panneau inférieur à côté du moniteur série.

## Ajout d'un canal

Cliquez sur **+ Add Channel** et choisissez la broche de la carte à surveiller :

![Ajout d'un canal d'oscilloscope](../../../../assets/docs/instruments/oscilloscope-add-channel.png)

Chaque canal reçoit une couleur et une étiquette (carte + broche). Supprimez-en un avec le petit
**x** sous son étiquette.

## Lecture de la trace

Ici, l'oscilloscope surveille **GPIO2** — la broche de la LED clignotante du
[premier projet](/docs/fr/getting-started/first-project/) :

![Une onde carrée sur l'oscilloscope](../../../../assets/docs/instruments/oscilloscope.png)

## Commandes

| Commande           | Fonction                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Time/div**       | Échelle horizontale, de 0,1 ms à 500 ms par division. Adaptez-la à votre signal : un clignotement de 1 s se lit mieux autour de 100 ms/div ; un PWM de 1 kHz autour de 0,5 ms/div.     |
| **Trigger**        | **Auto** (libre), **Normal** (ne dessine que sur déclenchement) ou **Single** (une seule capture). Choisissez le canal de déclenchement et le front — montant, descendant ou les deux. |
| **Pause / Resume** | Figez l'affichage pour inspecter une forme d'onde.                                                                                                                                     |
| **Clear**          | Efface les traces.                                                                                                                                                                     |

## Ce qu'il faut essayer

- **Mesurer un rapport cyclique PWM** : exécutez un croquis `analogWrite()`, observez la
  broche à 0,5 ms/div, comparez le temps haut par rapport au temps bas.
- **Capturer un événement unique** : réglez le déclencheur sur **Single**, front montant, puis
  appuyez sur un bouton de votre circuit.
- **Comparer deux signaux** : ajoutez deux canaux — par exemple les sorties A et B d'un
  encodeur — et observez leur relation de phase.
