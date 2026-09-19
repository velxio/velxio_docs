---
title: Coming from Wokwi CI
description: What changes when a wokwi-cli job moves to Velxio CI - the uses line, the secret name - and what does not.
sidebar:
  order: 7
---

Velxio CI reads the files a Wokwi CI project already has: `wokwi.toml`,
`diagram.json` and Wokwi's scenario YAML. None of Wokwi's code is involved;
our own parsers read those formats. In practice the migration is two lines.

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

The action inputs keep their names on purpose: `path`, `timeout`,
`expect_text`, `fail_text`, `scenario`, `serial_log_file`, `diagram_file`,
`elf`. Get the secret with `velxio-cli login --ci --name "<repo>"` (it
approves in the browser and prints the token once) and store it as a
repository secret. Full list in [GitHub Actions](/docs/ci/github-action/).

## On the command line

The `wokwi-cli` flags exist under the same names: `--elf`,
`--diagram-file`, `--scenario`, `--expect-text`, `--fail-text`,
`--timeout`, `--timeout-exit-code`, `--interactive`, `--serial-log-file`,
`--screenshot-part`, `--screenshot-time`, `--screenshot-file`, `--quiet`.
`--timeout` is simulated milliseconds on both.

`WOKWI_CLI_TOKEN` is never read. Set `VELXIO_CLI_TOKEN` (or
`VELXIO_CI_TOKEN`), or run `velxio-cli login` once.

## wokwi.toml

Read as it is - you do not have to rename it to `velxio.toml`:

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

Keys that are not supported are reported by name. They are warnings, not
silent omissions - except `[[chip]]`, which stops the run so you never get a
pass from a circuit missing the chip under test. There is no GDB server, no
RFC2217 port, no VCD export and no network forwarding in Velxio CI today.

The keys Velxio adds - `board`, `diagram`, `project`, `scenario`,
`flasher_args` - live under `[velxio]`. See
[velxio.toml](/docs/ci/velxio-toml/).

## Boards

Wokwi part types map onto Velxio kinds. These run today:

| Wokwi `diagram.json` type | Velxio kind |
| ------------------------- | ----------- |
| `wokwi-arduino-uno` | `arduino-uno` |
| `wokwi-arduino-nano` | `arduino-nano` |
| `wokwi-arduino-mega` | `arduino-mega` |
| `wokwi-attiny85` | `attiny85` |
| `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | `raspberry-pi-pico` |
| `board-pi-pico-w` | `pi-pico-w` (no network in CI: warning) |
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
| `board-velxio-<kind>` | any board CI runs, written the Velxio way |

Velxio runs thirty-six boards in CI, and most of them are boards Wokwi has no
type for — the RP2350 family, the XIAO ARM boards, the M5Stack and Seeed
kits. Write those as `board-velxio-<kind>`; the full list is in the
[board table](/docs/ci/velxio-toml/).

Every other Wokwi board fails before the run starts, with
`board_not_supported_in_ci` or `unknown_board_type`, the type named, and the
phase when it is planned. That includes `board-pi-pico-2` and `-2w`, the
STM32 boards, the Nucleos, the ESP32-S2/H2/C61 boards, the ESP32-P4 preview
devkit and the display kits. A nearby Velxio board is suggested only when it
runs today, and it is never substituted for you. Nothing is billed for a
refusal.

`velxio-cli boards` prints the live list with each board's status.

## Scenarios

Wokwi's scenario YAML runs unchanged: `delay`, `wait-serial`,
`write-serial`, `expect-pin`, `set-control`, `take-screenshot`, with the
same field names (`part-id`, `save-to`, `compare-with`, `value`). All timing
is simulated time, as on Wokwi. Two differences:

- **Touch steps** (`touch-press`, `touch-move`, `touch-release`) are not
  implemented; the CLI refuses them at lint time.
- **`compare-with` is captured but not compared** yet: you get the PNG and a
  warning, and the run does not fail on it.

Details in [Scenarios](/docs/ci/scenarios/).

## Firmware

The CLI turns what your toolchain produced into what the board's engine
loads:

- Arduino ESP32 "Export compiled binary" folders work: `<sketch>.ino.bin`
  is merged with `<sketch>.ino.bootloader.bin` and
  `<sketch>.ino.partitions.bin` (plus `boot_app0.bin` when present).
- PlatformIO's `firmware.bin` + `bootloader.bin` + `partitions.bin` merge
  the same way. ESP-IDF projects can point `flasher_args` at
  `build/flasher_args.json` instead.
- A lone ESP32 `app.bin` with no siblings is refused, with the
  `esptool.py merge_bin` hint.
- Pico `.uf2` and `.elf` are flattened to a flash image; an AVR `.elf`
  becomes Intel HEX.
- The bootloader's chip id must match the board: an ESP32-C3 image on an
  `esp32-s3` board is `firmware_format_mismatch`, exit 2.

MicroPython is not supported: CI runs compiled firmware, and
`language = "micropython"` is refused rather than run as something else.

## Billing

Minutes are simulated time, rounded up to whole seconds, per calendar month
(UTC): 200 a month on Maker, 2,000 on Pro. A run that is refused before it
starts costs nothing, and a stalled engine or a wall-clock cap costs only
the simulated seconds that had elapsed. See
[Exit codes](/docs/ci/exit-codes/) for the full table.

## Try it on a project you already have

```bash
velxio-cli lint .        # no token, no network: does Velxio understand this project?
export VELXIO_CLI_TOKEN=vlxci_...
velxio-cli run --scenario test.scenario.yaml --timeout 10000 .
```

If `lint` is clean, the run will reach a board.
