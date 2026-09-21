---
title: velxio.toml
description: Il file di progetto che Velxio CI legge (board, firmware, circuito e scenario), con le board che CI esegue oggi e come si risolve ogni percorso.
sidebar:
  order: 3
---

`velxio.toml` indica alla CLI cosa eseguire: quale board, quale firmware
compilato, quale circuito e quale scenario. Si trova nella directory su cui
punti la CLI. Ogni percorso al suo interno è relativo al file stesso, e le
barre in avanti funzionano su ogni sistema operativo.

```toml
[velxio]
version = 1                      # required
board = "esp32-s3"               # Velxio board kind
firmware = "build/app.bin"       # .hex | .bin | .uf2 | merged ESP32 image
diagram = "diagram.json"         # Wokwi-format circuit (the default when present)
scenario = "test.yaml"           # default scenario; --scenario overrides it
```

`velxio-cli init --board arduino-uno` scrive un `velxio.toml` iniziale e un
`diagram.json` con una board al suo interno.

## Chiavi

| chiave         | significato                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | deve essere `1`.                                                                                                                             |
| `board`        | il tipo di board Velxio (tabella sotto). Opzionale quando il diagram o il `.vlx` indicano già la board; se entrambi sono presenti devono concordare. |
| `firmware`     | l'immagine compilata: `.hex`, `.bin`, `.uf2`, oppure un'immagine flash ESP32 unificata.                                                      |
| `flasher_args` | un `build/flasher_args.json` di ESP-IDF al posto di `firmware`. I due sono mutuamente esclusivi.                                             |
| `elf`          | un ELF usato quando `firmware` è assente. Convertito per le board AVR e RP2040.                                                              |
| `diagram`      | il circuito, nel formato `diagram.json` di Wokwi.                                                                                            |
| `project`      | un progetto Velxio `.vlx` esportato. Ha la precedenza su `diagram`.                                                                          |
| `scenario`     | lo scenario YAML da eseguire per impostazione predefinita. Vedi [Scenari](/docs/it/ci/scenarios/).                                              |
| `language`     | `arduino`. `micropython` viene rifiutato con exit 2: CI esegue solo firmware compilato.                                                      |

Nulla viene ignorato in silenzio. Una chiave che la CLI non conosce è un
avviso; una funzionalità non ancora implementata fa fallire l'esecuzione con
`feature_unsupported` invece di eseguire silenziosamente un progetto diverso
da quello che hai scritto. `[[chip]]` (chip personalizzati) è una di queste:
oggi viene rifiutato, con il file sorgente indicato.

## Board che CI esegue oggi

È il server a decidere, non la CLI. Trentasei tipi sono attivi ora: ogni
board con un motore in-browser, ciascuna provata avviando firmware reale.

### AVR

| tipo | board | tipo `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `arduino-uno` | Arduino Uno | `wokwi-arduino-uno` | Intel HEX |
| `arduino-nano` | Arduino Nano | `wokwi-arduino-nano` | Intel HEX |
| `arduino-mega` | Arduino Mega | `wokwi-arduino-mega` | Intel HEX |
| `attiny85` | ATtiny85 | `wokwi-attiny85` | Intel HEX |

### RP2040 e RP2350

| tipo | board | tipo `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `raspberry-pi-pico` | Raspberry Pi Pico | `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | immagine flash |
| `pi-pico-w` | Raspberry Pi Pico W | `board-pi-pico-w` | immagine flash |
| `xiao-rp2040` | XIAO RP2040 | `board-velxio-xiao-rp2040` | immagine flash |
| `xiao-rp2350` | XIAO RP2350 | `board-velxio-xiao-rp2350` | immagine flash |
| `pimoroni-pico-plus-2w` | Pimoroni Pico Plus 2 W | `board-velxio-pimoroni-pico-plus-2w` | immagine flash |
| `badger-2350` | Pimoroni Badger 2350 | `board-velxio-badger-2350` | immagine flash |
| `stellar-unicorn` | Pimoroni Stellar Unicorn | `board-velxio-stellar-unicorn` | immagine flash |

### XIAO ARM

| tipo | board | tipo `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `xiao-nrf52840-sense` | XIAO nRF52840 Sense | `board-velxio-xiao-nrf52840-sense` | Intel HEX |
| `xiao-samd21` | XIAO SAMD21 | `board-velxio-xiao-samd21` | Intel HEX |
| `xiao-ra4m1` | XIAO RA4M1 | `board-velxio-xiao-ra4m1` | Intel HEX |
| `xiao-mg24-sense` | XIAO MG24 Sense | `board-velxio-xiao-mg24-sense` | Intel HEX |
| `xiao-nrf54l15-sense` | XIAO nRF54L15 Sense | `board-velxio-xiao-nrf54l15-sense` | Intel HEX |

### ESP32

| tipo | board | tipo `diagram.json` | firmware |
| ---- | ----- | ------------------- | -------- |
| `esp32` | ESP32 DevKit v1 | `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | immagine ESP32 unificata |
| `esp32-s3` | ESP32-S3 DevKitC-1 | `board-esp32-s3-devkitc-1` | immagine ESP32 unificata |
| `esp32-c3` | ESP32-C3 DevKitM-1 | `board-esp32-c3-devkitm-1` | immagine ESP32 unificata |
| `esp32-c6` | ESP32-C6 DevKitC-1 | `board-esp32-c6-devkitc-1` | immagine ESP32 unificata |
| `esp32-devkit-c-v4` | ESP32 DevKitC v4 | `board-esp32-devkit-c-v4` | immagine ESP32 unificata |
| `esp32-cam` | ESP32-CAM | `board-esp32-cam` | immagine ESP32 unificata |
| `wemos-lolin32-lite` | WEMOS LOLIN32 Lite | `board-wemos-lolin32-lite` | immagine ESP32 unificata |
| `xiao-esp32-s3` | XIAO ESP32-S3 | `board-xiao-esp32-s3` | immagine ESP32 unificata |
| `arduino-nano-esp32` | Arduino Nano ESP32 | `board-arduino-nano-esp32` | immagine ESP32 unificata |
| `xiao-esp32-c3` | XIAO ESP32-C3 | `board-xiao-esp32-c3` | immagine ESP32 unificata |
| `aitewinrobot-esp32c3-supermini` | ESP32-C3 SuperMini | `board-aitewinrobot-esp32c3-supermini` | immagine ESP32 unificata |
| `xiao-esp32c6` | XIAO ESP32-C6 | `board-xiao-esp32-c6` | immagine ESP32 unificata |
| `esp32-p4` | ESP32-P4 Function EV | `board-esp32-p4-function-ev` | immagine ESP32 unificata |
| `m5stack-core` | M5Stack Core | `board-velxio-m5stack-core` | immagine ESP32 unificata |
| `esp32-c3-lcdkit` | ESP32-C3-LCDkit | `board-velxio-esp32-c3-lcdkit` | immagine ESP32 unificata |
| `cardputer-adv` | M5Stack Cardputer ADV | `board-velxio-cardputer-adv` | immagine ESP32 unificata |
| `xiao-esp32s3-sense` | XIAO ESP32-S3 Sense | `board-velxio-xiao-esp32s3-sense` | immagine ESP32 unificata |
| `esp-vocat` | ESP-VoCat | `board-velxio-esp-vocat` | immagine ESP32 unificata |
| `esp32-s3-eye` | ESP32-S3-EYE | `board-velxio-esp32-s3-eye` | immagine ESP32 unificata |
| `esp-sensairshuttle` | ESP-SensAirShuttle | `board-velxio-esp-sensairshuttle` | immagine ESP32 unificata |

Ognuna di esse può anche essere scritta `board-velxio-<kind>` nel diagram,
per esempio `board-velxio-esp32-c6`; le board che non hanno un tipo Wokwi
proprio non hanno altre grafie.

`velxio-cli boards` stampa l'elenco aggiornato con lo stato di ogni board,
i suoi tipi `diagram.json` e i formati firmware che accetta.

:::caution
Ciò che resta viene eseguito nell'editor ma non ancora in CI: le board
STM32 (richiedono la corsia QEMU), le board Raspberry Pi e UNIHIKER, il
devkit di anteprima ESP32-P4 e la famiglia DFRobot, ancora dietro il suo
flag di lancio. Ognuna viene rifiutata prima che l'esecuzione inizi, con
`board_not_supported_in_ci` e la fase in cui è prevista. Nulla viene
fatturato, e nessuna board vicina viene sostituita in silenzio.
:::

Pico W viene eseguita, ma CI non ha rete: WiFi e socket non si connettono
mai, e l'esecuzione porta un avviso `no_network`.

## Come si risolvono i percorsi

- **File di configurazione:** `velxio.toml`, poi `wokwi.toml`, poi esattamente un
  `*.vlx` nella directory. Se non ce n'è nessuno, exit 2.
- **Circuito:** `--project-file`, poi `[velxio] project`, poi
  `--diagram-file`, poi `[velxio] diagram`, poi `diagram.json` accanto
  al file di configurazione.
- **Firmware:** `--firmware`, poi `--elf`, poi `[velxio] firmware` o
  `flasher_args`, poi `[velxio] elf`, poi `[wokwi] firmware`, poi
  `[wokwi] elf`.
- **Board:** `[velxio] board`, poi la parte board del diagram (o la
  board attiva del `.vlx`).

I percorsi relativi indicati sulla riga di comando si risolvono rispetto
alla directory del progetto, non rispetto alla directory di lavoro della
tua shell.

## diagram.json

Il formato di Wokwi, letto così com'è: `version: 1`, `parts` di
`{id, type, left, top, attrs, rotate, hide}` e `connections` di
`[from, to, color, path]`. Gli id delle parti nel diagram sono gli id che
i tuoi passi di scenario usano.

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

Le parti sono gli elementi `wokwi-*` (`wokwi-led`, `wokwi-pushbutton`,
`wokwi-dht22`, e così via). Un tipo di parte che la CLI non riconosce è un
avviso, non un errore: è il server a decidere, e le parti che non può
simulare vengono segnalate per id invece di essere eliminate in silenzio.

## .vlx

Un progetto esportato dall'editor Velxio (`format: "velxio-project"`,
`version: 1`) può essere il circuito al posto di un diagram. Metti l'unico
`.vlx` nella directory, oppure nominalo con `project =` o `--project-file`.
La board primaria dell'esportazione è la board dell'esecuzione; il firmware
proviene comunque dal toml o da `--firmware`.

## Limiti

| cosa                          | limite                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| firmware per board            | 16 MiB                                                                                              |
| tutti i file caricati per esecuzione | 20 MiB                                                                                       |
| circuito                      | 300 parti, 2.000 fili                                                                               |
| scenario                      | 200 passi, 20 screenshot, 512 byte per testo di `wait-serial`                                       |
| `--timeout`                   | il tetto del tuo piano (5 min su Maker, 10 min su Pro), e mai più dei minuti che ti restano         |

Un `--timeout` sopra il tetto non è un errore: viene limitato, e
l'esecuzione riporta un avviso `timeout_clamped` con il budget che ha
effettivamente ricevuto.

## Verificalo prima di spendere minuti

```bash
velxio-cli lint .
```

`lint` non richiede token né rete. Analizza il toml, risolve ogni
percorso, verifica che i file esistano e rispettino i limiti, controlla che
gli id delle parti siano univoci e che le connessioni nominino parti
esistenti, controlla che la board sia una di quelle eseguite da CI, controlla
che il formato del firmware corrisponda alla famiglia della board e verifica
che ogni passo dello scenario sia noto, abbia i suoi campi, nomini parti
esistenti e analizzi le sue durate. La maggior parte dei fallimenti `exit 2`
è più economica da trovare qui.
