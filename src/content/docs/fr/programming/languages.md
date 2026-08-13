---
title: "Langues — Arduino, MicroPython, ESP-IDF"
description: "Quel langage fonctionne sur quelle carte, et comment changer."
sidebar:
  order: 2
---

Le **sélecteur de langue** dans la barre d'outils change la façon dont le
code de la carte active est écrit et compilé. Changer de langue remplace
l'ensemble des fichiers de l'espace de travail (un `sketch.ino` devient un
`main.py`, et ainsi de suite).

## Arduino C++

La valeur par défaut presque partout : les croquis classiques `setup()` /
`loop()`, compilés avec la véritable chaîne d'outils Arduino pour la cible.
Utilisez le bouton **Libraries** (Bibliothèques) pour ajouter n'importe
quelle bibliothèque Arduino publiée — voir
[Bibliothèques](/docs/fr/programming/libraries/).

Disponible sur toutes les cartes sauf la famille Linux Raspberry Pi.

## MicroPython

Un vrai firmware MicroPython fonctionnant sur la puce émulée — le REPL
fonctionne via le moniteur série, `import machine` et ses amis se
comportent comme sur du matériel réel.

Disponible sur :

- **Raspberry Pi Pico / Pico W** (RP2040)
- **ESP32 classique** — DevKit V1, DevKit-C v4, ESP32-CAM, Lolin32 Lite
- **ESP32-S3** — DevKit, XIAO ESP32-S3, Arduino Nano ESP32
- **ESP32-C3** — DevKit, XIAO ESP32-C3, C3 SuperMini

## ESP-IDF

Des projets ESP-IDF purs (un point d'entrée `app_main()`, des API IDF, pas
de cœur Arduino), compilés avec la même chaîne d'outils ESP-IDF. Pour
quand vous écrivez ce que vous flasheriez en production.

Disponible sur les mêmes cartes de la famille ESP32 que MicroPython
ci-dessus.

## Python sur Linux (Raspberry Pi)

Les cartes Linux Raspberry Pi (de Zero à 5) n'utilisent pas le sélecteur
de langue : elles démarrent un Linux complet et vous travaillez dans un
véritable shell — exécutez Python avec `gpiozero`/`RPi.GPIO` contre le
GPIO simulé, exactement comme sur le Pi physique. Voir les
[pages des cartes](/docs/fr/boards/overview/).
