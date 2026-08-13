---
title: Raspberry Pi Pico & Pico W
description: RP2040ボード — ブラウザ内エミュレーションでMicroPythonとArduinoをサポート。
sidebar:
  order: 5
---

RP2040ボードは、忠実なデュアルコア
Cortex-M0+エミュレーションにより**ブラウザ内で**動作します。

| ボード                   | ハイライト                                |
| ----------------------- | ----------------------------------------- |
| **Raspberry Pi Pico**   | 標準のRP2040ボード、26 GPIO        |
| **Raspberry Pi Pico W** | WiFiモジュールフットプリントを備えた同ボード |

**言語:** MicroPython (Picoのネイティブ環境) とArduino C++
(earlephilhowerコア)。

## 動作するもの

- GPIO、PWM、ADC、I2C、SPI、UART — そして**PIO**。RP2040の特徴である
  プログラマブルI/Oブロックで、NeoPixelや変則プロトコルの
  例が依存しています。
- [シリアルモニター](/docs/ja/programming/serial-monitor/)を介したMicroPythonのREPL。
- [web flash](/docs/ja/wifi-iot/web-flash/)を使用して、`.uf2`経由で実機のPicoに書き込む。

## RP2350はどこ?

**Badger 2350** (PimoroniのRP2350 e-paperバッジ) は
[Proボード](/docs/ja/boards/pro-boards/)です — 完全なBadgeOS
ファクトリーファームウェア、e-paperなどを起動します。

----- END PAGE -----
