---
title: Переход с Wokwi CI
description: Что меняется, когда задание wokwi-cli переезжает в Velxio CI - строка uses, имя секрета - и что не меняется.
sidebar:
  order: 7
---

Velxio CI читает файлы, которые уже есть в проекте Wokwi CI: `wokwi.toml`,
`diagram.json` и YAML сценариев Wokwi. Код Wokwi не задействован;
эти форматы читают наши собственные парсеры. На практике миграция
занимает две строки.

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

Имена входных параметров action сохранены намеренно: `path`, `timeout`,
`expect_text`, `fail_text`, `scenario`, `serial_log_file`, `diagram_file`,
`elf`. Получите секрет командой `velxio-cli login --ci --name "<repo>"` (она
подтверждается в браузере и один раз выводит токен) и сохраните его как
секрет репозитория. Полный список в разделе [GitHub Actions](/docs/ru/ci/github-action/).

## В командной строке

Флаги `wokwi-cli` существуют под теми же именами: `--elf`,
`--diagram-file`, `--scenario`, `--expect-text`, `--fail-text`,
`--timeout`, `--timeout-exit-code`, `--interactive`, `--serial-log-file`,
`--screenshot-part`, `--screenshot-time`, `--screenshot-file`, `--quiet`.
`--timeout` в обоих случаях задаётся в моделируемых миллисекундах.

`WOKWI_CLI_TOKEN` никогда не читается. Задайте `VELXIO_CLI_TOKEN` (или
`VELXIO_CI_TOKEN`) либо один раз выполните `velxio-cli login`.

## wokwi.toml

Читается как есть: переименовывать его в `velxio.toml` не нужно:

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

О неподдерживаемых ключах сообщается по имени. Это предупреждения, а не
молчаливое игнорирование, за исключением `[[chip]]`, который останавливает
запуск, чтобы вы никогда не получили успех от схемы без испытываемого чипа.
В Velxio CI сегодня нет ни GDB-сервера, ни порта RFC2217, ни экспорта VCD,
ни перенаправления сети.

Ключи, которые добавляет Velxio - `board`, `diagram`, `project`, `scenario`,
`flasher_args` - находятся в секции `[velxio]`. См.
[velxio.toml](/docs/ru/ci/velxio-toml/).

## Платы

Типы компонентов Wokwi отображаются на виды Velxio. Сегодня работают
следующие:

| Тип в `diagram.json` Wokwi | Вид Velxio |
| ------------------------- | ----------- |
| `wokwi-arduino-uno` | `arduino-uno` |
| `wokwi-arduino-nano` | `arduino-nano` |
| `wokwi-arduino-mega` | `arduino-mega` |
| `wokwi-attiny85` | `attiny85` |
| `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | `raspberry-pi-pico` |
| `board-pi-pico-w` | `pi-pico-w` (нет сети в CI: предупреждение) |
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
| `board-velxio-<kind>` | любая плата, работающая в CI, записанная способом Velxio |

Velxio запускает в CI тридцать шесть плат, и большинство из них - платы, для
которых у Wokwi нет типа: семейство RP2350, платы XIAO на ARM, наборы M5Stack
и Seeed. Записывайте их как `board-velxio-<kind>`; полный список в
[таблице плат](/docs/ru/ci/velxio-toml/).

Любая другая плата Wokwi завершается ошибкой ещё до начала запуска, с
`board_not_supported_in_ci` или `unknown_board_type`, с указанием типа и
фазы, на которой это планируется. Это касается `board-pi-pico-2` и `-2w`,
плат STM32, Nucleo, плат ESP32-S2/H2/C61, предварительного devkit ESP32-P4
и наборов с дисплеем. Близкая плата Velxio предлагается только тогда, когда
она работает сегодня, и она никогда не подставляется за вас. За отказ
средства не списываются.

`velxio-cli boards` выводит актуальный список со статусом каждой платы.

## Сценарии

YAML сценариев Wokwi выполняется без изменений: `delay`, `wait-serial`,
`write-serial`, `expect-pin`, `set-control`, `take-screenshot`, с теми же
именами полей (`part-id`, `save-to`, `compare-with`, `value`). Всё время
моделируемое, как и в Wokwi. Два отличия:

- **Шаги касаний** (`touch-press`, `touch-move`, `touch-release`) не
  реализованы; CLI отклоняет их на этапе lint.
- **`compare-with` сохраняется, но пока не сравнивается**: вы получаете PNG
  и предупреждение, и запуск из-за этого не завершается ошибкой.

Подробности в разделе [Сценарии](/docs/ru/ci/scenarios/).

## Прошивка

CLI превращает то, что создала ваша цепочка инструментов, в то, что
загружает движок платы:

- Папки Arduino ESP32 "Export compiled binary" работают: `<sketch>.ino.bin`
  объединяется с `<sketch>.ino.bootloader.bin` и
  `<sketch>.ino.partitions.bin` (плюс `boot_app0.bin`, если он есть).
- `firmware.bin` + `bootloader.bin` + `partitions.bin` из PlatformIO
  объединяются так же. Проекты ESP-IDF могут вместо этого указать
  `flasher_args` на `build/flasher_args.json`.
- Одиночный ESP32 `app.bin` без соседних файлов отклоняется, с подсказкой
  про `esptool.py merge_bin`.
- Pico `.uf2` и `.elf` разворачиваются в образ флеш-памяти; AVR `.elf`
  превращается в Intel HEX.
- Идентификатор чипа в загрузчике должен совпадать с платой: образ ESP32-C3
  на плате `esp32-s3` даёт `firmware_format_mismatch`, код выхода 2.

MicroPython не поддерживается: CI запускает скомпилированную прошивку, и
`language = "micropython"` отклоняется, а не запускается как что-то другое.

## Оплата

Минуты - это моделируемое время, округлённое вверх до целых секунд, за
календарный месяц (UTC): 200 в месяц на Maker, 2 000 на Pro. Запуск,
отклонённый до начала, ничего не стоит, а зависший движок или ограничение
по реальному времени стоят только истёкших моделируемых секунд. Полная
таблица в разделе [Коды выхода](/docs/ru/ci/exit-codes/).

## Попробуйте на проекте, который у вас уже есть

```bash
velxio-cli lint .        # no token, no network: does Velxio understand this project?
export VELXIO_CLI_TOKEN=vlxci_...
velxio-cli run --scenario test.scenario.yaml --timeout 10000 .
```

Если `lint` проходит чисто, запуск дойдёт до платы.
