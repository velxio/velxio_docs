---
title: velxio.toml
description: "Файл проекта, который читает Velxio CI — плата, прошивка, схема и сценарий — с платами, которые CI поддерживает сегодня, и тем, как разрешается каждый путь."
sidebar:
  order: 3
---

`velxio.toml` сообщает CLI, что запускать: какую плату, какую скомпилированную
прошивку, какую схему и какой сценарий. Он лежит в каталоге, на который вы
указываете CLI. Каждый путь в нём относителен самого файла, а прямые слэши
работают в любой ОС.

```toml
[velxio]
version = 1                      # required
board = "esp32-s3"               # Velxio board kind
firmware = "build/app.bin"       # .hex | .bin | .uf2 | merged ESP32 image
diagram = "diagram.json"         # Wokwi-format circuit (the default when present)
scenario = "test.yaml"           # default scenario; --scenario overrides it
```

`velxio-cli init --board arduino-uno` создаёт стартовый `velxio.toml` и
`diagram.json` с одной платой в нём.

## Ключи

| ключ           | значение                                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | должен быть `1`.                                                                                                                             |
| `board`        | вид платы Velxio (таблица ниже). Необязателен, когда схема или `.vlx` уже называют плату; когда присутствуют оба, они должны совпадать.      |
| `firmware`     | скомпилированный образ: `.hex`, `.bin`, `.uf2` или объединённый образ прошивки ESP32.                                                        |
| `flasher_args` | ESP-IDF `build/flasher_args.json` вместо `firmware`. Эти два варианта взаимоисключающие.                                                     |
| `elf`          | ELF, используемый при отсутствии `firmware`. Преобразуется для плат AVR и RP2040.                                                           |
| `diagram`      | схема в формате Wokwi `diagram.json`.                                                                                                        |
| `project`      | экспорт проекта Velxio `.vlx`. Имеет приоритет над `diagram`.                                                                                |
| `scenario`     | YAML сценария, запускаемый по умолчанию. См. [Сценарии](/docs/ru/ci/scenarios/).                                                                |
| `language`     | `arduino`. `micropython` отклоняется с кодом выхода 2 — CI запускает только скомпилированные прошивки.                                        |

Ничто не игнорируется молча. Неизвестный CLI ключ — это предупреждение;
функция, которая ещё не реализована, завершает запуск с `feature_unsupported`
вместо того, чтобы тихо запустить другой проект, не тот, что вы написали.
`[[chip]]` (пользовательские чипы) — один из таких случаев: сегодня он
отклоняется с указанием исходного файла.

## Платы, которые CI поддерживает сегодня

Решает сервер, а не CLI. Сейчас работают тридцать шесть видов — каждая плата
с движком в браузере, каждая проверена загрузкой реальной прошивки.

### AVR

| вид | плата | тип в `diagram.json` | прошивка |
| ---- | ----- | ------------------- | -------- |
| `arduino-uno` | Arduino Uno | `wokwi-arduino-uno` | Intel HEX |
| `arduino-nano` | Arduino Nano | `wokwi-arduino-nano` | Intel HEX |
| `arduino-mega` | Arduino Mega | `wokwi-arduino-mega` | Intel HEX |
| `attiny85` | ATtiny85 | `wokwi-attiny85` | Intel HEX |

### RP2040 и RP2350

| вид | плата | тип в `diagram.json` | прошивка |
| ---- | ----- | ------------------- | -------- |
| `raspberry-pi-pico` | Raspberry Pi Pico | `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | образ flash |
| `pi-pico-w` | Raspberry Pi Pico W | `board-pi-pico-w` | образ flash |
| `xiao-rp2040` | XIAO RP2040 | `board-velxio-xiao-rp2040` | образ flash |
| `xiao-rp2350` | XIAO RP2350 | `board-velxio-xiao-rp2350` | образ flash |
| `pimoroni-pico-plus-2w` | Pimoroni Pico Plus 2 W | `board-velxio-pimoroni-pico-plus-2w` | образ flash |
| `badger-2350` | Pimoroni Badger 2350 | `board-velxio-badger-2350` | образ flash |
| `stellar-unicorn` | Pimoroni Stellar Unicorn | `board-velxio-stellar-unicorn` | образ flash |

### XIAO ARM

| вид | плата | тип в `diagram.json` | прошивка |
| ---- | ----- | ------------------- | -------- |
| `xiao-nrf52840-sense` | XIAO nRF52840 Sense | `board-velxio-xiao-nrf52840-sense` | Intel HEX |
| `xiao-samd21` | XIAO SAMD21 | `board-velxio-xiao-samd21` | Intel HEX |
| `xiao-ra4m1` | XIAO RA4M1 | `board-velxio-xiao-ra4m1` | Intel HEX |
| `xiao-mg24-sense` | XIAO MG24 Sense | `board-velxio-xiao-mg24-sense` | Intel HEX |
| `xiao-nrf54l15-sense` | XIAO nRF54L15 Sense | `board-velxio-xiao-nrf54l15-sense` | Intel HEX |

### ESP32

| вид | плата | тип в `diagram.json` | прошивка |
| ---- | ----- | ------------------- | -------- |
| `esp32` | ESP32 DevKit v1 | `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | объединённый образ ESP32 |
| `esp32-s3` | ESP32-S3 DevKitC-1 | `board-esp32-s3-devkitc-1` | объединённый образ ESP32 |
| `esp32-c3` | ESP32-C3 DevKitM-1 | `board-esp32-c3-devkitm-1` | объединённый образ ESP32 |
| `esp32-c6` | ESP32-C6 DevKitC-1 | `board-esp32-c6-devkitc-1` | объединённый образ ESP32 |
| `esp32-devkit-c-v4` | ESP32 DevKitC v4 | `board-esp32-devkit-c-v4` | объединённый образ ESP32 |
| `esp32-cam` | ESP32-CAM | `board-esp32-cam` | объединённый образ ESP32 |
| `wemos-lolin32-lite` | WEMOS LOLIN32 Lite | `board-wemos-lolin32-lite` | объединённый образ ESP32 |
| `xiao-esp32-s3` | XIAO ESP32-S3 | `board-xiao-esp32-s3` | объединённый образ ESP32 |
| `arduino-nano-esp32` | Arduino Nano ESP32 | `board-arduino-nano-esp32` | объединённый образ ESP32 |
| `xiao-esp32-c3` | XIAO ESP32-C3 | `board-xiao-esp32-c3` | объединённый образ ESP32 |
| `aitewinrobot-esp32c3-supermini` | ESP32-C3 SuperMini | `board-aitewinrobot-esp32c3-supermini` | объединённый образ ESP32 |
| `xiao-esp32c6` | XIAO ESP32-C6 | `board-xiao-esp32-c6` | объединённый образ ESP32 |
| `esp32-p4` | ESP32-P4 Function EV | `board-esp32-p4-function-ev` | объединённый образ ESP32 |
| `m5stack-core` | M5Stack Core | `board-velxio-m5stack-core` | объединённый образ ESP32 |
| `esp32-c3-lcdkit` | ESP32-C3-LCDkit | `board-velxio-esp32-c3-lcdkit` | объединённый образ ESP32 |
| `cardputer-adv` | M5Stack Cardputer ADV | `board-velxio-cardputer-adv` | объединённый образ ESP32 |
| `xiao-esp32s3-sense` | XIAO ESP32-S3 Sense | `board-velxio-xiao-esp32s3-sense` | объединённый образ ESP32 |
| `esp-vocat` | ESP-VoCat | `board-velxio-esp-vocat` | объединённый образ ESP32 |
| `esp32-s3-eye` | ESP32-S3-EYE | `board-velxio-esp32-s3-eye` | объединённый образ ESP32 |
| `esp-sensairshuttle` | ESP-SensAirShuttle | `board-velxio-esp-sensairshuttle` | объединённый образ ESP32 |

Любую из них можно также записать как `board-velxio-<kind>` в схеме,
например `board-velxio-esp32-c6`; у плат, не имеющих собственного типа Wokwi,
нет другого написания.

`velxio-cli boards` выводит актуальный список с состоянием каждой платы, её
типами в `diagram.json` и форматами прошивки, которые она принимает.

:::caution
Остальное работает в редакторе, но пока не в CI: платы STM32 (им нужна
линия QEMU), платы Raspberry Pi и UNIHIKER, предварительный devkit ESP32-P4
и семейство DFRobot, которое всё ещё за своим флагом запуска. Каждая
отклоняется до начала запуска с `board_not_supported_in_ci` и указанием
фазы, для которой она запланирована. Ничего не тарифицируется, и никакая
близкая плата не подставляется молча.
:::

Pico W работает, но в CI нет сети: WiFi и сокеты никогда не подключаются,
и запуск несёт предупреждение `no_network`.

## Как разрешаются пути

- **Файл конфигурации:** `velxio.toml`, затем `wokwi.toml`, затем ровно один
  `*.vlx` в каталоге. Если ни одного из них нет — код выхода 2.
- **Схема:** `--project-file`, затем `[velxio] project`, затем
  `--diagram-file`, затем `[velxio] diagram`, затем `diagram.json` рядом с
  файлом конфигурации.
- **Прошивка:** `--firmware`, затем `--elf`, затем `[velxio] firmware` или
  `flasher_args`, затем `[velxio] elf`, затем `[wokwi] firmware`, затем
  `[wokwi] elf`.
- **Плата:** `[velxio] board`, затем часть схемы, описывающая плату (или
  активная плата `.vlx`).

Относительные пути, указанные в командной строке, разрешаются относительно
каталога проекта, а не рабочего каталога вашей оболочки.

## diagram.json

Формат Wokwi, читается как есть: `version: 1`, `parts` из
`{id, type, left, top, attrs, rotate, hide}` и `connections` из
`[from, to, color, path]`. Идентификаторы частей в схеме — это идентификаторы,
которые используют шаги вашего сценария.

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

Части — это элементы `wokwi-*` (`wokwi-led`, `wokwi-pushbutton`,
`wokwi-dht22` и так далее). Тип части, который CLI не распознаёт, — это
предупреждение, а не ошибка: решает сервер, а части, которые он не может
симулировать, сообщаются по id, а не отбрасываются молча.

## .vlx

Проект, экспортированный из редактора Velxio (`format: "velxio-project"`,
`version: 1`), может быть схемой вместо diagram. Поместите единственный
`.vlx` в каталог или укажите его через `project =` или `--project-file`.
Основная плата экспорта — это плата запуска; прошивка по-прежнему берётся
из toml или из `--firmware`.

## Ограничения

| что                        | предел                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| прошивка на плату          | 16 MiB                                                                                             |
| все загруженные файлы за запуск | 20 MiB                                                                                         |
| схема                      | 300 частей, 2 000 проводов                                                                         |
| сценарий                   | 200 шагов, 20 скриншотов, 512 байт на текст `wait-serial`                                          |
| `--timeout`                | потолок вашего тарифа (5 мин на Maker, 10 мин на Pro) и никогда больше, чем у вас осталось минут   |

`--timeout` выше потолка — не ошибка: он ограничивается, и запуск сообщает
предупреждение `timeout_clamped` с бюджетом, который фактически получил.

## Проверьте перед тем, как тратить минуты

```bash
velxio-cli lint .
```

`lint` не требует ни токена, ни сети. Он разбирает toml, разрешает каждый
путь, проверяет, что файлы существуют и укладываются в лимиты, проверяет,
что идентификаторы частей уникальны и соединения ссылаются на существующие
части, проверяет, что плата входит в число поддерживаемых CI, проверяет,
что формат прошивки соответствует семейству платы, и проверяет, что каждый
шаг сценария известен, имеет свои поля, ссылается на существующие части и
корректно разбирает свои длительности. Большинство сбоев с `exit 2` дешевле
найти здесь.
