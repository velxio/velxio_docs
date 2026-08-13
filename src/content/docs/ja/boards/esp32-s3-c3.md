---
title: ESP32-S3 および ESP32-C3
description: 新しいXtensa S3およびRISC-V C3ファミリー（XIAOおよびNanoバリアントを含む）。
sidebar:
  order: 4
---

## ESP32-S3 (Xtensa LX7、デュアルコア)

| ボード                  | ハイライト                                              |
| ---------------------- | ------------------------------------------------------- |
| **ESP32-S3 DevKit**    | リファレンスS3ボード — AIアクセラレーション、豊富なRAM |
| **XIAO ESP32-S3**      | Seeedの親指サイズのS3、11ピン                         |
| **Arduino Nano ESP32** | クラシックなNanoフォームファクターのS3、RGB LED        |

## ESP32-C3 (RISC-V、シングルコア)

| ボード                  | ハイライト                                |
| ---------------------- | ----------------------------------------- |
| **ESP32-C3 DevKit**    | リファレンスC3 — 小型、低価格、WiFi+BLE |
| **XIAO ESP32-C3**      | Seeedの小型C3                           |
| **ESP32-C3 SuperMini** | 人気の切手サイズのC3ボード                |

**言語**（両ファミリー共通）: Arduino C++、MicroPython、ESP-IDF。

## 同じプラットフォーム、異なるシリコン

[クラシックESP32ページ](/docs/ja/boards/esp32/)のすべてが適用されます —
`Velxio-GUEST`上のWiFi、ペリフェラルセット、Webフラッシュ — ただし、
ファームウェアは適切なコア向けにビルドされ、そのコア上で実行されます: S3はXtensa LX7、
C3はRISC-V。命令レベルの違いは忠実にエミュレートされるため、
同じスケッチのS3バイナリとC3バイナリは、実際のハードウェアとまったく同じように動作します。

**ESP32-C6**、**XIAO ESP32S3 Sense**（カメラ + マイク +
microSD）、または**XIAO ESP32C6**をお探しですか？ それらは
[Proボード](/docs/ja/boards/pro-boards/)です。
----- END PAGE -----
