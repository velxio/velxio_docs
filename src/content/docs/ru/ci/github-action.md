---
title: GitHub Actions
description: Действие velxio-ci-action — все входы и выходы с значениями по умолчанию — и рабочие процессы, которые его используют.
sidebar:
  order: 5
---

`velxio/velxio-ci-action` устанавливает CLI на раннер и запускает один
проект. Это составное действие: без контейнера, без загрузки Docker, а
бинарный файл кэшируется между заданиями.

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
    fail_text: "Guru Meditation"
```

Компилируйте на предыдущем шаге, любым инструментарием, который вы уже
используете. Действие запускает только то, что получилось в результате.

## Целый рабочий процесс

```yaml
name: firmware
on: [push, pull_request]

jobs:
  simulate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: |
          arduino-cli core install arduino:avr
          arduino-cli compile -b arduino:avr:uno --output-dir build sketch

      - name: Run it on a simulated Uno
        uses: velxio/velxio-ci-action@v1
        with:
          token: ${{ secrets.VELXIO_CLI_TOKEN }}
          path: .
          scenario: scenario.yaml
          timeout: 10000
```

Заданию нужен один секрет, потому что у раннера нет браузера, чтобы
подтвердить вход. Создайте его с помощью

```bash
velxio-cli login --ci --name "my-firmware"
```

которая выводит токен один раз, затем сохраните его как секрет репозитория
(**Settings, Secrets and variables, Actions**). Страница аккаунта
([velxio.dev/account/ci](https://velxio.dev/account/ci)) тоже создаёт его и
является местом, где вы отзываете любой из них.

## Входы

| input               | default              | meaning                                                                    |
| ------------------- | -------------------- | -------------------------------------------------------------------------- |
| `token`             | required             | ваш токен Velxio CI                                                        |
| `path`              | `.`                  | каталог проекта: `velxio.toml` (или `wokwi.toml`) плюс `diagram.json`      |
| `timeout`           | `10000`              | бюджет моделируемого времени в миллисекундах                               |
| `expect_text`       |                      | запуск проходит успешно, как только это появляется в serial                |
| `fail_text`         |                      | запуск завершается неудачей, как только это появляется в serial            |
| `scenario`          |                      | YAML сценария, относительно `path`                                         |
| `serial_log_file`   |                      | записать каждый байт serial этого запуска сюда, относительно `path`        |
| `diagram_file`      | `diagram.json`       | файл схемы, относительно `path`                                            |
| `elf`               |                      | прошивка ELF, переопределяет файл конфигурации                             |
| `firmware`          |                      | `.hex`, `.bin`, `.uf2` или объединённый образ ESP32, переопределяет файл конфигурации |
| `screenshot_part`   |                      | id компонента для скриншота                                                |
| `screenshot_time`   |                      | моделируемое время скриншота в миллисекундах                               |
| `screenshot_file`   | `screenshot.png`     | куда его записать                                                          |
| `timeout_exit_code` | `42`                 | код выхода шага при достижении бюджета                                     |
| `server`            | `https://velxio.dev` | сервер Velxio                                                              |
| `cli_version`       | `latest`             | релиз `velxio-cli` для установки, например `v0.1.1`                        |

Каждый вход отображается один к одному на флаг `velxio-cli`. Всё, что
действие не предоставляет — `--project-file`, `--interactive`, `--json`,
`--screenshot-tolerance`, `--allow-unsupported` — это повод вызвать CLI
напрямую в шаге `run:`.

## Выходы

| output        | value                                                         |
| ------------- | ------------------------------------------------------------- |
| `run_id`      | id запуска на стороне сервера                                 |
| `run_url`     | запуск на странице вашего аккаунта                            |
| `status`      | `passed`, `failed`, `timeout`, `error`, `cancelled` или `lost` |
| `sim_time_ms` | сколько миллисекунд моделируемого времени длился запуск       |

Они публикуются даже при неудачном запуске, поэтому последующий шаг может
сослаться на него:

```yaml
- name: Run it
  id: sim
  continue-on-error: true
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    expect_text: "READY"

- name: Report
  run: |
    echo "status=${{ steps.sim.outputs.status }}"
    echo "run: ${{ steps.sim.outputs.run_url }}"
    echo "simulated: ${{ steps.sim.outputs.sim_time_ms }} ms"
```

Без `continue-on-error` ненулевой код выхода CLI приводит к сбою шага и
задания. Обычно это то, что вам нужно: см.
[Коды выхода](/docs/ru/ci/exit-codes/) о значении каждого из них.

## Несколько плат одновременно

Один проект на шаг или матрица — но учитывайте параллелизм вашего плана:
Maker запускает 1 задание одновременно, а Pro — 2. Третий параллельный
запуск отклоняется с кодом выхода 4 и ничего не стоит, поэтому ограничьте
матрицу самостоятельно:

```yaml
jobs:
  simulate:
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 2
      matrix:
        project: [uno-ready, esp32s3-boot]
    steps:
      - uses: actions/checkout@v4
      - uses: velxio/velxio-ci-action@v1
        with:
          token: ${{ secrets.VELXIO_CLI_TOKEN }}
          path: test/ci/projects/${{ matrix.project }}
          expect_text: "READY"
```

## Раннеры

Поддерживаются раннеры Linux, macOS и Windows, на x64 и на ARM64
(Windows только на x64). Действие определяет тег релиза, проверяет
бинарный файл по `SHA256SUMS` релиза и кэширует его в `actions/cache` с
ключом по версии и платформе — поэтому только первое задание новой версии
CLI что-либо скачивает.

## Загрузка того, что произвёл запуск

Журналы serial и скриншоты — это обычные файлы в каталоге проекта:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: velxio-run
    path: |
      firmware/blink/serial.log
      firmware/blink/*.png
```

с `serial_log_file: serial.log` на шаге запуска.

## Другие CI-системы

Нигде больше нет действия для установки — установите CLI и вызовите его:

```yaml
script:
  - curl -fsSL https://velxio.dev/ci/install.sh | sh
  - ~/.velxio/bin/velxio-cli run --expect-text 'READY' --timeout 10000 .
```

с `VELXIO_CLI_TOKEN` в секретном окружении задания. Код выхода — это весь
контракт, и он одинаков везде.
