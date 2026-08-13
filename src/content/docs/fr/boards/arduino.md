---
title: Arduino & AVR
description: Arduino UNO, Nano, Mega 2560 et le ATtiny85 nu.
sidebar:
  order: 2
---

La famille AVR fonctionne **entièrement dans votre navigateur** — démarrage
instantané, sans aller-retour vers le cloud — avec une émulation AVR
précise au cycle près.

| Carte                  | MCU                | Flash  | Notes                                                   |
| ---------------------- | ------------------ | ------ | ------------------------------------------------------- |
| **Arduino UNO**        | ATmega328P, 16 MHz | 32 Ko  | La carte de démarrage par défaut ; 14 broches numériques + 6 analogiques |
| **Arduino Nano**       | ATmega328P, 16 MHz | 32 Ko  | Même puce que l'UNO dans un format adapté aux plaques d'essai |
| **Arduino Mega 2560**  | ATmega2560, 16 MHz | 256 Ko | 54 entrées/sorties numériques, 4 UART — pour les projets gourmands en broches |
| **ATtiny85**           | ATtiny85, 8 MHz    | 8 Ko   | La puce nue DIP à 8 broches, à brancher directement sur une plaque d'essai |

**Langage :** Arduino C++.

## Des détails qui se comportent comme le matériel

- `analogWrite` PWM, minuteries, interruptions (`attachInterrupt`), EEPROM et
  `Serial` à n'importe quel débit en bauds fonctionnent comme sur silicium.
- Le CAN lit ce que le circuit analogique fournit — câblez un diviseur
  potentiométrique et `analogRead` le suit.
- Une gamme de composants classiques de shields (écrans LCD, 74HC595,
  servomoteurs, claviers matriciels) est disponible dans le catalogue avec
  des exemples.

## De bons exemples pour commencer

Le filtre **Arduino Uno** de la galerie en liste des dizaines — compteurs
binaires, écrans OLED, moteurs pas à pas avec pilotes A4988, moniteurs de
batterie. Voir la [galerie d'exemples](/docs/fr/getting-started/examples-gallery/).
