---
title: 言語 — Arduino、MicroPython、ESP-IDF
description: 各ボードで動作する言語と、その切り替え方法。
sidebar:
  order: 2
---

ツールバーの**言語セレクタ**は、アクティブなボードのコードの記述方法とビルド方法を切り替えます。言語を切り替えると、ワークスペースのファイルセットが入れ替わります（`sketch.ino` が `main.py` になるなど）。

## Arduino C++

ほぼすべての環境でデフォルトとなる言語です。ターゲット向けに実際のArduinoツールチェーンでコンパイルされる、標準的な `setup()` / `loop()` スケッチです。**Libraries**（ライブラリ）ボタンを使用して、公開されているArduinoライブラリを追加できます。詳細は [Libraries](/docs/ja/programming/libraries/) を参照してください。

Linux Raspberry Pi ファミリーを除くすべてのボードで利用できます。

## MicroPython

エミュレートされたチップ上で動作する実際のMicroPythonファームウェアです。REPLはシリアルモニタ経由で動作し、`import machine` などはハードウェア上と同じように動作します。

対応ボード:

- **Raspberry Pi Pico / Pico W** (RP2040)
- **ESP32 classic** — DevKit V1、DevKit-C v4、ESP32-CAM、Lolin32 Lite
- **ESP32-S3** — DevKit、XIAO ESP32-S3、Arduino Nano ESP32
- **ESP32-C3** — DevKit、XIAO ESP32-C3、C3 SuperMini

## ESP-IDF

純粋なESP-IDFプロジェクト（`app_main()` エントリポイント、IDF API、Arduinoコアなし）で、同じESP-IDFツールチェーンでコンパイルされます。本番環境に書き込むようなコードを書く場合に使用します。

上記のMicroPythonと同じESP32ファミリーボードで利用できます。

## Linux上のPython (Raspberry Pi)

Linux Raspberry Pi ボード（Zero から 5 まで）は言語セレクタを使用しません。完全なLinuxで起動し、実際のシェルで作業します。シミュレートされたGPIOに対して `gpiozero`/`RPi.GPIO` を使用してPythonを実行します。これは実機のPiとまったく同じです。[ボードページ](/docs/ja/boards/overview/) を参照してください。
