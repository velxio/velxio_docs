---
title: Compiler et exécuter
description: Ce qui se passe lorsque vous appuyez sur Play — compilation cloud, firmware réel et lecture des erreurs.
sidebar:
  order: 3
---

## Ce que fait Run

**Run** compile le code de la carte active (si nécessaire) et démarre le résultat
sur la carte émulée. Il n'y a pas de « simulation de votre code source » —
Velxio construit un **binaire de firmware réel** avec la chaîne d'outils réelle
(arduino-cli / ESP-IDF / MicroPython) et l'exécute instruction par
instruction.

- **Compile** (Ctrl+B) compile sans exécuter — utile pour vérifier les erreurs
  rapidement.
- **Stop** arrête la simulation ; **Reset** redémarre le firmware depuis le
  début.

## La console de sortie

Le panneau **OUTPUT** en bas à gauche diffuse la compilation : résolution des
bibliothèques, invocations du compilateur, utilisation de la mémoire, et enfin
`Compilation successful`. C'est la même sortie que l'IDE Arduino ou
`idf.py build` vous donnerait.

## Lire les erreurs de compilation

Les erreurs arrivent exactement comme le compilateur les émet, avec le fichier et la ligne :

- `'foo' was not declared in this scope` — faute de frappe ou `#include` manquant.
- `No such file or directory` pour un en-tête — la bibliothèque n'est pas installée ;
  ajoutez-la via **Libraries** ([comment](/docs/fr/programming/libraries/)).
- Erreurs de liaison/section sur de gros croquis — le binaire ne tient pas dans la
  flash de la carte sélectionnée.

Corrigez, appuyez à nouveau sur **Run**. Les compilations après la première sont beaucoup plus rapides grâce à la
mise en cache.

> **Astuce :** collez une erreur de compilation dans l'[assistant IA](/docs/fr/ai/overview/)
> — expliquer les erreurs en contexte est ce que son mode Basic fait de mieux.

## Pendant l'exécution

- Le **point de statut** à côté du nom de la carte dans l'arborescence des fichiers affiche
  Idle / Compiled / Running.
- Le **moniteur série** se connecte automatiquement —
  voir [Moniteur série](/docs/fr/programming/serial-monitor/).
- Interagissez avec le circuit en direct : appuyez sur les boutons, tournez les potentiomètres,
  modifiez les valeurs des capteurs depuis leurs panneaux de contrôle.
