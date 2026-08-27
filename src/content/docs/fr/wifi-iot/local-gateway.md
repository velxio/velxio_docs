---
title: Passerelle réseau locale
description: Exécutez velxiogw sur votre machine et la carte simulée rejoint votre réseau réel — LAN, localhost et tout le reste.
sidebar:
  order: 3
---

Par défaut, une carte simulée accède à Internet via la passerelle cloud de
Velxio — mais pas à votre réseau local. La **passerelle réseau locale**
(`velxiogw`) supprime cette limite : un petit programme que vous exécutez sur
votre propre machine, et le trafic de la carte en sort à la place. Votre
broker MQTT, votre Home Assistant, l'API que vous développez sur `localhost` —
tout est accessible depuis le sketch. Un plan Maker active l'appairage.

## Configuration

1. Téléchargez la passerelle pour votre plateforme depuis la
   [dernière version](https://github.com/velxio/velxiogw/releases/latest)
   et exécutez-la :

   ```
   $ ./velxiogw
   velxiogw 0.1.2 — Velxio IoT Network Gateway
     listening on   ws://127.0.0.1:9013
     pairing code   493028
     reach scope    your LAN + localhost + internet
     host alias     host.velxio.internal -> this machine
   ```

2. Dans l'éditeur, ouvrez le **panneau WiFi** (le chevron à côté de l'icône
   WiFi). Le panneau détecte automatiquement la passerelle en cours d'exécution.

3. Saisissez le **code d'appairage** affiché par la passerelle et cliquez sur
   **Connect** (Connecter). Dès la prochaine exécution, la carte est sur votre
   réseau.

La première fois, Chrome demande l'autorisation de laisser la page communiquer
avec un appareil de votre réseau local — cliquez sur **Allow** (Autoriser).
(Safari ne prend actuellement pas en charge cette fonctionnalité ; utilisez
Chrome, Edge ou Firefox.)

## Accéder à votre propre machine

Dans un sketch, le nom d'hôte `host.velxio.internal` résout toujours vers la
machine sur laquelle la passerelle est exécutée :

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://host.velxio.internal:8000/api/reading");
int status = http.GET();
```

Tout autre appareil de votre LAN est accessible par son adresse IP normale ou
son nom d'hôte sans mDNS, exactement comme depuis une carte réelle sur votre
WiFi.

## Remarques

- La passerelle se lie uniquement à votre boucle locale et refuse les
  connexions sans le code d'appairage, donc rien d'autre sur votre réseau — ou
  toute autre page web — ne peut l'utiliser.
- Le trafic via la passerelle locale ne passe jamais par les serveurs de
  Velxio, et est généralement plus rapide car il évite l'aller-retour.
- Le code source est public sur
  [github.com/velxio/velxiogw](https://github.com/velxio/velxiogw) ; les
  binaires sont gratuits à télécharger, et le flux d'appairage dans l'éditeur
  est une fonctionnalité du plan Maker.
- Dans l'application de bureau Velxio, tout cela n'est pas nécessaire : la
  simulation s'exécute déjà sur votre machine, donc la carte est sur votre
  réseau par construction.
