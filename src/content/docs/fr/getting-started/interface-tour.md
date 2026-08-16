---
title: Visite de l'interface
description: L'éditeur en un coup d'œil — canevas, éditeur de code, barre d'outils, consoles et panneau IA.
sidebar:
  order: 4
---

Voici l'éditeur Velxio avec un projet en cours d'exécution :

![L'éditeur Velxio, annoté par région](../../../../assets/docs/getting-started/first-project-running.png)

## La barre de menu

![La barre de menu Velxio : File, Edit, View, Account, Help](../../../../assets/docs/getting-started/interface-menu-bar.png)

**File · Edit · View · Account · Help** — opérations sur le projet, annuler/rétablir,
visibilité des panneaux, votre compte et votre forfait, et ressources d'aide.

## La barre d'outils

![La barre d'outils de l'éditeur, des boutons de disposition au bouton Add](../../../../assets/docs/getting-started/interface-toolbar.png)

De gauche à droite :

| Contrôle              | Fonction                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| Boutons de disposition | Afficher l'éditeur **Code**, le canevas **Circuit**, ou **Both** côte à côte                              |
| Sélecteur de langage   | **Arduino C++**, **MicroPython** ou **ESP-IDF** — selon la carte, voir [Langages](/docs/fr/programming/languages/) |
| **Compile** (Ctrl+B)   | Compiler sans exécuter                                                                                     |
| **Run**               | Compiler si nécessaire, puis démarrer la simulation                                                        |
| **Stop** / **Reset**   | Arrêter la simulation / redémarrer le firmware depuis le début                                             |
| **Libraries**         | Rechercher et installer des bibliothèques Arduino                                                          |
| Bouton de sortie       | Afficher/masquer la console de sortie du compilateur                                                       |
| Sélecteur de carte     | Carte à laquelle l'éditeur de code et **Run** s'appliquent (les projets peuvent en avoir plusieurs)        |
| **Serial**            | Activer/désactiver le [moniteur série](/docs/fr/programming/serial-monitor/)                                  |
| **Scope**             | Activer/désactiver l'[oscilloscope / analyseur logique](/docs/fr/instruments/oscilloscope/)                   |
| **Add**               | Ouvrir le [sélecteur de composants](/docs/fr/circuit-editor/placing-components/)                              |

## Le panneau d'espace de travail (à gauche)

![Le panneau d'espace de travail avec l'arborescence des fichiers du projet](../../../../assets/docs/getting-started/interface-workspace.png)

L'arborescence des fichiers de votre projet : chaque carte possède ses propres fichiers (`sketch.ino`,
`libraries.json`, tout ce que vous ajoutez). Les icônes au-dessus créent un nouvel
espace de travail à partir d'un [modèle de démarrage](/docs/fr/getting-started/projects/), ouvrent
un fichier de projet et enregistrent.

## Le canevas (au centre)

![Le canevas avec un circuit de clignotement ESP32, le badge SPICE et les commandes de zoom](../../../../assets/docs/getting-started/interface-canvas.png)

C'est là que vit le circuit. Faites défiler pour vous déplacer, utilisez les commandes de zoom en bas à
droite, cliquez sur les pièces pour les sélectionner, faites un clic droit pour ouvrir leur
[inspecteur](/docs/fr/circuit-editor/part-inspector/). Le badge jaune **SPICE**
indique l'état du moteur analogique pour le circuit sélectionné.

## Les consoles (en bas)

![La console de sortie et le moniteur série côte à côte](../../../../assets/docs/programming/serial-monitor.png)

- **Output** — messages du compilateur et du système.
- **Serial monitor** — un onglet par carte en cours d'exécution ; zone de saisie pour envoyer des données
  en retour. Voir [Moniteur série](/docs/fr/programming/serial-monitor/).
- **Oscilloscope** — lorsqu'il est activé. Voir
  [Oscilloscope](/docs/fr/instruments/oscilloscope/).

## Le panneau IA (à droite)

![Le panneau IA avec les onglets Basic, Agent et Tutor et le compteur de crédits](../../../../assets/docs/getting-started/interface-ai-panel.png)

L'assistant dans ses trois modes — **Basic**, **Agent**, **Tutor** — avec
votre quota quotidien restant en bas. Voir
[Assistant IA](/docs/fr/ai/overview/). Réduisez-le avec le bouton fléché lorsque
vous voulez voir tout le canevas.
