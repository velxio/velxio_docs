---
title: MicroPython クイックスタート
description: 実際のMicroPythonファームウェアを実行 — REPL含む — ESP32およびPicoボード上で。
sidebar:
  order: 3
---

VelxioはMicroPythonを近似するのではなく、エミュレートされたチップ上で**実際のMicroPython
ファームウェア**を起動します。`import machine`はハードウェア上と同様に動作し、
[シリアルモニター](/docs/ja/programming/serial-monitor/)はREPLとしても機能します。

## ワンクリックで試す

ギャラリーのナイトライトの例を開きます — LDR（フォトレジスタ）が
LEDを制御する、純粋なMicroPythonの例です：

![MicroPythonナイトライトの例](../../../../assets/docs/programming/micropython-editor.png)

ツールバーに注目してください：言語セレクタは**MicroPython**と表示され、ファイル
ツリーにはスケッチの代わりに`main.py`が表示されます。**Run**を押します：

![ナイトライト実行中 — LDRをドラッグしてLEDを確認](../../../../assets/docs/programming/micropython-running.png)

実行中に、**フォトレジスタ**をクリックして光のレベルをドラッグすると —
ADCの読み取り値が変化し、コードが決定したとおりにLEDが切り替わります。

## 基本

```python
from machine import Pin, ADC
import time

led = Pin(4, Pin.OUT)
ldr = ADC(Pin(34))

while True:
    if ldr.read() < 1000:   # 暗い
        led.on()
    else:
        led.off()
    time.sleep_ms(200)
```

- **`machine.Pin` / `ADC` / `PWM` / `I2C` / `SPI`** — Arduinoスケッチが使用するのと
  同じシミュレートされたペリフェラルを駆動します。
- **REPL** — スクリプトを停止し、シリアルモニターで対話的にPythonを入力します；
  `help()`もタブ補完も機能します。
- **WiFi** — ESP32ボードでは、`network.WLAN`がハードウェア上と同様に
  `Velxio-GUEST`に接続します：[ESP32 WiFi](/docs/ja/wifi-iot/esp32-wifi/)を参照。
- **追加モジュール** — `main.py`の隣に純粋なPythonファイルを追加してインポート
  できます：[ライブラリの使用](/docs/ja/programming/libraries/)を参照。

## 対応ボード

MicroPythonはRaspberry Pi **Pico / Pico W**（本来のホーム）および
**ESP32ファミリー**全体で利用可能です — 完全なマトリックスは
[言語](/docs/ja/programming/languages/)にあります。ツールバーの言語セレクタで
対応ボードをMicroPythonに切り替えると、Velxioがファイルセットを自動的に交換します。
