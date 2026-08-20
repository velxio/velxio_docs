---
title: Cartes Pro
description: Le catalogue premium de cartes — M5Stack, Badger 2350, XIAO Sense, ESP32-C6, Galactic Unicorn, UNIHIKER.
sidebar:
  order: 8
---

Les cartes Pro constituent le niveau premium du catalogue : du matériel de marque avec des périphériques intégrés riches, émulé suffisamment en profondeur pour démarrer leur **micrologiciel d'usine**. Elles font partie du catalogue hébergé sur velxio.dev.

:::note[De quel plan ont-elles besoin ?]
**Seule l'UNIHIKER M10 nécessite un plan payant.** Toutes les autres cartes de cette page — M5Stack, Pimoroni, XIAO et le DevKit ESP32-C6 — **fonctionnent avec le plan gratuit**. Les cartes exclusivement payantes sont exactement la famille STM32 et la famille Raspberry Pi Linux (à laquelle appartient l'UNIHIKER). Voir [plans](/docs/fr/getting-started/plans/).
:::

## M5Stack

*Plan gratuit.*

### M5 Cardputer ADV

![M5 Cardputer ADV sur le canevas Velxio](../../../../assets/docs/boards/cardputer-adv.png)

L'ordinateur de poche ESP32-S3 avec clavier et TFT. Démarre le véritable micrologiciel de lancement M5 ; tapez sur le clavier à l'écran, exécutez des applications, utilisez le haut-parleur.

### M5Stack Core

![M5Stack Core sur le canevas Velxio](../../../../assets/docs/boards/m5stack-core.png)

L'ESP32 empilable classique avec TFT 320x240 et trois boutons.

## Pimoroni

*Plan gratuit.*

### Badger 2350

![Pimoroni Badger 2350 sur le canevas Velxio](../../../../assets/docs/boards/badger-2350.png)

Le badge à encre électronique RP2350. Il démarre le **micrologiciel d'usine BadgeOS** complet : naviguez dans le lanceur avec les boutons A/B/C/UP/DOWN, ouvrez les applications horloge, badge et galerie, et observez le rafraîchissement de l'encre électronique comme le fait réellement l'encre électronique.

### Galactic Unicorn

![Pimoroni Galactic Unicorn sur le canevas Velxio](../../../../assets/docs/boards/galactic-unicorn.png)

La matrice de LED RVB 53x11 (583 pixels) pilotée par un Pico 2 W (RP2350) intégré, avec les boutons A/B/C/D et volume/luminosité.

### Pico Plus 2 W

![Pimoroni Pico Plus 2 W sur le canevas Velxio](../../../../assets/docs/boards/pimoroni-pico-plus-2w.png)

La carte RP2350B de Pimoroni au format Pico standard (GP0..GP28 plus alimentation), de sorte que tout câblage Pico s'y adapte directement. GPIO, UART, USB série, I2C et SPI fonctionnent ; le coprocesseur WiFi CYW43 et la PSRAM ne sont pas émulés.

## Seeed Studio XIAO

*Plan gratuit.*

### XIAO ESP32S3 Sense

![XIAO ESP32S3 Sense sur le canevas Velxio](../../../../assets/docs/boards/xiao-esp32s3-sense.png)

Le S3 avec le module caméra, le microphone PDM et la microSD.

### XIAO ESP32C6

![XIAO ESP32C6 sur le canevas Velxio](../../../../assets/docs/boards/xiao-esp32c6.png)

Le C6 RISC-V compatible WiFi 6 au format XIAO.

### XIAO RP2040

![XIAO RP2040 sur le canevas Velxio](../../../../assets/docs/boards/xiao-rp2040.png)

Le XIAO RP2040 avec sa NeoPixel.

## Espressif ESP32-C6

*Plan gratuit.*

![ESP32-C6 DevKit sur le canevas Velxio](../../../../assets/docs/boards/esp32-c6.png)

Le **ESP32-C6 DevKit** — la puce RISC-V WiFi-6, avec le même trio de langages (Arduino / MicroPython / ESP-IDF) que le reste de la famille ESP32.

## DFRobot UNIHIKER M10

*Plan payant requis.*

![DFRobot UNIHIKER M10 sur le canevas Velxio](../../../../assets/docs/boards/unihiker-m10.png)

Un ordinateur monocarte Linux avec écran tactile intégré — documenté avec la [famille Raspberry Pi](/docs/fr/boards/raspberry-pi/), car il partage le flux de travail Linux complet. Comme le reste de cette famille, c'est la seule carte de cette page qui **nécessite un plan payant** pour fonctionner.

---

Les cartes Pro apparaissent dans le [sélecteur de composants](/docs/fr/circuit-editor/placing-components/) avec un **badge PRO** ; les [modèles de démarrage](/docs/fr/getting-started/projects/) incluent des projets prêts à l'emploi pour chacune.

## Illustration des cartes et brochages

L'illustration de chaque carte sur le canevas et la carte complète des broches, générées à partir du simulateur :

[Badger 2350](/docs/fr/boards/reference/badger-2350/) ·
[Galactic Unicorn](/docs/fr/boards/reference/galactic-unicorn/) ·
[Pico Plus 2 W](/docs/fr/boards/reference/pimoroni-pico-plus-2w/) ·
[M5 Cardputer ADV](/docs/fr/boards/reference/cardputer-adv/) ·
[M5Stack Core](/docs/fr/boards/reference/m5stack-core/) ·
[ESP32-C6 DevKit](/docs/fr/boards/reference/esp32-c6/) ·
[XIAO ESP32S3 Sense](/docs/fr/boards/reference/xiao-esp32s3-sense/) ·
[XIAO ESP32C6](/docs/fr/boards/reference/xiao-esp32c6/) ·
[XIAO RP2040](/docs/fr/boards/reference/xiao-rp2040/) ·
[UNIHIKER M10](/docs/fr/boards/reference/unihiker-m10/)
