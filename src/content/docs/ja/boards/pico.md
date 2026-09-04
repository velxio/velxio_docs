---
title: Raspberry Pi Pico & Pico W
description: RP2040ボード — MicroPythonとArduinoに対応したブラウザ内エミュレーション。
sidebar:
  order: 5
---

RP2040ボードは、忠実なデュアルコア
Cortex-M0+エミュレーションにより**ブラウザ内で**動作します。

| ボード                   | 特長                                |
| ----------------------- | ----------------------------------------- |
| **Raspberry Pi Pico**   | 標準的なRP2040ボード、26 GPIO        |
| **Raspberry Pi Pico W** | WiFiモジュール用フットプリントを備えた同ボード |

**言語:** MicroPython (Picoのネイティブ環境) とArduino C++
(earlephilhowerコア)。

![Velxioキャンバス上のRaspberry Pi Pico W](../../../../assets/docs/boards/pi-pico-w.png)

## 動作するもの

- GPIO、PWM、ADC、I2C、SPI、UART — そして**PIO**。RP2040の特徴である
  プログラム可能なI/Oブロックで、NeoPixelや変則的なプロトコルの
  例はこれに依存しています。
- [シリアルモニター](/docs/ja/programming/serial-monitor/)を介したMicroPythonのREPL。
- ブラウザから実機のPicoへのフラッシュ: ボードがBOOTSELモードになり、
  ダイアログがWebUSB経由で`.uf2`を書き込むか、ファイルをダウンロードして
  ドライブにドロップします。[ウェブフラッシュ](/docs/ja/wifi-iot/web-flash/)を参照してください。

## RP2350はどこ?

**Badger 2350** (PimoroniのRP2350 e-paperバッジ) は
[Proボード](/docs/ja/boards/pro-boards/)です — 完全なBadgeOS
ファクトリーファームウェア、e-paperなどを起動します。

## ボードの外観とピン配置

各ボードのキャンバス上の外観と完全なピンマップは、シミュレーターから生成されます:

[Raspberry Pi Pico](/docs/ja/boards/reference/raspberry-pi-pico/) ·
[Raspberry Pi Pico W](/docs/ja/boards/reference/pi-pico-w/)
