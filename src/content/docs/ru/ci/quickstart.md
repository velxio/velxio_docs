---
title: Быстрый старт CI
description: "От нуля до успешного запуска за пять минут — установите CLI, напишите два файла, запустите."
sidebar:
  order: 2
---

Вам нужен аккаунт Velxio на платном тарифе и скомпилированный файл прошивки. Симулятор здесь ничего не компилирует: принесите `.hex`, `.bin`, `.uf2` или `.elf`, созданный вашей собственной цепочкой инструментов.

## 1. Установите CLI

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
```

Он кладёт единственный бинарный файл в `~/.velxio/bin` и подсказывает, как добавить его в ваш `PATH`. Windows: `iwr https://velxio.dev/ci/install.ps1 -useb | iex`. Бинарные файлы доступны на [странице релизов](https://github.com/velxio/velxio-cli/releases), если вы предпочитаете скачать их самостоятельно.

## 2. Войдите в систему

```bash
velxio-cli login
```

Он выводит короткий код, открывает браузер и ждёт. Подтвердите запрос, и CLI сохранит то, что ему передали — вам никогда не придётся самостоятельно обращаться с токеном на своей машине.

```
code     7XJ6-33M5
approve  https://velxio.dev/account/ci/device?code=7XJ6-33M5
waiting for approval of 7XJ6-33M5 (the code expires in 10 min)
signed in as velxio-cli on laptop
```

Страница показывает, что именно запрашивает доступ, с какой машины и зачем, прежде чем вы что-либо подтвердите:

![Страница в браузере, подтверждающая вход в CLI: на ней указаны инструмент, машина, на которой он работает, и то, что он запрашивает, с кнопками Approve и Deny](../../../../assets/docs/ci/device-approve.png)

У задания CI нет браузера, поэтому вместо этого оно несёт один секрет. Тот же процесс его создаёт, с именем по репозиторию, в котором он будет храниться:

```bash
velxio-cli login --ci --name "my-firmware"
```

Этот вариант выводит токен один раз — сохраните его как секрет репозитория (в GitHub: Settings, Secrets and variables, Actions) и никогда не храните его в самом репозитории. Оба типа отображаются на [velxio.dev/account/ci](https://velxio.dev/account/ci), где вы можете отозвать любой из них.

## 3. Опишите проект

Два файла рядом с вашей прошивкой. `velxio-cli init` создаёт начальную пару, или напишите их вручную:

```toml
# velxio.toml
[velxio]
version = 1
board = "esp32-s3"
firmware = "build/blink.bin"
```

```json
{
  "version": 1,
  "parts": [
    { "type": "board-esp32-s3-devkitc-1", "id": "esp", "top": 0, "left": 0 },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 0,
      "left": 120,
      "attrs": { "color": "red" }
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": 60,
      "left": 60,
      "attrs": { "value": "220" }
    }
  ],
  "connections": [
    ["esp:2", "r1:1", "green", []],
    ["r1:2", "led1:A", "green", []],
    ["led1:C", "esp:GND.1", "black", []]
  ]
}
```

Это формат `diagram.json` от Wokwi, так что существующая схема подойдёт как есть.

## 4. Запустите его

```bash
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

Прошивка загружается, вывод последовательного порта появляется по мере поступления, и команда завершается с кодом 0, как только текст появится — или 42, когда десять симулированных секунд истекут без него.

```
velxio-cli 0.1.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 3 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## 5. Добавьте его в CI

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
```

Компилируйте на предыдущем шаге; этот шаг только запускает то, что вы собрали.

## Когда ничего не работает

- **`exit 2` до того, как что-либо запустилось.** Проблема с конфигурацией: плата не из тех, которые запускает Velxio, прошивка не соответствует плате, или в сценарии есть шаг, называющий компонент, которого нет в вашей схеме. Ничего не было списано. `velxio-cli lint .` находит большинство таких проблем без токена и без сети.
- **`exit 3`.** Токен отсутствует, отозван или принадлежит тарифу без CI.
- **`exit 4`.** Не осталось минут в этом месяце, или одновременно запущено больше заданий, чем позволяет ваш тариф.
- **Текст так и не появляется.** Увеличьте `--timeout`, затем запустите без каких-либо ожиданий (`velxio-cli run --timeout 5000 .`), чтобы прочитать, что на самом деле выводит прошивка.
