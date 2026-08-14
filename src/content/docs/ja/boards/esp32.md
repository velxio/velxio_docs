---
title: ESP32 (クラシック)
description: ESP32 DevKit V1、DevKit-C V4、ESP32-CAM、Wemos Lolin32 Lite。
sidebar:
  order: 3
---

オリジナルのデュアルコアXtensa ESP32 — カタログの主力であり、シミュレータで
**WiFiとBluetooth** が利用可能です。

| ボード                 | 特長                                           |
| ---------------------- | ---------------------------------------------- |
| **ESP32 DevKit V1**    | 標準の30ピン開発キット。GPIO2に内蔵LED         |
| **ESP32 DevKit-C V4**  | 公式Espressif開発キット、38 GPIO               |
| **ESP32-CAM**          | ESP32 + 2 MPカメラモジュール + microSDスロット |
| **Wemos Lolin32 Lite** | コンパクト、LiPo充電器フットプリント           |

**言語:** Arduino C++、MicroPython、ESP-IDF — ツールバーの
[言語セレクタ](/docs/ja/programming/languages/)で切り替えます。

## 動作するもの

- **WiFi**: `Velxio-GUEST` に接続して実際のインターネットに到達 —
  [ESP32 WiFi](/docs/ja/wifi-iot/esp32-wifi/) を参照。
- **ペリフェラル**: GPIO、PWM (LEDC)、ADC、I2C、SPI、UART、および
  タイマー/割り込み機構 — ファームウェアは実際のROMログで起動します。
- **ESP32-CAM** は、シミュレータのコンポーネントパネルでカメラとmicroSDを公開します。
- **Webフラッシュ**: 同じバイナリをUSB経由で物理的なESP32にプッシュ —
  [方法](/docs/ja/wifi-iot/web-flash/)。

## 注意事項

- セッションの最初のESP-IDF/Arduinoコンパイルは遅いです。以降の
  ビルドはキャッシュされます。
- 内蔵の点滅例
  ([最初のプロジェクト](/docs/ja/getting-started/first-project/)) は
  DevKit V1を対象としています。
  ----- END PAGE -----
