---
title: Cartes prises en charge
description: Toutes les cartes que vous pouvez simuler dans Velxio, par famille.
sidebar:
  order: 1
---

Velxio simule des cartes de huit familles. Certaines s'exécutent entièrement dans votre
navigateur ; les plus grandes s'exécutent sur les émulateurs cloud de Velxio. Vous n'avez rien
de particulier à faire : tout fonctionne dès que vous appuyez sur Play.

| Famille              | Cartes                                                                                                                                                                                              | Langages                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Arduino / AVR        | UNO, Nano, Mega, ATtiny85                                                                                                                                                                           | Arduino C++                                                   |
| ESP32 classique      | ESP32 DevKit, DevKit-C v4, ESP32-CAM, Lolin32 Lite                                                                                                                                                  | Arduino C++, MicroPython, ESP-IDF                             |
| ESP32-S3             | ESP32-S3, XIAO ESP32-S3, Arduino Nano ESP32                                                                                                                                                         | Arduino C++, MicroPython, ESP-IDF                             |
| ESP32-C3             | ESP32-C3, XIAO ESP32-C3, C3 SuperMini                                                                                                                                                               | Arduino C++, MicroPython, ESP-IDF                             |
| RP2040 / RP2350      | Raspberry Pi Pico, Pico W, Badger 2350 (Pro)                                                                                                                                                        | Arduino C++, MicroPython                                      |
| Seeed XIAO           | ESP32S3 Sense, ESP32C6, RP2040, RP2350, nRF52840 Sense, SAMD21, RA4M1, MG24 Sense, nRF54L15 Sense, les cartes IPS Display                                                                           | Arduino C++ (MicroPython sur les modèles ESP32 et RP2040/RP2350) |
| BBC micro:bit        | micro:bit V2, seule ou montée sur sept cartes DFRobot : Maqueen Lite et Lite V5, micro:Driver, micro:IO-BOX, IO Extender, micro:Mate, Robotics & Power IO Extender ([page](/docs/fr/boards/microbit/)) | MicroPython                                                   |
| STM32                | Blue Pill, Black Pill, F4 Discovery, Olimex H405, Netduino                                                                                                                                          | Arduino C++                                                   |
| Raspberry Pi (Linux) | Zero, 1, 2, 3, 4, 5                                                                                                                                                                                 | Python sur un terminal Linux complet                          |

Les familles **STM32** et **Raspberry Pi (Linux)** s'exécutent sur les
serveurs d'émulation de Velxio et nécessitent un forfait payant ; elles portent un badge PRO dans le
sélecteur de composants. Toutes les autres cartes, y compris les cartes de marque comme la
M5Stack Cardputer et la Badger 2350, fonctionnent avec le forfait gratuit. Voir
[forfaits](/docs/fr/getting-started/plans/).

Chaque carte dispose de sa propre page dans cette section, avec son brochage, les
langages pris en charge et ses particularités.
