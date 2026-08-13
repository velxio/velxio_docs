---
title: Raspberry Pi (Linux)
description: 本格的なLinux Raspberry Piボード — ZeroからPi 5まで — 実際のシェル、GPIO、Pythonを備えています。
sidebar:
  order: 7
  badge: PRO
---

Linux Raspberry Piファミリーは、クラウド上で**完全なRaspberry Pi OS**を起動し、ターミナルを提供します。これらはマイクロコントローラのシミュレーションではなく、完全なコンピュータです。

| ボード                         | CPUプロファイル      |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7クラス |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

すべてのPiボードは**Pro**です — [プラン](/docs/ja/getting-started/plans/)を参照してください。

## 仕組み

1. Piを配置し、**Start**（開始）を押します — WebSocketコンソールが約1秒で接続され、その後Linuxが起動します（シェルが表示されるまで30〜60秒かかります。「Booting…」オーバーレイが進行状況を表示します）。
2. 実際のシェルが表示されます: `python3`、`pip`、`ls /sys/class/gpio` — 本物のユーザーランドです。
3. **GPIOはキャンバスに配線されています**: `gpiozero`からLEDを駆動し、ボタンを読み取り、配置したコンポーネントとI2C/SPI通信を行います — プロトコルシムがLinux GPIOをシミュレートされた回路にブリッジします。
4. **仮想ファイルシステムパネル**で、スクリプトやファイルを実行中のPiにアップロードできます。

```python
from gpiozero import LED
from time import sleep

led = LED(17)
while True:
    led.toggle()
    sleep(0.5)
```

## UNIHIKER M10

DFRobotの教育用SBC（内蔵タッチスクリーンを備えたLinuxボード）は、同じインフラストラクチャ上で動作し、これもProボードです — Piファミリーの隣のピッカーで見つけることができます。

----- END PAGE -----
