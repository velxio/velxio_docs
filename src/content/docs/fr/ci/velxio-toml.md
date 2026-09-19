---
title: velxio.toml
description: Le fichier de projet que lit Velxio CI - carte, firmware, circuit et scénario - avec les cartes que CI exécute aujourd'hui et la façon dont chaque chemin est résolu.
sidebar:
  order: 3
---

`velxio.toml` indique à la CLI quoi exécuter : quelle carte, quel firmware
compilé, quel circuit et quel scénario. Il se trouve dans le répertoire vers
lequel vous pointez la CLI. Chaque chemin qu'il contient est relatif au
fichier lui-même, et les barres obliques fonctionnent sur tous les OS.

```toml
[velxio]
version = 1                      # required
board = "esp32-s3"               # Velxio board kind
firmware = "build/app.bin"       # .hex | .bin | .uf2 | merged ESP32 image
diagram = "diagram.json"         # Wokwi-format circuit (the default when present)
scenario = "test.yaml"           # default scenario; --scenario overrides it
```

`velxio-cli init --board arduino-uno` écrit un `velxio.toml` de départ et un
`diagram.json` contenant une seule carte.

## Clés

| clé            | signification                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | doit valoir `1`.                                                                                                                             |
| `board`        | le type de carte Velxio (tableau ci-dessous). Facultatif lorsque le diagramme ou le `.vlx` nomme déjà la carte ; si les deux sont présents, ils doivent concorder. |
| `firmware`     | l'image compilée : `.hex`, `.bin`, `.uf2`, ou une image flash ESP32 fusionnée.                                                               |
| `flasher_args` | un `build/flasher_args.json` ESP-IDF au lieu de `firmware`. Les deux sont mutuellement exclusifs.                                            |
| `elf`          | un ELF utilisé lorsque `firmware` est absent. Converti pour les cartes AVR et RP2040.                                                        |
| `diagram`      | le circuit, au format `diagram.json` de Wokwi.                                                                                               |
| `project`      | un export de projet Velxio `.vlx`. Prioritaire sur `diagram`.                                                                                |
| `scenario`     | le YAML de scénario à exécuter par défaut. Voir [Scénarios](/docs/fr/ci/scenarios/).                                                            |
| `language`     | `arduino`. `micropython` est refusé avec le code de sortie 2 - CI n'exécute que du firmware compilé.                                         |

Rien n'est ignoré en silence. Une clé que la CLI ne connaît pas est un
avertissement ; une fonctionnalité qui n'est pas encore implémentée fait
échouer l'exécution avec `feature_unsupported` au lieu d'exécuter
discrètement un projet différent de celui que vous avez écrit. `[[chip]]`
(puces personnalisées) en fait partie : c'est refusé aujourd'hui, avec le
fichier source nommé.

## Cartes que CI exécute aujourd'hui

C'est le serveur qui décide, pas la CLI. Trente-six types fonctionnent
aujourd'hui — chaque carte disposant d'un moteur dans le navigateur, chacune
prouvée en démarrant un vrai firmware.

### AVR

| type | carte | type `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `arduino-uno` | Arduino Uno | `wokwi-arduino-uno` | Intel HEX |
| `arduino-nano` | Arduino Nano | `wokwi-arduino-nano` | Intel HEX |
| `arduino-mega` | Arduino Mega | `wokwi-arduino-mega` | Intel HEX |
| `attiny85` | ATtiny85 | `wokwi-attiny85` | Intel HEX |

### RP2040 et RP2350

| type | carte | type `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `raspberry-pi-pico` | Raspberry Pi Pico | `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | image flash |
| `pi-pico-w` | Raspberry Pi Pico W | `board-pi-pico-w` | image flash |
| `xiao-rp2040` | XIAO RP2040 | `board-velxio-xiao-rp2040` | image flash |
| `xiao-rp2350` | XIAO RP2350 | `board-velxio-xiao-rp2350` | image flash |
| `pimoroni-pico-plus-2w` | Pimoroni Pico Plus 2 W | `board-velxio-pimoroni-pico-plus-2w` | image flash |
| `badger-2350` | Pimoroni Badger 2350 | `board-velxio-badger-2350` | image flash |
| `stellar-unicorn` | Pimoroni Stellar Unicorn | `board-velxio-stellar-unicorn` | image flash |

### XIAO ARM

| type | carte | type `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `xiao-nrf52840-sense` | XIAO nRF52840 Sense | `board-velxio-xiao-nrf52840-sense` | Intel HEX |
| `xiao-samd21` | XIAO SAMD21 | `board-velxio-xiao-samd21` | Intel HEX |
| `xiao-ra4m1` | XIAO RA4M1 | `board-velxio-xiao-ra4m1` | Intel HEX |
| `xiao-mg24-sense` | XIAO MG24 Sense | `board-velxio-xiao-mg24-sense` | Intel HEX |
| `xiao-nrf54l15-sense` | XIAO nRF54L15 Sense | `board-velxio-xiao-nrf54l15-sense` | Intel HEX |

### ESP32

| type | carte | type `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `esp32` | ESP32 DevKit v1 | `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | image ESP32 fusionnée |
| `esp32-s3` | ESP32-S3 DevKitC-1 | `board-esp32-s3-devkitc-1` | image ESP32 fusionnée |
| `esp32-c3` | ESP32-C3 DevKitM-1 | `board-esp32-c3-devkitm-1` | image ESP32 fusionnée |
| `esp32-c6` | ESP32-C6 DevKitC-1 | `board-esp32-c6-devkitc-1` | image ESP32 fusionnée |
| `esp32-devkit-c-v4` | ESP32 DevKitC v4 | `board-esp32-devkit-c-v4` | image ESP32 fusionnée |
| `esp32-cam` | ESP32-CAM | `board-esp32-cam` | image ESP32 fusionnée |
| `wemos-lolin32-lite` | WEMOS LOLIN32 Lite | `board-wemos-lolin32-lite` | image ESP32 fusionnée |
| `xiao-esp32-s3` | XIAO ESP32-S3 | `board-xiao-esp32-s3` | image ESP32 fusionnée |
| `arduino-nano-esp32` | Arduino Nano ESP32 | `board-arduino-nano-esp32` | image ESP32 fusionnée |
| `xiao-esp32-c3` | XIAO ESP32-C3 | `board-xiao-esp32-c3` | image ESP32 fusionnée |
| `aitewinrobot-esp32c3-supermini` | ESP32-C3 SuperMini | `board-aitewinrobot-esp32c3-supermini` | image ESP32 fusionnée |
| `xiao-esp32c6` | XIAO ESP32-C6 | `board-xiao-esp32-c6` | image ESP32 fusionnée |
| `esp32-p4` | ESP32-P4 Function EV | `board-esp32-p4-function-ev` | image ESP32 fusionnée |
| `m5stack-core` | M5Stack Core | `board-velxio-m5stack-core` | image ESP32 fusionnée |
| `esp32-c3-lcdkit` | ESP32-C3-LCDkit | `board-velxio-esp32-c3-lcdkit` | image ESP32 fusionnée |
| `cardputer-adv` | M5Stack Cardputer ADV | `board-velxio-cardputer-adv` | image ESP32 fusionnée |
| `xiao-esp32s3-sense` | XIAO ESP32-S3 Sense | `board-velxio-xiao-esp32s3-sense` | image ESP32 fusionnée |
| `esp-vocat` | ESP-VoCat | `board-velxio-esp-vocat` | image ESP32 fusionnée |
| `esp32-s3-eye` | ESP32-S3-EYE | `board-velxio-esp32-s3-eye` | image ESP32 fusionnée |
| `esp-sensairshuttle` | ESP-SensAirShuttle | `board-velxio-esp-sensairshuttle` | image ESP32 fusionnée |

Chacune d'elles peut aussi être écrite `board-velxio-<kind>` dans le
diagramme, par exemple `board-velxio-esp32-c6` ; les cartes qui n'ont pas de
type Wokwi propre n'ont pas d'autre orthographe.

`velxio-cli boards` affiche la liste à jour avec le statut de chaque carte,
ses types `diagram.json` et les formats de firmware qu'elle accepte.

:::caution
Ce qui reste s'exécute dans l'éditeur mais pas encore dans CI : les cartes
STM32 (elles nécessitent la voie QEMU), les cartes Raspberry Pi et UNIHIKER,
le devkit de prévisualisation ESP32-P4, et la famille DFRobot, qui est
encore derrière son indicateur de lancement. Chacune est refusée avant le
début de l'exécution, avec `board_not_supported_in_ci` et la phase à
laquelle elle est prévue. Rien n'est facturé, et aucune carte proche n'est
substituée en silence.
:::

Pico W fonctionne, mais CI n'a pas de réseau : WiFi et les sockets ne se
connectent jamais, et l'exécution porte un avertissement `no_network`.

## Comment les chemins sont résolus

- **Fichier de configuration :** `velxio.toml`, puis `wokwi.toml`, puis
  exactement un `*.vlx` dans le répertoire. Aucun d'entre eux ne donne le
  code de sortie 2.
- **Circuit :** `--project-file`, puis `[velxio] project`, puis
  `--diagram-file`, puis `[velxio] diagram`, puis `diagram.json` à côté du
  fichier de configuration.
- **Firmware :** `--firmware`, puis `--elf`, puis `[velxio] firmware` ou
  `flasher_args`, puis `[velxio] elf`, puis `[wokwi] firmware`, puis
  `[wokwi] elf`.
- **Carte :** `[velxio] board`, puis la partie carte du diagramme (ou la
  carte active du `.vlx`).

Les chemins relatifs donnés sur la ligne de commande sont résolus par
rapport au répertoire du projet, et non par rapport au répertoire de travail
de votre shell.

## diagram.json

Le format de Wokwi, lu tel quel : `version: 1`, `parts` de
`{id, type, left, top, attrs, rotate, hide}` et `connections` de
`[from, to, color, path]`. Les identifiants de pièces dans le diagramme sont
les identifiants qu'utilisent vos étapes de scénario.

```json
{
  "version": 1,
  "parts": [
    {
      "type": "wokwi-arduino-uno",
      "id": "uno",
      "top": 0,
      "left": 0,
      "attrs": {}
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": -40,
      "left": 300,
      "attrs": { "value": "220" }
    },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": -100,
      "left": 420,
      "attrs": { "color": "red" }
    }
  ],
  "connections": [
    ["uno:13", "r1:1", "green", ["v0"]],
    ["r1:2", "led1:A", "green", ["v0"]],
    ["led1:C", "uno:GND.1", "black", ["v0"]]
  ]
}
```

Les pièces sont les éléments `wokwi-*` (`wokwi-led`, `wokwi-pushbutton`,
`wokwi-dht22`, etc.). Un type de pièce que la CLI ne reconnaît pas est un
avertissement, pas une erreur : c'est le serveur qui décide, et les pièces
qu'il ne peut pas simuler sont signalées par identifiant plutôt que
supprimées en silence.

## .vlx

Un projet exporté depuis l'éditeur Velxio (`format: "velxio-project"`,
`version: 1`) peut tenir lieu de circuit à la place d'un diagramme. Placez
l'unique `.vlx` dans le répertoire, ou nommez-le avec `project =` ou
`--project-file`. La carte principale de l'export est la carte de
l'exécution ; le firmware provient toujours du toml ou de `--firmware`.

## Limites

| élément                          | plafond                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| firmware par carte               | 16 MiB                                                                                             |
| total des fichiers envoyés par exécution | 20 MiB                                                                                     |
| circuit                          | 300 pièces, 2 000 fils                                                                             |
| scénario                         | 200 étapes, 20 captures d'écran, 512 octets par texte `wait-serial`                                |
| `--timeout`                      | le plafond de votre forfait (5 min sur Maker, 10 min sur Pro), et jamais plus que les minutes qu'il vous reste |

Un `--timeout` au-dessus du plafond n'est pas une erreur : il est écrêté, et
l'exécution signale un avertissement `timeout_clamped` avec le budget
réellement accordé.

## Vérifiez-le avant de dépenser des minutes

```bash
velxio-cli lint .
```

`lint` n'a besoin ni de jeton ni de réseau. Il analyse le toml, résout chaque
chemin, vérifie que les fichiers existent et respectent les plafonds, vérifie
que les identifiants de pièces sont uniques et que les connexions nomment des
pièces existantes, vérifie que la carte est bien une carte que CI exécute,
vérifie que le format du firmware correspond à la famille de la carte, et
vérifie que chaque étape de scénario est connue, possède ses champs, nomme
des pièces existantes et analyse correctement ses durées. La plupart des
échecs `exit 2` sont moins coûteux à détecter ici.
