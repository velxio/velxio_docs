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
| **Raspberry Pi Pico W**  | Та же плата с посадочным местом для модуля WiFi |

**Языки:** MicroPython (родная среда Pico) и Arduino C++
(ядро earlephilhower).

## Что работает

- GPIO, PWM, ADC, I2C, SPI, UART — и **PIO**, фирменные программируемые
  блоки ввода-вывода RP2040, на которые полагаются примеры с NeoPixel
  и нестандартными протоколами.
- REPL MicroPython через [последовательный монитор](/docs/ru/programming/serial-monitor/).
- Прошивка реального Pico через его `.uf2` с помощью
  [веб-прошивки](/docs/ru/wifi-iot/web-flash/).

## Где RP2350?

**Badger 2350** (электронно-бумажный бейдж Pimoroni на RP2350) — это
[Pro-плата](/docs/ru/boards/pro-boards/) — она загружает полную заводскую
прошивку BadgeOS, включая электронную бумагу.

----- END PAGE -----
