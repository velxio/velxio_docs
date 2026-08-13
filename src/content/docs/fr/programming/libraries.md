---
title: Utilisation des bibliothèques
description: Recherchez, installez et épinglez des bibliothèques Arduino pour votre projet.
sidebar:
  order: 5
---

Cliquez sur **Libraries** (Bibliothèques) dans la barre d'outils pour rechercher dans le registre des bibliothèques Arduino
et ajouter des bibliothèques à la carte active.

Les bibliothèques installées sont enregistrées dans le fichier **`libraries.json`** de la carte
(visible dans l'arborescence des fichiers), elles voyagent donc avec le projet : toute personne qui
l'ouvre — y compris vous-même plus tard — obtient les mêmes versions résolues au
moment de la compilation. Aucun dossier de bibliothèques par machine à synchroniser.

## Utiliser une bibliothèque

Installez-la, puis faites `#include` comme d'habitude :

```cpp
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
```

Le compilateur cloud récupère les bibliothèques déclarées (ainsi que leurs
dépendances) avant la compilation. Si une compilation échoue avec
`No such file or directory` sur un en-tête, la bibliothèque qui fournit cet
en-tête n'est pas encore déclarée — ajoutez-la via **Libraries**.

## MicroPython

Le firmware MicroPython est livré avec ses modules standard intégrés
(`machine`, `network`, `time`, …). Des modules d'aide en Python pur peuvent être ajoutés
comme fichiers supplémentaires dans l'arborescence des fichiers à côté de `main.py` et importés normalement.

## Les exemples sont pré-câblés

Chaque exemple de la galerie déclare les bibliothèques dont il a besoin — en ouvrir un vous
donne une combinaison éprouvée de code + circuit + versions de bibliothèques, ce qui
en fait de bons points de départ pour vos propres projets.
