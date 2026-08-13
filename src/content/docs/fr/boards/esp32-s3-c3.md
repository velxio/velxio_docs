---
title: ESP32-S3 et ESP32-C3
description: "Les nouvelles familles Xtensa S3 et RISC-V C3, y compris les variantes XIAO et Nano."
sidebar:
  order: 4
---

## ESP32-S3 (Xtensa LX7, double cœur)

| Carte                  | Points forts                                              |
| ---------------------- | ------------------------------------------------------- |
| **ESP32-S3 DevKit**    | La carte S3 de référence — accélération IA, beaucoup de RAM |
| **XIAO ESP32-S3**      | Le S3 de la taille d'un pouce de Seeed, 11 broches                         |
| **Arduino Nano ESP32** | S3 dans le format classique Nano, LED RGB               |

## ESP32-C3 (RISC-V, monocœur)

| Carte                  | Points forts                                |
| ---------------------- | ----------------------------------------- |
| **ESP32-C3 DevKit**    | Le C3 de référence — petit, bon marché, WiFi+BLE |
| **XIAO ESP32-C3**      | Le petit C3 de Seeed                           |
| **ESP32-C3 SuperMini** | La carte C3 populaire au format timbre-poste        |

**Langages** pour les deux familles : Arduino C++, MicroPython, ESP-IDF.

## Même plateforme, différents siliciums

Tout ce qui est décrit sur la [page ESP32 classique](/docs/fr/boards/esp32/) s'applique —
le WiFi sur `Velxio-GUEST`, l'ensemble des périphériques, la flash web — mais le firmware
est compilé pour et exécuté sur le bon cœur : Xtensa LX7 pour le S3,
RISC-V pour le C3. Les différences au niveau des instructions sont fidèlement
émulées, c'est pourquoi un binaire S3 et un binaire C3 du même croquis
se comportent exactement comme leurs homologues matériels.

Vous cherchez l'**ESP32-C6**, le **XIAO ESP32S3 Sense** (caméra + micro +
microSD) ou le **XIAO ESP32C6** ? Ce sont des
[cartes Pro](/docs/fr/boards/pro-boards/).
