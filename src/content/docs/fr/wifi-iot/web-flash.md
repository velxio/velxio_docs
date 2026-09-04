---
title: Flasher du matériel réel depuis le navigateur
description: "Écrivez votre projet compilé sur une carte physique via USB, directement depuis le navigateur, sans outillage installé."
sidebar:
  order: 4
---

Lorsque votre projet fonctionne dans le simulateur, vous pouvez le placer sur une **vraie
carte** sans rien installer : Velxio flashe le firmware compilé
via USB, directement depuis le navigateur.

## Prérequis

- Un navigateur basé sur Chromium (Chrome ou Edge). Le flasheur utilise
  les API Web Serial et WebUSB du navigateur, que Firefox et Safari ne
  fournissent pas. Les cartes de la famille Pico disposent tout de même d'un bouton **Download .uf2** (Télécharger .uf2) (voir ci-dessous).
- Un câble USB compatible données vers votre carte.
- Fermez d'abord tout autre programme utilisant le port (moniteurs série, IDE,
  picotool) : le navigateur nécessite un accès exclusif.

![La boîte de dialogue de flash sélectionnant un port série USB](../../../../assets/docs/wifi-iot/flash-modal.png)

## Flash

1. Cliquez avec le bouton droit sur la carte dans le canevas et choisissez **Flash to real board** (Flasher vers la carte réelle).
2. Cliquez sur **Connect & flash** (Connecter et flasher). Le navigateur demande quel périphérique USB autoriser ;
   sélectionnez votre carte.
3. Velxio utilise la compilation déjà effectuée pour cette carte (le même binaire
   que celui que le simulateur exécutait). Si le code a changé depuis, il recompile
   d'abord et la sortie du compilateur défile dans la boîte de dialogue.
4. Surveillez la barre de progression ; lorsqu'elle se termine, la carte redémarre dans votre
   projet.

La boîte de dialogue choisit le protocole pour la cible :

| Famille | Comment c'est écrit | La carte doit être |
| --- | --- | --- |
| ESP32, S3, C3, C6 | esptool via le port série, le `.bin` fusionné | branchée ; maintenez BOOT si elle ne répond pas |
| Arduino Uno, Nano, Mega, ATtiny85 | STK500 via le bootloader de la carte, le `.hex` | branchée (ATtiny85 : via une Arduino exécutant ArduinoISP) |
| Raspberry Pi Pico, Pico W, Pico 2, cartes Pimoroni RP2040 / RP2350 | PICOBOOT via WebUSB, le `.uf2` construit par picotool | en mode **BOOTSEL** (section suivante) |

## Cartes de la famille Pico : BOOTSEL d'abord

Un RP2040 ou RP2350 est programmé par son bootloader, une personnalité USB
distincte que la puce ne présente qu'en mode **BOOTSEL**. Deux façons d'y
accéder :

- **À la main** : maintenez le bouton BOOTSEL enfoncé tout en branchant la carte, puis
  relâchez-le. La carte se monte comme un lecteur USB nommé `RPI-RP2` (RP2040) ou
  `RP2350`.
- **Depuis la boîte de dialogue** : la boîte de dialogue de flash pour ces cartes dispose d'un
  bouton **Reboot into bootloader over USB** (Redémarrer dans le bootloader via USB). Il fonctionne lorsque la carte
  exécute un sketch construit par Velxio (le cœur Arduino redémarre lors d'une
  ouverture à 1200 bauds) ou MicroPython (le REPL exécute `machine.bootloader()`). Le
  navigateur demande le port série de la carte, la carte se déconnecte puis revient
  en tant que bootloader. Cliquez ensuite sur **Connect & flash** (Connecter et flasher) et sélectionnez le
  périphérique `RP2 Boot` / `RP2350 Boot`.

Deux clics, deux invites d'autorisation : le port série pour le redémarrage et
le périphérique USB pour l'écriture. Une fois la carte en mode BOOTSEL, les flashs ultérieurs
ne nécessitent que la seconde.

La boîte de dialogue refuse une image qui ne correspond pas à la puce qui a répondu
(une compilation RP2350 sur un RP2040, une compilation RISC-V sur une configuration ARM)
avant que quoi que ce soit ne soit effacé, vérifie chaque octet après l'écriture, et
redémarre la carte dans le programme.

### Windows et un RP2040 : installer WinUSB une fois

Le bootloader RP2040 n'inclut pas de descripteur de pilote Windows, le navigateur
ne peut donc pas le revendiquer tant que WinUSB ne lui est pas lié. Configuration unique :

1. Mettez la carte en mode BOOTSEL et branchez-la.
2. Téléchargez et exécutez [Zadig](https://zadig.akeo.ie).
3. Sélectionnez `RP2 Boot (Interface 1)` dans la liste (Options, Lister tous les
   périphériques s'il est masqué), choisissez **WinUSB** comme pilote et cliquez sur
   **Install Driver** (Installer le pilote).

Les cartes RP2350 (Pico 2, Pico 2 W, les Unicorns Pimoroni « Pico 2 W Aboard »,
Badger 2350) ne nécessitent rien : leur bootloader contient le
descripteur et Windows lie WinUSB automatiquement. macOS ne nécessite rien sur
aucune des deux puces.

### Linux : une règle udev

Linux attribue les périphériques USB à root par défaut. Créez
`/etc/udev/rules.d/99-velxio-rp2.rules` avec :

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

puis `sudo udevadm control --reload-rules && sudo udevadm trigger` et
rebranchez la carte. Le port série utilisé pour l'étape de redémarrage nécessite également
l'appartenance habituelle au groupe `dialout`.

### Tout navigateur : télécharger le .uf2

La boîte de dialogue de flash pour une carte de la famille Pico propose toujours **Download .uf2** (Télécharger .uf2)
(sur Firefox et Safari, où le navigateur ne peut pas flasher, c'est toute la
boîte de dialogue). Enregistrez le fichier, mettez la carte en mode BOOTSEL et déposez le fichier sur le
lecteur `RPI-RP2` / `RP2350` : la carte redémarre dans votre sketch dès que
la copie se termine.

### Projets MicroPython sur un Pico

La boîte de dialogue télécharge les fichiers `.py` du projet via le REPL et redémarre
dans `main.py`. MicroPython lui-même doit déjà être sur la carte : c'est
un `.uf2` que vous déposez une fois sur le lecteur BOOTSEL (les cartes Pimoroni sont livrées
avec ; téléchargements sur
[pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases)
et [micropython.org](https://micropython.org/download/)).

## Dépannage

- **« Aucune carte en mode BOOTSEL trouvée »** : le sélecteur de périphérique était vide.
  Utilisez le bouton de redémarrage ou maintenez BOOTSEL enfoncé lors du branchement, puis connectez-vous
  à nouveau.
- **« La carte en mode BOOTSEL est un RP2040 mais ce projet est compilé pour
  RP2350 »** : Pimoroni a vendu les Stellar et Galactic Unicorn avec un Pico W
  (RP2040) jusqu'en janvier 2025 et avec un Pico 2 W (RP2350) depuis. Vérifiez
  l'étiquette sur votre unité et sélectionnez la carte correspondante dans l'éditeur.
- **« Impossible de revendiquer le périphérique USB »** sous Windows avec un RP2040 :
  l'étape Zadig ci-dessus. Sous Linux : la règle udev ci-dessus.
- **Le redémarrage série n'a rien fait** : un sketch compilé avec la pile USB
  désactivée ne peut pas être redémarré via USB. Maintenez BOOTSEL enfoncé lors du branchement.

## Simulez d'abord, flashez ensuite

Cela boucle la boucle qui rend Velxio utile pour un travail réel : itérez
rapidement dans le simulateur (pas de câble, pas d'usure du matériel, réinitialisations
instantanées), puis flashez le même artefact de compilation lorsqu'il se comporte
correctement.
