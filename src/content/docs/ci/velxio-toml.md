---
title: velxio.toml
description: The project file Velxio CI reads - board, firmware, circuit and scenario - with the boards CI runs today and how every path resolves.
sidebar:
  order: 3
---

`velxio.toml` tells the CLI what to run: which board, which compiled
firmware, which circuit, and which scenario. It sits in the directory you
point the CLI at. Every path in it is relative to the file itself, and
forward slashes work on every OS.

```toml
[velxio]
version = 1                      # required
board = "esp32-s3"               # Velxio board kind
firmware = "build/app.bin"       # .hex | .bin | .uf2 | merged ESP32 image
diagram = "diagram.json"         # Wokwi-format circuit (the default when present)
scenario = "test.yaml"           # default scenario; --scenario overrides it
```

`velxio-cli init --board arduino-uno` writes a starting `velxio.toml` and a
`diagram.json` with one board in it.

## Keys

| key            | meaning                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | must be `1`.                                                                                                                                 |
| `board`        | the Velxio board kind (table below). Optional when the diagram or the `.vlx` already names the board; when both are present they must agree. |
| `firmware`     | the compiled image: `.hex`, `.bin`, `.uf2`, or a merged ESP32 flash image.                                                                   |
| `flasher_args` | an ESP-IDF `build/flasher_args.json` instead of `firmware`. The two are mutually exclusive.                                                  |
| `elf`          | an ELF used when `firmware` is absent. Converted for AVR and RP2040 boards.                                                                  |
| `diagram`      | the circuit, in Wokwi's `diagram.json` format.                                                                                               |
| `project`      | a Velxio `.vlx` project export. Wins over `diagram`.                                                                                         |
| `scenario`     | the scenario YAML to run by default. See [Scenarios](/docs/ci/scenarios/).                                                                   |
| `language`     | `arduino`. `micropython` is refused with exit 2 - CI runs compiled firmware only.                                                            |

Nothing is ignored in silence. A key the CLI does not know is a warning; a
feature that is not built yet fails the run with `feature_unsupported`
instead of quietly running a different project than the one you wrote.
`[[chip]]` (custom chips) is one of those: it is refused today, with the
source file named.

## Boards CI runs today

The server decides, not the CLI. Thirty-six kinds run now — every board with
an in-browser engine, each one proven by booting real firmware.

### AVR

| kind | board | `diagram.json` type | firmware |
| ---- | ----- | ------------------- | -------- |
| `arduino-uno` | Arduino Uno | `wokwi-arduino-uno` | Intel HEX |
| `arduino-nano` | Arduino Nano | `wokwi-arduino-nano` | Intel HEX |
| `arduino-mega` | Arduino Mega | `wokwi-arduino-mega` | Intel HEX |
| `attiny85` | ATtiny85 | `wokwi-attiny85` | Intel HEX |

### RP2040 and RP2350

| kind | board | `diagram.json` type | firmware |
| ---- | ----- | ------------------- | -------- |
| `raspberry-pi-pico` | Raspberry Pi Pico | `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | flash image |
| `pi-pico-w` | Raspberry Pi Pico W | `board-pi-pico-w` | flash image |
| `xiao-rp2040` | XIAO RP2040 | `board-velxio-xiao-rp2040` | flash image |
| `xiao-rp2350` | XIAO RP2350 | `board-velxio-xiao-rp2350` | flash image |
| `pimoroni-pico-plus-2w` | Pimoroni Pico Plus 2 W | `board-velxio-pimoroni-pico-plus-2w` | flash image |
| `badger-2350` | Pimoroni Badger 2350 | `board-velxio-badger-2350` | flash image |
| `stellar-unicorn` | Pimoroni Stellar Unicorn | `board-velxio-stellar-unicorn` | flash image |

### XIAO ARM

| kind | board | `diagram.json` type | firmware |
| ---- | ----- | ------------------- | -------- |
| `xiao-nrf52840-sense` | XIAO nRF52840 Sense | `board-velxio-xiao-nrf52840-sense` | Intel HEX |
| `xiao-samd21` | XIAO SAMD21 | `board-velxio-xiao-samd21` | Intel HEX |
| `xiao-ra4m1` | XIAO RA4M1 | `board-velxio-xiao-ra4m1` | Intel HEX |
| `xiao-mg24-sense` | XIAO MG24 Sense | `board-velxio-xiao-mg24-sense` | Intel HEX |
| `xiao-nrf54l15-sense` | XIAO nRF54L15 Sense | `board-velxio-xiao-nrf54l15-sense` | Intel HEX |

### ESP32

| kind | board | `diagram.json` type | firmware |
| ---- | ----- | ------------------- | -------- |
| `esp32` | ESP32 DevKit v1 | `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | merged ESP32 image |
| `esp32-s3` | ESP32-S3 DevKitC-1 | `board-esp32-s3-devkitc-1` | merged ESP32 image |
| `esp32-c3` | ESP32-C3 DevKitM-1 | `board-esp32-c3-devkitm-1` | merged ESP32 image |
| `esp32-c6` | ESP32-C6 DevKitC-1 | `board-esp32-c6-devkitc-1` | merged ESP32 image |
| `esp32-devkit-c-v4` | ESP32 DevKitC v4 | `board-esp32-devkit-c-v4` | merged ESP32 image |
| `esp32-cam` | ESP32-CAM | `board-esp32-cam` | merged ESP32 image |
| `wemos-lolin32-lite` | WEMOS LOLIN32 Lite | `board-wemos-lolin32-lite` | merged ESP32 image |
| `xiao-esp32-s3` | XIAO ESP32-S3 | `board-xiao-esp32-s3` | merged ESP32 image |
| `arduino-nano-esp32` | Arduino Nano ESP32 | `board-arduino-nano-esp32` | merged ESP32 image |
| `xiao-esp32-c3` | XIAO ESP32-C3 | `board-xiao-esp32-c3` | merged ESP32 image |
| `aitewinrobot-esp32c3-supermini` | ESP32-C3 SuperMini | `board-aitewinrobot-esp32c3-supermini` | merged ESP32 image |
| `xiao-esp32c6` | XIAO ESP32-C6 | `board-xiao-esp32-c6` | merged ESP32 image |
| `esp32-p4` | ESP32-P4 Function EV | `board-esp32-p4-function-ev` | merged ESP32 image |
| `m5stack-core` | M5Stack Core | `board-velxio-m5stack-core` | merged ESP32 image |
| `esp32-c3-lcdkit` | ESP32-C3-LCDkit | `board-velxio-esp32-c3-lcdkit` | merged ESP32 image |
| `cardputer-adv` | M5Stack Cardputer ADV | `board-velxio-cardputer-adv` | merged ESP32 image |
| `xiao-esp32s3-sense` | XIAO ESP32-S3 Sense | `board-velxio-xiao-esp32s3-sense` | merged ESP32 image |
| `esp-vocat` | ESP-VoCat | `board-velxio-esp-vocat` | merged ESP32 image |
| `esp32-s3-eye` | ESP32-S3-EYE | `board-velxio-esp32-s3-eye` | merged ESP32 image |
| `esp-sensairshuttle` | ESP-SensAirShuttle | `board-velxio-esp-sensairshuttle` | merged ESP32 image |

Any of them can also be written `board-velxio-<kind>` in the diagram, for
example `board-velxio-esp32-c6`; the boards with no Wokwi type of their own
have no other spelling.

`velxio-cli boards` prints the live list with each board's status, its
`diagram.json` types and the firmware formats it accepts.

:::caution
What is left runs in the editor but not in CI yet: the STM32 boards (they
need the QEMU lane), the Raspberry Pi and UNIHIKER boards, the ESP32-P4
preview devkit, and the DFRobot family, which is still behind its launch
flag. Each is refused before the run starts, with
`board_not_supported_in_ci` and the phase it is planned for. Nothing is
billed, and no nearby board is silently substituted.
:::

Pico W runs, but CI has no network: WiFi and sockets never connect, and the
run carries a `no_network` warning.

## How paths resolve

- **Config file:** `velxio.toml`, then `wokwi.toml`, then exactly one
  `*.vlx` in the directory. None of them is exit 2.
- **Circuit:** `--project-file`, then `[velxio] project`, then
  `--diagram-file`, then `[velxio] diagram`, then `diagram.json` next to
  the config file.
- **Firmware:** `--firmware`, then `--elf`, then `[velxio] firmware` or
  `flasher_args`, then `[velxio] elf`, then `[wokwi] firmware`, then
  `[wokwi] elf`.
- **Board:** `[velxio] board`, then the board part of the diagram (or the
  active board of the `.vlx`).

Relative paths given on the command line resolve against the project
directory, not against your shell's working directory.

## diagram.json

Wokwi's format, read as it is: `version: 1`, `parts` of
`{id, type, left, top, attrs, rotate, hide}` and `connections` of
`[from, to, color, path]`. The part ids in the diagram are the ids your
scenario steps use.

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

Parts are the `wokwi-*` elements (`wokwi-led`, `wokwi-pushbutton`,
`wokwi-dht22`, and so on). A part type the CLI does not recognise is a
warning, not an error: the server decides, and parts it cannot simulate are
reported by id rather than dropped in silence.

## .vlx

A project exported from the Velxio editor (`format: "velxio-project"`,
`version: 1`) can be the circuit instead of a diagram. Put the single
`.vlx` in the directory, or name it with `project =` or `--project-file`.
The primary board of the export is the board of the run; the firmware still
comes from the toml or from `--firmware`.

## Limits

| what                       | cap                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| firmware per board         | 16 MiB                                                                                             |
| all uploaded files per run | 20 MiB                                                                                             |
| circuit                    | 300 parts, 2,000 wires                                                                             |
| scenario                   | 200 steps, 20 screenshots, 512 bytes per `wait-serial` text                                        |
| `--timeout`                | your plan's ceiling (5 min on Maker, 10 min on Pro), and never more than the minutes you have left |

A `--timeout` above the ceiling is not an error: it is clamped, and the run
reports a `timeout_clamped` warning with the budget it actually got.

## Check it before you spend minutes

```bash
velxio-cli lint .
```

`lint` needs no token and no network. It parses the toml, resolves every
path, checks the files exist and fit the caps, checks part ids are unique
and connections name existing parts, checks the board is one CI runs, checks
the firmware format matches the board family, and checks every scenario step
is known, has its fields, names existing parts and parses its durations.
Most `exit 2` failures are cheaper to find here.
