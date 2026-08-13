---
title: Simulation analogique
description: Le moteur de type SPICE derrière le canevas — ce qu'il modélise et comment lire son badge.
sidebar:
  order: 3
---

Velxio ne propage pas uniquement des niveaux numériques hauts et bas. Les parties analogiques
de votre circuit — résistances, diodes, transistors, sources d'alimentation — sont
résolues par un **moteur de type SPICE** qui fonctionne en parallèle avec la simulation numérique,
comme le font les simulateurs mixtes sur ordinateur de bureau.

## Le badge SPICE

Le badge jaune au-dessus du circuit indique le réseau analogique :

- **nets** — le nombre de nœuds électriques que le moteur résout.
- **solve time** — le coût de la dernière analyse.

Lorsqu'une broche de carte pilote un réseau analogique (par exemple, une GPIO à travers une résistance
vers une LED), les fronts de broche du firmware alimentent la résolution analogique, et
les tensions et courants résultants pilotent ce que vous voyez — y compris la luminosité
des LED.

## Ce qui est modélisé

- **Passives** — résistances, potentiomètres et le câblage lui-même.
- **Diodes et LED** — comportement exponentiel réel I/V avec des tensions de seuil
  par couleur.
- **Transistors** — transistors bipolaires (NPN/PNP) avec des modèles de jonction
  appropriés ; les circuits de pilotage de moteur et de relais se comportent de manière réaliste.
- **Familles logiques** — circuits intégrés logiques discrets (74xx et similaires) modélisés avec
  des niveaux précis par famille.
- **Alimentation** — alimentations, régulateurs, batteries dans la catégorie puissance.

Le moteur s'améliore à chaque version ; si un cas analogique exotique
se comporte de manière inattendue, simplifiez le circuit ou demandez dans la communauté.

## Le vérificateur de circuit

Avant une exécution, Velxio vérifie le circuit pour détecter les configurations qui
endommageraient des composants réels — le cas classique étant une LED à travers une alimentation **sans
résistance en série**. En mode électrique, le vérificateur bloque l'exécution et
pointe le problème ; corrigez le câblage et relancez. C'est une fonctionnalité : le
simulateur enseigne l'habitude qui sauve de vraies LED.
