---
title: Vindo do Wokwi CI
description: O que muda quando um job do wokwi-cli passa para o Velxio CI - a linha uses, o nome do secret - e o que não muda.
sidebar:
  order: 7
---

O Velxio CI lê os arquivos que um projeto do Wokwi CI já tem: `wokwi.toml`,
`diagram.json` e o YAML de cenário do Wokwi. Nenhum código do Wokwi está
envolvido; nossos próprios parsers leem esses formatos. Na prática, a migração
são duas linhas.

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

As entradas da action mantêm seus nomes de propósito: `path`, `timeout`,
`expect_text`, `fail_text`, `scenario`, `serial_log_file`, `diagram_file`,
`elf`. Obtenha o secret com `velxio-cli login --ci --name "<repo>"` (ele
aprova no navegador e imprime o token uma vez) e armazene-o como um secret de
repositório. Lista completa em [GitHub Actions](/docs/pt-br/ci/github-action/).

## Na linha de comando

As flags do `wokwi-cli` existem com os mesmos nomes: `--elf`,
`--diagram-file`, `--scenario`, `--expect-text`, `--fail-text`,
`--timeout`, `--timeout-exit-code`, `--interactive`, `--serial-log-file`,
`--screenshot-part`, `--screenshot-time`, `--screenshot-file`, `--quiet`.
`--timeout` é em milissegundos simulados em ambos.

`WOKWI_CLI_TOKEN` nunca é lido. Defina `VELXIO_CLI_TOKEN` (ou
`VELXIO_CI_TOKEN`), ou execute `velxio-cli login` uma vez.

## wokwi.toml

Lido como está: você não precisa renomeá-lo para `velxio.toml`:

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

As chaves que não são suportadas são reportadas pelo nome. São avisos, não
omissões silenciosas, exceto `[[chip]]`, que interrompe a execução para que
você nunca obtenha um resultado positivo de um circuito sem o chip em teste.
Não há servidor GDB, porta RFC2217, exportação VCD nem encaminhamento de rede
no Velxio CI hoje.

As chaves que o Velxio adiciona (`board`, `diagram`, `project`, `scenario`,
`flasher_args`) ficam em `[velxio]`. Veja
[velxio.toml](/docs/pt-br/ci/velxio-toml/).

## Placas

Os tipos de peça do Wokwi mapeiam para os kinds do Velxio. Estes rodam hoje:

| Tipo em `diagram.json` do Wokwi | Kind do Velxio |
| ------------------------- | ----------- |
| `wokwi-arduino-uno` | `arduino-uno` |
| `wokwi-arduino-nano` | `arduino-nano` |
| `wokwi-arduino-mega` | `arduino-mega` |
| `wokwi-attiny85` | `attiny85` |
| `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | `raspberry-pi-pico` |
| `board-pi-pico-w` | `pi-pico-w` (sem rede no CI: aviso) |
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
| `board-velxio-<kind>` | qualquer placa que o CI executa, escrita do jeito Velxio |

O Velxio executa trinta e seis placas no CI, e a maioria delas são placas para
as quais o Wokwi não tem tipo: a família RP2350, as placas XIAO ARM, os kits
M5Stack e Seeed. Escreva essas como `board-velxio-<kind>`; a lista completa
está na [tabela de placas](/docs/pt-br/ci/velxio-toml/).

Qualquer outra placa do Wokwi falha antes do início da execução, com
`board_not_supported_in_ci` ou `unknown_board_type`, o tipo nomeado, e a fase
em que está planejada. Isso inclui `board-pi-pico-2` e `-2w`, as placas STM32,
as Nucleos, as placas ESP32-S2/H2/C61, o devkit de pré-visualização ESP32-P4 e
os kits com display. Uma placa Velxio próxima é sugerida apenas quando ela roda
hoje, e nunca é substituída por você. Nada é cobrado por uma recusa.

`velxio-cli boards` imprime a lista atualizada com o status de cada placa.

## Cenários

O YAML de cenário do Wokwi roda sem alterações: `delay`, `wait-serial`,
`write-serial`, `expect-pin`, `set-control`, `take-screenshot`, com os mesmos
nomes de campo (`part-id`, `save-to`, `compare-with`, `value`). Toda a
temporização é tempo simulado, como no Wokwi. Duas diferenças:

- **Passos de toque** (`touch-press`, `touch-move`, `touch-release`) não são
  implementados; a CLI os recusa no momento do lint.
- **`compare-with` é capturado mas não comparado** ainda: você recebe o PNG e
  um aviso, e a execução não falha por causa disso.

Detalhes em [Cenários](/docs/pt-br/ci/scenarios/).

## Firmware

A CLI transforma o que sua toolchain produziu no que o motor da placa
carrega:

- Pastas "Export compiled binary" do Arduino ESP32 funcionam: `<sketch>.ino.bin`
  é mesclado com `<sketch>.ino.bootloader.bin` e
  `<sketch>.ino.partitions.bin` (mais `boot_app0.bin` quando presente).
- O `firmware.bin` + `bootloader.bin` + `partitions.bin` do PlatformIO são
  mesclados da mesma forma. Projetos ESP-IDF podem apontar `flasher_args` para
  `build/flasher_args.json` em vez disso.
- Um `app.bin` ESP32 sozinho, sem irmãos, é recusado, com a dica do
  `esptool.py merge_bin`.
- `.uf2` e `.elf` do Pico são achatados em uma imagem de flash; um `.elf` AVR
  se torna Intel HEX.
- O chip id do bootloader deve corresponder à placa: uma imagem ESP32-C3 em uma
  placa `esp32-s3` é `firmware_format_mismatch`, saída 2.

MicroPython não é suportado: o CI executa firmware compilado, e
`language = "micropython"` é recusado em vez de executado como outra coisa.

## Cobrança

Os minutos são tempo simulado, arredondados para segundos inteiros, por mês
civil (UTC): 200 por mês no Maker, 2.000 no Pro. Uma execução recusada antes de
começar não custa nada, e um motor travado ou um limite de tempo real custa
apenas os segundos simulados que já haviam decorrido. Veja
[Códigos de saída](/docs/pt-br/ci/exit-codes/) para a tabela completa.

## Experimente em um projeto que você já tem

```bash
velxio-cli lint .        # no token, no network: does Velxio understand this project?
export VELXIO_CLI_TOKEN=vlxci_...
velxio-cli run --scenario test.scenario.yaml --timeout 10000 .
```

Se o `lint` estiver limpo, a execução chegará a uma placa.
