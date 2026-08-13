---
title: Contrôler la simulation
description: Exécuter, arrêter, réinitialiser et interagir avec un circuit en direct.
sidebar:
  order: 6
---

## Exécuter / Arrêter / Réinitialiser

Les trois boutons de transport dans la barre d'outils :

- **Run** (Exécuter) — compile si nécessaire, démarre le firmware, lance le monde.
- **Stop** (Arrêter) — interrompt la simulation. Le circuit conserve son schéma mais
  rien ne s'exécute.
- **Reset** (Réinitialiser) — redémarre le firmware depuis le début sans recompiler.

Le point d'état à côté du nom de la carte dans l'arborescence des fichiers suit l'état :
Inactif, Compilé, En cours d'exécution.

## Interagir pendant l'exécution

Le canevas est actif pendant la simulation :

- **Les boutons et interrupteurs** répondent aux clics.
- **Les potentiomètres, encodeurs et capteurs** exposent des contrôles pour modifier leurs
  valeurs — la température d'un DHT22, le niveau de lumière d'une LDR — et le firmware
  voit le changement immédiatement.
- **Les écrans, LED et moteurs** affichent leur état réel piloté.

Les modifications de propriétés depuis l'[inspecteur de composants](/docs/fr/circuit-editor/part-inspector/)
s'appliquent également en direct.

## Plusieurs cartes

Un projet peut contenir **plusieurs cartes**, chacune avec son propre code, son onglet
série et son état d'exécution — le sélecteur de carte dans la barre d'outils choisit celle
que l'éditeur de code et les boutons de transport ciblent. Les cartes peuvent communiquer
entre elles via des bus câblés, c'est ainsi que fonctionnent les exemples multi-puces.

## Le moteur analogique

L'activité des broches numériques et les composants analogiques sont résolus ensemble : le
**badge SPICE** jaune au-dessus du circuit montre la taille du réseau analogique et le temps
de résolution. Lorsqu'un circuit endommagerait un composant (une LED sans résistance en série,
en mode électrique), le vérificateur le signale avant le début de l'exécution — corrigez le
câblage ou la valeur et exécutez à nouveau.
