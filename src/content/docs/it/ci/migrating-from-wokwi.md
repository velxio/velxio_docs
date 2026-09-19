---
title: Arrivare da Wokwi CI
description: Cosa cambia quando un job wokwi-cli passa a Velxio CI - la riga uses, il nome del secret - e cosa non cambia.
sidebar:
  order: 7
---

Velxio CI legge i file che un progetto Wokwi CI ha già: `wokwi.toml`,
`diagram.json` e lo scenario YAML di Wokwi. Nessuna parte del codice di Wokwi
è coinvolta; i nostri parser leggono quei formati. In pratica la migrazione
richiede due righe.

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

Gli input dell'action mantengono di proposito i loro nomi: `path`, `timeout`,
`expect_text`, `fail_text`, `scenario`, `serial_log_file`, `diagram_file`,
`elf`. Ottieni il secret con `velxio-cli login --ci --name "<repo>"` (viene
approvato nel browser e stampa il token una sola volta) e salvalo come
repository secret. L'elenco completo è in [GitHub Actions](/docs/it/ci/github-action/).

## Sulla riga di comando

I flag di `wokwi-cli` esistono con gli stessi nomi: `--elf`,
`--diagram-file`, `--scenario`, `--expect-text`, `--fail-text`,
`--timeout`, `--timeout-exit-code`, `--interactive`, `--serial-log-file`,
`--screenshot-part`, `--screenshot-time`, `--screenshot-file`, `--quiet`.
`--timeout` è in millisecondi simulati in entrambi.

`WOKWI_CLI_TOKEN` non viene mai letto. Imposta `VELXIO_CLI_TOKEN` (o
`VELXIO_CI_TOKEN`), oppure esegui `velxio-cli login` una volta.

## wokwi.toml

Letto così com'è - non devi rinominarlo in `velxio.toml`:

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

Le chiavi non supportate vengono segnalate per nome. Sono avvisi, non
omissioni silenziose - tranne `[[chip]]`, che interrompe l'esecuzione così non
ottieni mai un esito positivo da un circuito a cui manca il chip in prova. Non
c'è server GDB, né porta RFC2217, né esportazione VCD, né inoltro di rete in
Velxio CI oggi.

Le chiavi che Velxio aggiunge - `board`, `diagram`, `project`, `scenario`,
`flasher_args` - si trovano sotto `[velxio]`. Vedi
[velxio.toml](/docs/it/ci/velxio-toml/).

## Board

I tipi di parte di Wokwi corrispondono ai kind di Velxio. Questi funzionano
oggi:

| Tipo in `diagram.json` di Wokwi | Kind Velxio |
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
| `board-velxio-<kind>` | qualsiasi board eseguita in CI, scritta alla maniera di Velxio |

Velxio esegue trentasei board in CI, e la maggior parte sono board per cui
Wokwi non ha un tipo — la famiglia RP2350, le board XIAO ARM, i kit M5Stack e
Seeed. Scrivi quelle come `board-velxio-<kind>`; l'elenco completo è nella
[tabella delle board](/docs/it/ci/velxio-toml/).

Ogni altra board Wokwi fallisce prima che l'esecuzione inizi, con
`board_not_supported_in_ci` o `unknown_board_type`, il tipo indicato, e la
fase in cui è pianificata. Questo include `board-pi-pico-2` e `-2w`, le board
STM32, le Nucleo, le board ESP32-S2/H2/C61, il devkit di anteprima ESP32-P4 e
i kit con display. Una board Velxio vicina viene suggerita solo quando
funziona oggi, e non viene mai sostituita al posto tuo. Un rifiuto non viene
fatturato.

`velxio-cli boards` stampa l'elenco aggiornato con lo stato di ogni board.

## Scenari

Lo scenario YAML di Wokwi viene eseguito senza modifiche: `delay`,
`wait-serial`, `write-serial`, `expect-pin`, `set-control`,
`take-screenshot`, con gli stessi nomi di campo (`part-id`, `save-to`,
`compare-with`, `value`). Tutti i tempi sono tempo simulato, come su Wokwi.
Due differenze:

- **I passi touch** (`touch-press`, `touch-move`, `touch-release`) non sono
  implementati; la CLI li rifiuta in fase di lint.
- **`compare-with` viene acquisito ma non confrontato** per ora: ottieni il
  PNG e un avviso, e l'esecuzione non fallisce per questo.

Dettagli in [Scenari](/docs/it/ci/scenarios/).

## Firmware

La CLI trasforma ciò che ha prodotto la tua toolchain in ciò che carica il
motore della board:

- Le cartelle "Export compiled binary" di Arduino ESP32 funzionano:
  `<sketch>.ino.bin` viene unito a `<sketch>.ino.bootloader.bin` e
  `<sketch>.ino.partitions.bin` (più `boot_app0.bin` quando presente).
- `firmware.bin` + `bootloader.bin` + `partitions.bin` di PlatformIO si
  uniscono allo stesso modo. I progetti ESP-IDF possono puntare `flasher_args`
  a `build/flasher_args.json` invece.
- Un singolo `app.bin` ESP32 senza file affini viene rifiutato, con il
  suggerimento `esptool.py merge_bin`.
- I `.uf2` e `.elf` del Pico vengono appiattiti in un'immagine flash; un
  `.elf` AVR diventa Intel HEX.
- L'id del chip del bootloader deve corrispondere alla board: un'immagine
  ESP32-C3 su una board `esp32-s3` è `firmware_format_mismatch`, uscita 2.

MicroPython non è supportato: la CI esegue firmware compilato, e
`language = "micropython"` viene rifiutato invece di essere eseguito come
qualcos'altro.

## Fatturazione

I minuti sono tempo simulato, arrotondati per eccesso al secondo intero, per
mese di calendario (UTC): 200 al mese su Maker, 2.000 su Pro. Un'esecuzione
rifiutata prima di iniziare non costa nulla, e un motore bloccato o un limite
di tempo reale costa solo i secondi simulati trascorsi. Vedi
[Codici di uscita](/docs/it/ci/exit-codes/) per la tabella completa.

## Provalo su un progetto che hai già

```bash
velxio-cli lint .        # no token, no network: does Velxio understand this project?
export VELXIO_CLI_TOKEN=vlxci_...
velxio-cli run --scenario test.scenario.yaml --timeout 10000 .
```

Se `lint` è pulito, l'esecuzione raggiungerà una board.
