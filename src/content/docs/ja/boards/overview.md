---
title: 対応ボード
description: Velxioでシミュレーションできるすべてのボードをファミリー別に紹介します。
sidebar:
  order: 1
---

Velxioは8つのファミリーのボードをシミュレーションします。一部は完全に
ブラウザ上で動作し、より大きなものはVelxioのクラウドエミュレータ上で動作します。特別な操作は
必要ありません。Playを押せばそのまま動作します。

| ファミリー               | ボード                                                                                                                                                                                              | 言語                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Arduino / AVR        | UNO、Nano、Mega、ATtiny85                                                                                                                                                                           | Arduino C++                                                   |
| ESP32 classic        | ESP32 DevKit、DevKit-C v4、ESP32-CAM、Lolin32 Lite                                                                                                                                                  | Arduino C++、MicroPython、ESP-IDF                             |
| ESP32-S3             | ESP32-S3、XIAO ESP32-S3、Arduino Nano ESP32                                                                                                                                                         | Arduino C++、MicroPython、ESP-IDF                             |
| ESP32-C3             | ESP32-C3、XIAO ESP32-C3、C3 SuperMini                                                                                                                                                               | Arduino C++、MicroPython、ESP-IDF                             |
| RP2040 / RP2350      | Raspberry Pi Pico、Pico W、Badger 2350 (Pro)                                                                                                                                                        | Arduino C++、MicroPython                                      |
| Seeed XIAO           | ESP32S3 Sense、ESP32C6、RP2040、RP2350、nRF52840 Sense、SAMD21、RA4M1、MG24 Sense、nRF54L15 Sense、IPS Displayボード                                                                           | Arduino C++（ESP32およびRP2040/RP2350のものはMicroPython） |
| BBC micro:bit        | micro:bit V2（単体、または7種類のDFRobotボードに搭載: Maqueen LiteとLite V5、micro:Driver、micro:IO-BOX、IO Extender、micro:Mate、Robotics & Power IO Extender）([ページ](/docs/ja/boards/microbit/)) | MicroPython                                                   |
| STM32                | Blue Pill、Black Pill、F4 Discovery、Olimex H405、Netduino                                                                                                                                          | Arduino C++                                                   |
| Raspberry Pi (Linux) | Zero、1、2、3、4、5                                                                                                                                                                                 | 完全なLinuxターミナル上のPython                               |

**STM32**と**Raspberry Pi (Linux)**ファミリーはVelxioの
エミュレーションサーバー上で動作し、有料プランが必要です。コンポーネントピッカーでは
PROバッジが表示されます。M5Stack CardputerやBadger 2350などのブランドボードを含む
その他のすべてのボードは無料プランで動作します。詳しくは
[プラン](/docs/ja/getting-started/plans/)をご覧ください。

各ボードにはこのセクション内に専用ページがあり、ピン配置、対応言語、
固有の注意点を確認できます。
