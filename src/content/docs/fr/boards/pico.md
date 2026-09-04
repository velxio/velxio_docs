---
title: Raspberry Pi Pico et Pico W
description: Les cartes RP2040 — émulation dans le navigateur avec prise en charge de MicroPython et Arduino.
sidebar:
  order: 5
---

Les cartes RP2040 fonctionnent **dans votre navigateur** avec une émulation
fidèle du double cœur Cortex-M0+.

| Carte                    | Points forts                                |
| ------------------------ | ------------------------------------------- |
| **Raspberry Pi Pico**    | La carte RP2040 standard, 26 GPIO           |
| **Raspberry Pi Pico W**  | La même carte avec l'empreinte du module WiFi |

**Langages :** MicroPython (l'environnement natif du Pico) et Arduino C++
(le noyau earlephilhower).

![Carte Raspberry Pi Pico W sur le canevas Velxio](../../../../assets/docs/boards/pi-pico-w.png)

## Ce qui fonctionne

- GPIO, PWM, ADC, I2C, SPI, UART — et **PIO**, les blocs d'E/S programmables
  signature du RP2040, sur lesquels reposent les exemples NeoPixel et les
  protocoles exotiques.
- Le REPL de MicroPython via le [moniteur série](/docs/fr/programming/serial-monitor/).
- Flasher un vrai Pico depuis le navigateur : la carte passe en mode BOOTSEL et
  la boîte de dialogue écrit le fichier `.uf2` via WebUSB, ou vous téléchargez
  le fichier et le déposez sur le lecteur. Voir [flash web](/docs/fr/wifi-iot/web-flash/).

## Où est le RP2350 ?

Le **Badger 2350** (le badge e-paper RP2350 de Pimoroni) est une
[carte Pro](/docs/fr/boards/pro-boards/) — il démarre le firmware d'usine complet
de BadgeOS, e-paper compris.

## Visuels des cartes et brochages

Le visuel de chaque carte sur le canevas et la carte complète des broches,
générés à partir du simulateur :

[Raspberry Pi Pico](/docs/fr/boards/reference/raspberry-pi-pico/) ·
[Raspberry Pi Pico W](/docs/fr/boards/reference/pi-pico-w/)
