---
title: FAQ
description: Questions fréquemment posées sur Velxio.
sidebar:
  order: 8
---

### Dois-je installer quelque chose ?

Non. Velxio fonctionne entièrement dans le navigateur — l'éditeur, le compilateur (dans le cloud) et la simulation. Un Chrome, Edge ou Firefox récent sur un ordinateur de bureau offre la meilleure expérience.

### Est-ce que mon code est vraiment exécuté ?

Oui. Votre sketch est compilé avec les mêmes chaînes d'outils que celles utilisées par les vraies cartes (arduino-cli, ESP-IDF, MicroPython), et le **vrai binaire** résultant est exécuté par un CPU émulé — pas une interprétation ligne par ligne de votre code source. Journaux de démarrage, particularités de temporisation, comportement des registres : ce que vous voyez est ce que le silicium ferait.

### Velxio est-il gratuit ?

Le simulateur de base est gratuit, y compris le catalogue de cartes ouvert et la galerie d'exemples. Les cartes Pro, l'assistant IA et les projets privés nécessitent un plan payant — voir [plans](/docs/fr/getting-started/plans/).

### Puis-je importer mes projets Wokwi ?

Oui — le bouton **open project** (ouvrir un projet) accepte les archives Wokwi `.zip` ainsi que les fichiers `.vlx` de Velxio. Voir [Enregistrer et ouvrir des projets](/docs/fr/getting-started/projects/).

### Quelles cartes sont prises en charge ?

Arduino UNO/Nano/Mega, la famille ESP32 (classique, S3, C3), Raspberry Pi Pico et Pico W, STM32, Raspberry Pi Linux complet, ATtiny85 et plus — la liste complète avec les détails se trouve dans [Cartes](/docs/fr/boards/overview/).

### Le WiFi fonctionne-t-il dans le simulateur ?

Sur les cartes ESP32, oui — la station simulée s'associe, obtient une IP via DHCP et peut atteindre la passerelle internet pour les projets MQTT/HTTP. Voir [WiFi & IoT](/docs/fr/wifi-iot/overview/).

### Puis-je transférer mon projet sur du matériel réel ?

Oui. Pour les projets ESP32, **web flash** (flashage web) écrit le firmware compilé sur une vraie carte via USB, directement depuis le navigateur. Voir [Web flash](/docs/fr/wifi-iot/overview/).

### Où signaler un bug ou demander une fonctionnalité ?

Via le menu **Help** (aide) de l'éditeur, la communauté [Discord Velxio](https://velxio.dev), ou l'organisation GitHub — selon votre préférence.
