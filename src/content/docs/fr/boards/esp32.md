---
title: ESP32 (classique)
description: "ESP32 DevKit V1, DevKit-C V4, ESP32-CAM et Wemos Lolin32 Lite."
sidebar:
  order: 3
---

L'ESP32 Xtensa d'origine à double cœur — le cheval de bataille du catalogue, avec
**WiFi et Bluetooth** disponibles dans le simulateur.

| Carte                  | Points forts                                        |
| ---------------------- | ------------------------------------------------- |
| **ESP32 DevKit V1**    | Le devkit standard à 30 broches ; LED intégrée sur GPIO2 |
| **ESP32 DevKit-C V4**  | Devkit officiel Espressif, 38 GPIO                |
| **ESP32-CAM**          | ESP32 + module caméra 2 MP + emplacement microSD         |
| **Wemos Lolin32 Lite** | Compact, empreinte chargeur LiPo                   |

**Langages :** Arduino C++, MicroPython, ESP-IDF — changez avec le
[sélecteur de langage](/docs/fr/programming/languages/) de la barre d'outils.

## Ce qui fonctionne

- **WiFi** : rejoignez `Velxio-GUEST` et accédez à l'internet réel — voir
  [ESP32 WiFi](/docs/fr/wifi-iot/esp32-wifi/).
- **Périphériques** : GPIO, PWM (LEDC), ADC, I2C, SPI, UART, et la
  machinerie de temporisation/interruptions — votre firmware démarre avec le journal ROM réel.
- **ESP32-CAM** expose sa caméra et sa microSD dans les
  panneaux de composants du simulateur.
- **Flash Web** : envoyez le même binaire vers un ESP32 physique via USB —
  [comment](/docs/fr/wifi-iot/web-flash/).

## Remarques

- La première compilation ESP-IDF/Arduino d'une session est la plus lente ; les
  compilations suivantes sont mises en cache.
- L'exemple de clignotement intégré
  ([votre premier projet](/docs/fr/getting-started/first-project/)) cible
  le DevKit V1.
