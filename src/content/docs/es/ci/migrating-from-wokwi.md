---
title: Viniendo de Wokwi CI
description: Qué cambia cuando un job de wokwi-cli pasa a Velxio CI - la línea uses, el nombre del secreto - y qué no cambia.
sidebar:
  order: 7
---

Velxio CI lee los archivos que un proyecto de Wokwi CI ya tiene: `wokwi.toml`,
`diagram.json` y el YAML de escenarios de Wokwi. Nada del código de Wokwi
interviene; nuestros propios parsers leen esos formatos. En la práctica, la
migración son dos líneas.

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

Los inputs de la action conservan sus nombres a propósito: `path`, `timeout`,
`expect_text`, `fail_text`, `scenario`, `serial_log_file`, `diagram_file`,
`elf`. Obtén el secreto con `velxio-cli login --ci --name "<repo>"` (se
aprueba en el navegador e imprime el token una sola vez) y guárdalo como
secreto del repositorio. La lista completa está en [GitHub Actions](/docs/es/ci/github-action/).

## En la línea de comandos

Los flags de `wokwi-cli` existen con los mismos nombres: `--elf`,
`--diagram-file`, `--scenario`, `--expect-text`, `--fail-text`,
`--timeout`, `--timeout-exit-code`, `--interactive`, `--serial-log-file`,
`--screenshot-part`, `--screenshot-time`, `--screenshot-file`, `--quiet`.
`--timeout` son milisegundos simulados en ambos.

`WOKWI_CLI_TOKEN` nunca se lee. Define `VELXIO_CLI_TOKEN` (o
`VELXIO_CI_TOKEN`), o ejecuta `velxio-cli login` una vez.

## wokwi.toml

Se lee tal cual - no tienes que renombrarlo a `velxio.toml`:

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

Las claves que no son compatibles se reportan por su nombre. Son advertencias,
no omisiones silenciosas - excepto `[[chip]]`, que detiene la ejecución para
que nunca obtengas un resultado exitoso de un circuito al que le falta el chip
bajo prueba. Hoy no hay servidor GDB, ni puerto RFC2217, ni exportación VCD,
ni reenvío de red en Velxio CI.

Las claves que Velxio añade - `board`, `diagram`, `project`, `scenario`,
`flasher_args` - viven bajo `[velxio]`. Consulta
[velxio.toml](/docs/es/ci/velxio-toml/).

## Placas

Los tipos de partes de Wokwi se corresponden con los kinds de Velxio. Estos
funcionan hoy:

| Tipo de Wokwi `diagram.json` | Kind de Velxio |
| ------------------------- | ----------- |
| `wokwi-arduino-uno` | `arduino-uno` |
| `wokwi-arduino-nano` | `arduino-nano` |
| `wokwi-arduino-mega` | `arduino-mega` |
| `wokwi-attiny85` | `attiny85` |
| `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | `raspberry-pi-pico` |
| `board-pi-pico-w` | `pi-pico-w` (sin red en CI: advertencia) |
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
| `board-velxio-<kind>` | cualquier placa que CI ejecute, escrita a la manera de Velxio |

Velxio ejecuta treinta y seis placas en CI, y la mayoría son placas para las
que Wokwi no tiene tipo - la familia RP2350, las placas XIAO ARM, los kits de
M5Stack y Seeed. Escríbelas como `board-velxio-<kind>`; la lista completa está
en la [tabla de placas](/docs/es/ci/velxio-toml/).

Cualquier otra placa de Wokwi falla antes de que empiece la ejecución, con
`board_not_supported_in_ci` o `unknown_board_type`, con el tipo nombrado y la
fase en la que está prevista. Eso incluye `board-pi-pico-2` y `-2w`, las
placas STM32, las Nucleo, las placas ESP32-S2/H2/C61, el devkit de vista previa
ESP32-P4 y los kits con pantalla. Solo se sugiere una placa Velxio cercana
cuando funciona hoy, y nunca se sustituye por ti. Un rechazo no genera ningún
cargo.

`velxio-cli boards` imprime la lista en vivo con el estado de cada placa.

## Escenarios

El YAML de escenarios de Wokwi se ejecuta sin cambios: `delay`, `wait-serial`,
`write-serial`, `expect-pin`, `set-control`, `take-screenshot`, con los mismos
nombres de campo (`part-id`, `save-to`, `compare-with`, `value`). Todos los
tiempos son tiempo simulado, igual que en Wokwi. Dos diferencias:

- **Los pasos táctiles** (`touch-press`, `touch-move`, `touch-release`) no
  están implementados; el CLI los rechaza en la fase de lint.
- **`compare-with` se captura pero aún no se compara**: obtienes el PNG y una
  advertencia, y la ejecución no falla por ello.

Los detalles están en [Escenarios](/docs/es/ci/scenarios/).

## Firmware

El CLI convierte lo que produjo tu toolchain en lo que carga el motor de la
placa:

- Las carpetas "Export compiled binary" de Arduino ESP32 funcionan:
  `<sketch>.ino.bin` se fusiona con `<sketch>.ino.bootloader.bin` y
  `<sketch>.ino.partitions.bin` (más `boot_app0.bin` cuando está presente).
- El `firmware.bin` + `bootloader.bin` + `partitions.bin` de PlatformIO se
  fusionan de la misma manera. Los proyectos ESP-IDF pueden apuntar
  `flasher_args` a `build/flasher_args.json` en su lugar.
- Un `app.bin` de ESP32 solitario, sin archivos hermanos, se rechaza, con la
  sugerencia de `esptool.py merge_bin`.
- Los `.uf2` y `.elf` de Pico se aplanan a una imagen de flash; un `.elf` de
  AVR se convierte en Intel HEX.
- El chip id del bootloader debe coincidir con la placa: una imagen de
  ESP32-C3 en una placa `esp32-s3` es `firmware_format_mismatch`, salida 2.

MicroPython no es compatible: CI ejecuta firmware compilado, y
`language = "micropython"` se rechaza en lugar de ejecutarse como otra cosa.

## Facturación

Los minutos son tiempo simulado, redondeados hacia arriba a segundos enteros,
por mes natural (UTC): 200 al mes en Maker, 2.000 en Pro. Una ejecución que se
rechaza antes de empezar no cuesta nada, y un motor bloqueado o un límite de
reloj de pared solo cuestan los segundos simulados transcurridos. Consulta
[Códigos de salida](/docs/es/ci/exit-codes/) para la tabla completa.

## Pruébalo en un proyecto que ya tengas

```bash
velxio-cli lint .        # no token, no network: does Velxio understand this project?
export VELXIO_CLI_TOKEN=vlxci_...
velxio-cli run --scenario test.scenario.yaml --timeout 10000 .
```

Si `lint` no da errores, la ejecución llegará a una placa.
