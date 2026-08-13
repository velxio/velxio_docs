---
title: "Projets MQTT et HTTP"
description: "Communiquez avec de vrais courtiers et API depuis votre carte simulée."
sidebar:
  order: 3
---

Avec le [WiFi connecté](/docs/fr/wifi-iot/esp32-wifi/), votre ESP32 simulé
peut exécuter de véritables charges de travail IoT. La galerie d'exemples
comporte toute une catégorie **ESP32 MQTT** prête à ouvrir et à exécuter.

## MQTT

Le flux classique PubSubClient fonctionne sans modification : rejoignez
`Velxio-GUEST`, connectez-vous à un courtier public, publiez et abonnez-vous.
Ouvrez les exemples MQTT de la galerie pour voir :

- la publication de lectures de capteurs sur une minuterie,
- l'abonnement à un sujet et la commande d'une sortie à partir des messages reçus,
- un échange complet de tableau de bord bidirectionnel avec un courtier public.

Comme le courtier est réel, vous pouvez voir les messages de votre carte simulée
arriver sur votre téléphone ou votre ordinateur portable avec n'importe quel client MQTT — et publier en retour vers elle.

## HTTP

`HTTPClient` (Arduino) et `urequests` (MicroPython) fonctionnent avec de
vrais points de terminaison : récupérez une API REST, téléchargez un fichier,
envoyez un webhook. Gardez des charges utiles raisonnables — la puce émulée
a les mêmes limites de RAM que la puce réelle.

## Remarques et limites

- Le point d'accès est **ouvert** (sans mot de passe) et fournit un accès
  Internet NAT — il n'y a aucun accès entrant vers votre carte simulée depuis Internet.
- DNS, TCP, UDP et TLS se comportent comme sur le matériel ; les poignées de main
  TLS lourdes coûtent du temps CPU émulé réel, attendez-vous donc à ce qu'elles prennent un moment.
- Si une connexion échoue, vérifiez d'abord le moniteur série — les lignes de
  journal de la pile WiFi (`wifi:connected`, `got ip`) vous indiquent quelle étape
  n'a pas eu lieu.
