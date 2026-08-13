---
title: "WiFi & IoT : vue d'ensemble"
description: "WiFi simulé sur les cartes ESP32, projets MQTT/HTTP et flashage de matériel réel depuis le navigateur."
sidebar:
  order: 1
---

Les cartes ESP32 dans Velxio sont équipées d'un **WiFi simulé** : votre firmware voit un
réseau, s'y associe, obtient une adresse IP via DHCP et peut communiquer avec
internet — le même sketch qui fonctionne sur votre bureau fonctionne dans le simulateur.

Dans cette section :

- **ESP32 WiFi** — comment fonctionne le réseau simulé, quelles puces le prennent en charge,
  et le WiFi depuis Arduino et MicroPython.
- **MQTT et HTTP** — connectez votre carte simulée à de vrais courtiers (brokers) et API.
- **Web flash** — lorsque vous êtes satisfait du projet, flashez-le sur un vrai
  ESP32 via USB directement depuis le navigateur, sans installer de chaîne d'outils.
