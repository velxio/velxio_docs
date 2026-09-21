---
title: Umstieg von Wokwi CI
description: Was sich ändert, wenn ein wokwi-cli-Job zu Velxio CI wechselt - die uses-Zeile, der Name des Secrets - und was nicht.
sidebar:
  order: 7
---

Velxio CI liest die Dateien, die ein Wokwi-CI-Projekt bereits enthält: `wokwi.toml`,
`diagram.json` und Wokwis Szenario-YAML. Kein Code von Wokwi ist beteiligt;
unsere eigenen Parser lesen diese Formate. In der Praxis besteht die Migration aus zwei Zeilen.

```diff
-      - uses: wokwi/wokwi-ci-action@v1
+      - uses: velxio/velxio-ci-action@v1
         with:
-          token: ${{ secrets.WOKWI_CLI_TOKEN }}
+          token: ${{ secrets.VELXIO_CLI_TOKEN }}
           path: /
           timeout: 10000
           expect_text: 'Hello, World!'
           fail_text: 'Error'
           scenario: 'test.scenario.yaml'
```

Die Eingaben der Action behalten absichtlich ihre Namen: `path`, `timeout`,
`expect_text`, `fail_text`, `scenario`, `serial_log_file`, `diagram_file`,
`elf`. Das Secret erhältst du mit `velxio-cli login --ci --name "<repo>"` (es
wird im Browser bestätigt und gibt das Token einmalig aus) und speicherst es als
Repository-Secret. Die vollständige Liste findest du unter [GitHub Actions](/docs/de/ci/github-action/).

## Auf der Kommandozeile

Die Flags von `wokwi-cli` existieren unter denselben Namen: `--elf`,
`--diagram-file`, `--scenario`, `--expect-text`, `--fail-text`,
`--timeout`, `--timeout-exit-code`, `--interactive`, `--serial-log-file`,
`--screenshot-part`, `--screenshot-time`, `--screenshot-file`, `--quiet`.
`--timeout` ist bei beiden in simulierten Millisekunden angegeben.

`WOKWI_CLI_TOKEN` wird nie gelesen. Setze `VELXIO_CLI_TOKEN` (oder
`VELXIO_CI_TOKEN`), oder führe einmal `velxio-cli login` aus.

## wokwi.toml

Wird unverändert gelesen - du musst sie nicht in `velxio.toml` umbenennen:

```toml
[wokwi]
version = 1
firmware = "build/firmware.bin"   # used
elf = "build/firmware.elf"        # used when firmware is absent (AVR, RP2040)
gdbServerPort = 3333              # warning: not supported
rfc2217ServerPort = 4000          # warning: not supported
vcdFile = "trace.vcd"             # warning: not supported

[[net.forward]]                   # warning: CI runs have no network
from = "localhost:8080"
to = "target:80"

[[chip]]                          # refused: custom chips do not run in CI yet
name = "inverter"
binary = "chips/inverter.chip.wasm"
```

Nicht unterstützte Schlüssel werden namentlich gemeldet. Es sind Warnungen, keine
stillschweigenden Auslassungen - außer `[[chip]]`, was den Lauf abbricht, damit du niemals ein
Bestehen von einer Schaltung erhältst, in der der zu testende Chip fehlt. Es gibt heute keinen GDB-Server, keinen
RFC2217-Port, keinen VCD-Export und keine Netzwerkweiterleitung in Velxio CI.

Die Schlüssel, die Velxio hinzufügt - `board`, `diagram`, `project`, `scenario`,
`flasher_args` - befinden sich unter `[velxio]`. Siehe
[velxio.toml](/docs/de/ci/velxio-toml/).

## Boards

Wokwi-Part-Typen werden auf Velxio-Kinds abgebildet. Diese laufen heute:

| Wokwi `diagram.json`-Typ | Velxio-Kind |
| ------------------------- | ----------- |
| `wokwi-arduino-uno` | `arduino-uno` |
| `wokwi-arduino-nano` | `arduino-nano` |
| `wokwi-arduino-mega` | `arduino-mega` |
| `wokwi-attiny85` | `attiny85` |
| `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | `raspberry-pi-pico` |
| `board-pi-pico-w` | `pi-pico-w` (kein Netzwerk in CI: Warnung) |
| `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | `esp32` |
| `board-esp32-s3-devkitc-1` | `esp32-s3` |
| `board-esp32-c3-devkitm-1` | `esp32-c3` |
| `board-esp32-c6-devkitc-1` | `esp32-c6` |
| `board-esp32-devkit-c-v4` | `esp32-devkit-c-v4` |
| `board-esp32-cam` | `esp32-cam` |
| `board-wemos-lolin32-lite` | `wemos-lolin32-lite` |
| `board-xiao-esp32-s3` | `xiao-esp32-s3` |
| `board-arduino-nano-esp32` | `arduino-nano-esp32` |
| `board-xiao-esp32-c3` | `xiao-esp32-c3` |
| `board-aitewinrobot-esp32c3-supermini` | `aitewinrobot-esp32c3-supermini` |
| `board-xiao-esp32-c6` | `xiao-esp32c6` |
| `board-esp32-p4-function-ev` | `esp32-p4` |
| `board-velxio-<kind>` | jedes Board, das CI ausführt, auf die Velxio-Art geschrieben |

Velxio führt sechsunddreißig Boards in CI aus, und die meisten davon sind Boards, für die Wokwi keinen
Typ hat: die RP2350-Familie, die XIAO-ARM-Boards, die M5Stack- und Seeed-
Kits. Schreibe diese als `board-velxio-<kind>`; die vollständige Liste findest du in der
[Board-Tabelle](/docs/de/ci/velxio-toml/).

Jedes andere Wokwi-Board schlägt fehl, bevor der Lauf beginnt, mit
`board_not_supported_in_ci` oder `unknown_board_type`, dem genannten Typ und der
Phase, in der es geplant ist. Das umfasst `board-pi-pico-2` und `-2w`, die
STM32-Boards, die Nucleos, die ESP32-S2/H2/C61-Boards, das ESP32-P4-Preview-
Devkit und die Display-Kits. Ein nahegelegenes Velxio-Board wird nur vorgeschlagen, wenn es
heute läuft, und es wird niemals für dich ersetzt. Für eine
Ablehnung wird nichts berechnet.

`velxio-cli boards` gibt die aktuelle Liste mit dem Status jedes Boards aus.

## Szenarien

Wokwis Szenario-YAML läuft unverändert: `delay`, `wait-serial`,
`write-serial`, `expect-pin`, `set-control`, `take-screenshot`, mit denselben
Feldnamen (`part-id`, `save-to`, `compare-with`, `value`). Die gesamte Zeitsteuerung
ist simulierte Zeit, wie bei Wokwi. Zwei Unterschiede:

- **Touch-Schritte** (`touch-press`, `touch-move`, `touch-release`) sind nicht
  implementiert; die CLI lehnt sie beim Linten ab.
- **`compare-with` wird erfasst, aber noch nicht verglichen**: Du erhältst das PNG und eine
  Warnung, und der Lauf schlägt deswegen nicht fehl.

Details unter [Szenarien](/docs/de/ci/scenarios/).

## Firmware

Die CLI wandelt das, was deine Toolchain erzeugt hat, in das um, was die Engine des Boards
lädt:

- Arduino-ESP32-Ordner "Export compiled binary" funktionieren: `<sketch>.ino.bin`
  wird mit `<sketch>.ino.bootloader.bin` und
  `<sketch>.ino.partitions.bin` zusammengeführt (plus `boot_app0.bin`, falls vorhanden).
- PlatformIOs `firmware.bin` + `bootloader.bin` + `partitions.bin` werden
  auf dieselbe Weise zusammengeführt. ESP-IDF-Projekte können `flasher_args` stattdessen auf
  `build/flasher_args.json` verweisen.
- Eine einzelne ESP32-`app.bin` ohne Geschwisterdateien wird abgelehnt, mit dem
  Hinweis auf `esptool.py merge_bin`.
- Pico `.uf2` und `.elf` werden zu einem Flash-Image abgeflacht; ein AVR-`.elf`
  wird zu Intel HEX.
- Die Chip-ID des Bootloaders muss zum Board passen: Ein ESP32-C3-Image auf einem
  `esp32-s3`-Board ist `firmware_format_mismatch`, Exit 2.

MicroPython wird nicht unterstützt: CI führt kompilierte Firmware aus, und
`language = "micropython"` wird abgelehnt, statt als etwas anderes ausgeführt zu werden.

## Abrechnung

Minuten sind simulierte Zeit, auf ganze Sekunden aufgerundet, pro Kalendermonat
(UTC): 200 pro Monat bei Maker, 2.000 bei Pro. Ein Lauf, der abgelehnt wird, bevor er
beginnt, kostet nichts, und eine blockierte Engine oder eine Wall-Clock-Obergrenze kostet nur
die simulierten Sekunden, die verstrichen sind. Siehe
[Exit-Codes](/docs/de/ci/exit-codes/) für die vollständige Tabelle.

## Probiere es mit einem Projekt aus, das du bereits hast

```bash
velxio-cli lint .        # no token, no network: does Velxio understand this project?
export VELXIO_CLI_TOKEN=vlxci_...
velxio-cli run --scenario test.scenario.yaml --timeout 10000 .
```

Wenn `lint` sauber ist, wird der Lauf ein Board erreichen.
