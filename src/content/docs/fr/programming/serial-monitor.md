---
title: Moniteur série
description: "Consultez la sortie série de votre programme et envoyez-lui des données."
sidebar:
  order: 4
---

Activez le moniteur série avec le bouton **Serial** (Série) de la barre d'outils. Il
s'ouvre sous forme de panneau inférieur, avec **un onglet par carte** du projet :

![Le moniteur série pendant une exécution](../../../../assets/docs/programming/serial-monitor.png)

Tout ce que votre firmware imprime (`Serial.println`, `print` de MicroPython,
le journal de démarrage du ROM) apparaît ici en temps réel — y compris les messages
de démarrage de la puce elle-même, car l'émulateur démarre le vrai firmware.

## Commandes

- **Baud rate** (Débit en bauds) — correspond à votre `Serial.begin(...)` ; 115200 est la valeur habituelle.
- **Autoscroll** (Défilement automatique) — suit la sortie la plus récente ; décochez pour remonter dans l'historique.
- **Clear** (Effacer) — vide le tampon.
- **Hardware serial** (Série matérielle) — indique que l'onglet est connecté à l'UART de la carte.

## Envoi de données

Saisissez du texte dans la **zone de message** en bas et appuyez sur **Send** (Envoyer). Le
sélecteur de fin de ligne (Newline / Carriage return / les deux / aucun) est important pour
les esquisses qui analysent `Serial.read()` — de la même manière que dans le moniteur
de l'IDE Arduino.

Sur les cartes MicroPython, le moniteur série fait également office de **REPL** : arrêtez
votre script avec des interruptions de type Ctrl+C et tapez du code Python en mode interactif.
