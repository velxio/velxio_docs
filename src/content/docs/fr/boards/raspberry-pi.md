---
title: Raspberry Pi (Linux)
description: Cartes Raspberry Pi Linux complètes — de la Zero à la Pi 5 — avec un vrai shell, GPIO et Python.
sidebar:
  order: 7
  badge: PRO
---

La famille Linux Raspberry Pi démarre un **système Raspberry Pi OS complet**
dans le cloud et vous donne accès au terminal — ce ne sont pas des
simulateurs de microcontrôleurs, mais de véritables ordinateurs.

| Carte                         | Profil CPU           |
| ----------------------------- | -------------------- |
| **Raspberry Pi Zero / 1 / 2** | Classe ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53           |
| **Raspberry Pi 4**            | Cortex-A72           |
| **Raspberry Pi 5**            | Cortex-A76           |

Toutes les cartes Pi sont **Pro** — voir [plans](/docs/fr/getting-started/plans/).

## Comment ça fonctionne

1. Placez la Pi, appuyez sur **Start** — la console WebSocket se connecte en
   environ une seconde, puis Linux démarre (prévoyez 30 à 60 s pour un shell ;
   une superposition « Booting… » en suit la progression).
2. Vous arrivez dans un vrai shell : `python3`, `pip`, `ls /sys/class/gpio` —
   un véritable espace utilisateur.
3. **Le GPIO est connecté au canvas** : pilotez une LED avec `gpiozero`, lisez
   un bouton, communiquez en I2C/SPI avec les composants que vous avez placés —
   les adaptateurs de protocole font le pont entre le GPIO Linux et le circuit
   simulé.
4. Un **panneau de système de fichiers virtuel** téléverse vos scripts et
   fichiers dans la Pi en cours d'exécution.

```python
from gpiozero import LED
from time import sleep

led = LED(17)
while True:
    led.toggle()
    sleep(0.5)
```

## Le UNIHIKER M10

Le SBC éducatif de DFRobot (une carte Linux avec écran tactile intégré)
fonctionne sur la même infrastructure et est également une carte **Pro** —
vous le trouverez dans le sélecteur à côté de la famille Pi.
