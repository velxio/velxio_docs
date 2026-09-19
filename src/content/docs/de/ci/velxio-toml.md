---
title: velxio.toml
description: "Die Projektdatei, die Velxio CI liest – Board, Firmware, Schaltkreis und Szenario – mit den Boards, die CI heute ausführt, und wie jeder Pfad aufgelöst wird."
sidebar:
  order: 3
---

`velxio.toml` teilt der CLI mit, was ausgeführt werden soll: welches Board,
welche kompilierte Firmware, welcher Schaltkreis und welches Szenario. Sie
liegt in dem Verzeichnis, auf das du die CLI richtest. Jeder Pfad darin ist
relativ zur Datei selbst, und Vorwärtsschrägstriche funktionieren auf jedem
Betriebssystem.

```toml
[velxio]
version = 1                      # required
board = "esp32-s3"               # Velxio board kind
firmware = "build/app.bin"       # .hex | .bin | .uf2 | merged ESP32 image
diagram = "diagram.json"         # Wokwi-format circuit (the default when present)
scenario = "test.yaml"           # default scenario; --scenario overrides it
```

`velxio-cli init --board arduino-uno` schreibt eine beginnende `velxio.toml`
und eine `diagram.json` mit einem Board darin.

## Schlüssel

| Schlüssel      | Bedeutung                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | muss `1` sein.                                                                                                                               |
| `board`        | die Velxio-Board-Art (Tabelle unten). Optional, wenn das Diagramm oder die `.vlx` das Board bereits benennt; wenn beides vorhanden ist, müssen sie übereinstimmen. |
| `firmware`     | das kompilierte Image: `.hex`, `.bin`, `.uf2` oder ein zusammengeführtes ESP32-Flash-Image.                                                  |
| `flasher_args` | eine ESP-IDF `build/flasher_args.json` anstelle von `firmware`. Die beiden schließen sich gegenseitig aus.                                   |
| `elf`          | eine ELF, die verwendet wird, wenn `firmware` fehlt. Wird für AVR- und RP2040-Boards konvertiert.                                            |
| `diagram`      | der Schaltkreis im `diagram.json`-Format von Wokwi.                                                                                          |
| `project`      | ein Velxio-`.vlx`-Projektexport. Hat Vorrang vor `diagram`.                                                                                  |
| `scenario`     | das standardmäßig auszuführende Szenario-YAML. Siehe [Szenarien](/docs/de/ci/scenarios/).                                                       |
| `language`     | `arduino`. `micropython` wird mit Exit 2 abgelehnt – CI führt nur kompilierte Firmware aus.                                                  |

Nichts wird stillschweigend ignoriert. Ein Schlüssel, den die CLI nicht
kennt, ist eine Warnung; eine Funktion, die noch nicht gebaut ist, lässt den
Lauf mit `feature_unsupported` fehlschlagen, anstatt stillschweigend ein
anderes Projekt auszuführen als das, das du geschrieben hast. `[[chip]]`
(benutzerdefinierte Chips) ist eines davon: es wird heute abgelehnt, mit
Angabe der Quelldatei.

## Boards, die CI heute ausführt

Der Server entscheidet, nicht die CLI. Sechsunddreißig Arten laufen jetzt –
jedes Board mit einer In-Browser-Engine, jedes einzelne bewiesen durch das
Booten echter Firmware.

### AVR

| Art | Board | `diagram.json`-Typ | Firmware |
| ---- | ----- | ------------------- | -------- |
| `arduino-uno` | Arduino Uno | `wokwi-arduino-uno` | Intel HEX |
| `arduino-nano` | Arduino Nano | `wokwi-arduino-nano` | Intel HEX |
| `arduino-mega` | Arduino Mega | `wokwi-arduino-mega` | Intel HEX |
| `attiny85` | ATtiny85 | `wokwi-attiny85` | Intel HEX |

### RP2040 und RP2350

| Art | Board | `diagram.json`-Typ | Firmware |
| ---- | ----- | ------------------- | -------- |
| `raspberry-pi-pico` | Raspberry Pi Pico | `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | Flash-Image |
| `pi-pico-w` | Raspberry Pi Pico W | `board-pi-pico-w` | Flash-Image |
| `xiao-rp2040` | XIAO RP2040 | `board-velxio-xiao-rp2040` | Flash-Image |
| `xiao-rp2350` | XIAO RP2350 | `board-velxio-xiao-rp2350` | Flash-Image |
| `pimoroni-pico-plus-2w` | Pimoroni Pico Plus 2 W | `board-velxio-pimoroni-pico-plus-2w` | Flash-Image |
| `badger-2350` | Pimoroni Badger 2350 | `board-velxio-badger-2350` | Flash-Image |
| `stellar-unicorn` | Pimoroni Stellar Unicorn | `board-velxio-stellar-unicorn` | Flash-Image |

### XIAO ARM

| Art | Board | `diagram.json`-Typ | Firmware |
| ---- | ----- | ------------------- | -------- |
| `xiao-nrf52840-sense` | XIAO nRF52840 Sense | `board-velxio-xiao-nrf52840-sense` | Intel HEX |
| `xiao-samd21` | XIAO SAMD21 | `board-velxio-xiao-samd21` | Intel HEX |
| `xiao-ra4m1` | XIAO RA4M1 | `board-velxio-xiao-ra4m1` | Intel HEX |
| `xiao-mg24-sense` | XIAO MG24 Sense | `board-velxio-xiao-mg24-sense` | Intel HEX |
| `xiao-nrf54l15-sense` | XIAO nRF54L15 Sense | `board-velxio-xiao-nrf54l15-sense` | Intel HEX |

### ESP32

| Art | Board | `diagram.json`-Typ | Firmware |
| ---- | ----- | ------------------- | -------- |
| `esp32` | ESP32 DevKit v1 | `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | zusammengeführtes ESP32-Image |
| `esp32-s3` | ESP32-S3 DevKitC-1 | `board-esp32-s3-devkitc-1` | zusammengeführtes ESP32-Image |
| `esp32-c3` | ESP32-C3 DevKitM-1 | `board-esp32-c3-devkitm-1` | zusammengeführtes ESP32-Image |
| `esp32-c6` | ESP32-C6 DevKitC-1 | `board-esp32-c6-devkitc-1` | zusammengeführtes ESP32-Image |
| `esp32-devkit-c-v4` | ESP32 DevKitC v4 | `board-esp32-devkit-c-v4` | zusammengeführtes ESP32-Image |
| `esp32-cam` | ESP32-CAM | `board-esp32-cam` | zusammengeführtes ESP32-Image |
| `wemos-lolin32-lite` | WEMOS LOLIN32 Lite | `board-wemos-lolin32-lite` | zusammengeführtes ESP32-Image |
| `xiao-esp32-s3` | XIAO ESP32-S3 | `board-xiao-esp32-s3` | zusammengeführtes ESP32-Image |
| `arduino-nano-esp32` | Arduino Nano ESP32 | `board-arduino-nano-esp32` | zusammengeführtes ESP32-Image |
| `xiao-esp32-c3` | XIAO ESP32-C3 | `board-xiao-esp32-c3` | zusammengeführtes ESP32-Image |
| `aitewinrobot-esp32c3-supermini` | ESP32-C3 SuperMini | `board-aitewinrobot-esp32c3-supermini` | zusammengeführtes ESP32-Image |
| `xiao-esp32-c6` | XIAO ESP32-C6 | `board-xiao-esp32-c6` | zusammengeführtes ESP32-Image |
| `esp32-p4` | ESP32-P4 Function EV | `board-esp32-p4-function-ev` | zusammengeführtes ESP32-Image |
| `m5stack-core` | M5Stack Core | `board-velxio-m5stack-core` | zusammengeführtes ESP32-Image |
| `esp32-c3-lcdkit` | ESP32-C3-LCDkit | `board-velxio-esp32-c3-lcdkit` | zusammengeführtes ESP32-Image |
| `cardputer-adv` | M5Stack Cardputer ADV | `board-velxio-cardputer-adv` | zusammengeführtes ESP32-Image |
| `xiao-esp32s3-sense` | XIAO ESP32-S3 Sense | `board-velxio-xiao-esp32s3-sense` | zusammengeführtes ESP32-Image |
| `esp-vocat` | ESP-VoCat | `board-velxio-esp-vocat` | zusammengeführtes ESP32-Image |
| `esp32-s3-eye` | ESP32-S3-EYE | `board-velxio-esp32-s3-eye` | zusammengeführtes ESP32-Image |
| `esp-sensairshuttle` | ESP-SensAirShuttle | `board-velxio-esp-sensairshuttle` | zusammengeführtes ESP32-Image |

Jedes von ihnen kann im Diagramm auch als `board-velxio-<kind>` geschrieben
werden, zum Beispiel `board-velxio-esp32-c6`; die Boards ohne eigenen
Wokwi-Typ haben keine andere Schreibweise.

`velxio-cli boards` gibt die aktuelle Liste mit dem Status jedes Boards,
seinen `diagram.json`-Typen und den akzeptierten Firmware-Formaten aus.

:::caution
Was übrig bleibt, läuft im Editor, aber noch nicht in CI: die STM32-Boards
(sie brauchen die QEMU-Lane), die Raspberry-Pi- und UNIHIKER-Boards, das
ESP32-P4-Preview-Devkit und die DFRobot-Familie, die noch hinter ihrem
Launch-Flag steht. Jedes wird vor dem Start des Laufs abgelehnt, mit
`board_not_supported_in_ci` und der Phase, für die es geplant ist. Nichts
wird berechnet, und kein benachbartes Board wird stillschweigend
ersetzt.
:::

Pico W läuft, aber CI hat kein Netzwerk: WiFi und Sockets verbinden sich
nie, und der Lauf trägt eine `no_network`-Warnung.

## Wie Pfade aufgelöst werden

- **Konfigurationsdatei:** `velxio.toml`, dann `wokwi.toml`, dann genau
  eine `*.vlx` im Verzeichnis. Keine davon ist Exit 2.
- **Schaltkreis:** `--project-file`, dann `[velxio] project`, dann
  `--diagram-file`, dann `[velxio] diagram`, dann `diagram.json` neben
  der Konfigurationsdatei.
- **Firmware:** `--firmware`, dann `--elf`, dann `[velxio] firmware` oder
  `flasher_args`, dann `[velxio] elf`, dann `[wokwi] firmware`, dann
  `[wokwi] elf`.
- **Board:** `[velxio] board`, dann der Board-Teil des Diagramms (oder das
  aktive Board der `.vlx`).

Relative Pfade, die auf der Kommandozeile angegeben werden, werden gegen
das Projektverzeichnis aufgelöst, nicht gegen das Arbeitsverzeichnis deiner
Shell.

## diagram.json

Wokwis Format, so gelesen wie es ist: `version: 1`, `parts` aus
`{id, type, left, top, attrs, rotate, hide}` und `connections` aus
`[from, to, color, path]`. Die Part-IDs im Diagramm sind die IDs, die deine
Szenarioschritte verwenden.

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

Parts sind die `wokwi-*`-Elemente (`wokwi-led`, `wokwi-pushbutton`,
`wokwi-dht22` und so weiter). Ein Part-Typ, den die CLI nicht erkennt, ist
eine Warnung, kein Fehler: der Server entscheidet, und Parts, die er nicht
simulieren kann, werden per ID gemeldet statt stillschweigend verworfen.

## .vlx

Ein aus dem Velxio-Editor exportiertes Projekt (`format: "velxio-project"`,
`version: 1`) kann anstelle eines Diagramms der Schaltkreis sein. Lege die
einzelne `.vlx` in das Verzeichnis oder benenne sie mit `project =` oder
`--project-file`. Das primäre Board des Exports ist das Board des Laufs; die
Firmware kommt weiterhin aus der toml oder aus `--firmware`.

## Limits

| was                        | Obergrenze                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| Firmware pro Board         | 16 MiB                                                                                             |
| alle hochgeladenen Dateien pro Lauf | 20 MiB                                                                                     |
| Schaltkreis                | 300 Parts, 2.000 Drähte                                                                            |
| Szenario                   | 200 Schritte, 20 Screenshots, 512 Bytes pro `wait-serial`-Text                                     |
| `--timeout`                | die Obergrenze deines Plans (5 Min bei Maker, 10 Min bei Pro) und nie mehr als die Minuten, die dir bleiben |

Ein `--timeout` über der Obergrenze ist kein Fehler: er wird begrenzt, und
der Lauf meldet eine `timeout_clamped`-Warnung mit dem Budget, das er
tatsächlich bekommen hat.

## Prüfe es, bevor du Minuten ausgibst

```bash
velxio-cli lint .
```

`lint` braucht kein Token und kein Netzwerk. Es parst die toml, löst jeden
Pfad auf, prüft, ob die Dateien existieren und in die Obergrenzen passen,
prüft, ob Part-IDs eindeutig sind und Verbindungen existierende Parts
benennen, prüft, ob das Board eines ist, das CI ausführt, prüft, ob das
Firmware-Format zur Board-Familie passt, und prüft, ob jeder Szenarioschritt
bekannt ist, seine Felder hat, existierende Parts benennt und seine
Dauern parst. Die meisten `exit 2`-Fehler sind hier billiger zu finden.
