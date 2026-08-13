---
title: Mode de base — chat
description: Un chat d'assistance qui connaît votre projet — erreurs, concepts, questions de câblage.
sidebar:
  order: 2
---

Le mode **Basic** est un chat avec votre projet comme contexte : l'assistant voit
le circuit sur le canevas et le code dans l'éditeur, vous pouvez donc poser des
questions comme vous le feriez à un collègue au poste voisin :

![Le panneau IA en mode Basic](../../../../assets/docs/ai/mode-basic.png)

Bonnes questions en mode Basic :

- _"Pourquoi ma LED ne clignote-t-elle pas ?"_
- _"Que signifie cette erreur de compilation ?"_ (collez-la, ou demandez simplement — il peut
  lire la sortie)
- _"Quelle broche dois-je utiliser pour I2C sur cette carte ?"_
- _"Explique-moi ce que fait ce sketch ligne par ligne."_

## Mécanique

- **Enter** (Entrée) envoie, **Shift+Enter** (Maj+Entrée) crée une nouvelle ligne.
- **Attachez une image** avec le trombone (PNG/JPEG/WebP/GIF jusqu'à 4 Mo) —
  une photo d'une vraie plaque d'essai, un schéma, une capture d'écran.
- **Sessions** : démarrez une nouvelle conversation avec **+**, revisitez les anciennes
  via le bouton d'historique.
- Le compteur en bas affiche votre quota de **cycles** pour la journée et
  le mois — voir [plans](/docs/fr/getting-started/plans/).

Le mode Basic ne fait que parler. Lorsque vous voulez que l'assistant _fasse_ des choses sur le
canevas, passez au [mode Agent](/docs/fr/ai/agent-mode/).
