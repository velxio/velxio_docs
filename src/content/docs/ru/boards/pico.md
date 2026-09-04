---
title: Raspberry Pi Pico и Pico W
description: Платы RP2040 — эмуляция в браузере с поддержкой MicroPython и Arduino.
sidebar:
  order: 5
---

Платы RP2040 работают **в вашем браузере** с точной эмуляцией двухъядерного
Cortex-M0+.

| Плата                    | Особенности                                |
| ------------------------ | ------------------------------------------ |
| **Raspberry Pi Pico**    | Стандартная плата RP2040, 26 GPIO          |
| **Raspberry Pi Pico W**  | Та же плата с посадочным местом для WiFi-модуля |

**Языки:** MicroPython (родная среда Pico) и Arduino C++
(ядро earlephilhower).

![Raspberry Pi Pico W на холсте Velxio](../../../../assets/docs/boards/pi-pico-w.png)

## Что работает

- GPIO, PWM, ADC, I2C, SPI, UART — и **PIO**, фирменные программируемые
  блоки ввода-вывода RP2040, на которые опираются примеры с NeoPixel и
  нестандартными протоколами.
- REPL MicroPython через [последовательный монитор](/docs/ru/programming/serial-monitor/).
- Прошивка реального Pico из браузера: плата переходит в режим BOOTSEL, и
  диалоговое окно записывает файл `.uf2` через WebUSB, либо вы скачиваете
  файл и перетаскиваете его на диск. См. [веб-прошивка](/docs/ru/wifi-iot/web-flash/).

## Где RP2350?

**Badger 2350** (электронно-чернильный бейдж Pimoroni на RP2350) — это
[Pro-плата](/docs/ru/boards/pro-boards/): она загружает полную заводскую
прошивку BadgeOS, включая электронные чернила.

## Изображения плат и распиновка

Художественное изображение каждой платы на холсте и полная карта выводов,
сгенерированные симулятором:

[Raspberry Pi Pico](/docs/ru/boards/reference/raspberry-pi-pico/) ·
[Raspberry Pi Pico W](/docs/ru/boards/reference/pi-pico-w/)
