---
title: STM32
description: Blue Pill、Black Pill、F4 Discoveryなど — ARM Cortex-Mエミュレーション。
sidebar:
  order: 6
---

定番のホビー向けSTM32ボードをSoCレベルでエミュレートします：

| ボード                           | MCU                  | コア           |
| -------------------------------- | -------------------- | -------------- |
| **Blue Pill**                    | STM32F103C8 (64 KB)  | Cortex-M3      |
| **Blue Pill F103CB**             | STM32F103CB (128 KB) | Cortex-M3      |
| **Black Pill**                   | STM32F411CE          | Cortex-M4      |
| **Black Pill F401**              | STM32F401CE          | Cortex-M4      |
| **STM32F4 Discovery**            | STM32F407VG          | Cortex-M4      |
| **Olimex STM32-H405**            | STM32F405RG          | Cortex-M4      |
| **Netduino Plus 2 / Netduino 2** | STM32F405 / F205     | Cortex-M4 / M3 |

**言語:** Arduino C++（STM32duinoコア）。

## 注記

- GPIO、タイマー、UART、および通常のArduino APIサーフェスが動作します。ギャラリーのRGB
  カラーサイクルとディスプレイの例は、何が実行されているかを確認するのに適しています。
- STM32プロジェクトは実際の`stm32` Arduinoコアでコンパイルされるため、
  レジスタレベルのコード（`HAL_`、直接ペリフェラルアクセス）もIDEと同じようにビルドされます。
- お持ちの正確なバリアントを選択してください — F103C8とF103CB、またはF401とF411の間の
  フラッシュサイズとピン配置の違いがモデル化されています。
