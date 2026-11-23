---
title: "BBC micro:bit"
description: "BBC micro:bit V2 と、そのための DFRobot 製ボード7種。公式 MicroPython ファームウェアをブラウザ上で実行できます。"
sidebar:
  order: 5.5
---

**BBC micro:bit V2** は、nRF52833 チップ向けのブラウザ内エンジン上で、独自の公式 MicroPython ファームウェア（2.1.1）を改変せずに Velxio で動作します。MicroPython を書いて **Run** を押すと、プログラムはブラウザのタブ内で実行されます。無料プランを含むすべてのプランで利用できます。

![Velxio キャンバス上の BBC micro:bit V2](../../../../assets/docs/boards/microbit-v2.png)

## 動作するもの

- 5x5 の LED マトリクス、ボタン A と B、タッチロゴ。クリックできる描画で表示されます。
- モーションセンサー（ボード下のパッドを傾けます）、方位、温度、明るさ、音の大きさ。ボードのセンサーパネルから設定します。
- スピーカー（そのパネルでサウンドをオンにすると使えます）、およびエッジコネクタ。実機と同じように、LED、ポテンショメーター、サーボ、Grove センサーをリングやストリップに接続できます。
- Serial Monitor の REPL、および **Upload firmware**。python.microbit.org で保存した MicroPython の `.hex` をアップロードでき、そのファイルはエディタで開きます。

現時点では **MicroPython のみ**です。Arduino/C++ と MakeCode ブロックには対応していません（MakeCode の `.hex` にもまだ対応していません）。2台の micro:bit 間の無線通信と Bluetooth はモデル化されていません。

## ここから始める

- [LED マトリクスで Hello, World!](https://velxio.dev/example/microbit-v2-hello)
- [ボタン A と B](https://velxio.dev/example/microbit-v2-buttons)
- [水準器](https://velxio.dev/example/microbit-v2-spirit-level)（加速度センサーを使用）
- [温度計](https://velxio.dev/example/microbit-v2-thermometer)（チップ自体の温度を使用）

## micro:bit 用 DFRobot ボード

Velxio には DFRobot 製ボードが7種あり、それぞれがキャンバス上の独立したボードです。配置すると micro:bit がソケットに装着された状態になり、マトリクスとボタンもそのまま操作できます。チップを搭載したボードでは、`main.py` の隣に MicroPython ドライバ（`maqueen.py`、`maqueen_v5.py`、`microdriver.py`、`microiobox.py`）が開き、DFRobot 公式の MakeCode ブロックと同じバイト列を書き込みます。

![Velxio キャンバス上の DFRobot Maqueen Lite に装着された micro:bit V2](../../../../assets/docs/boards/microbit-v2-maqueen-lite.png)

### Maqueen Lite

DFRobot の小型二輪ロボット（ROB0148-EN）。I2C 上のドライバを介した2つのモーター、2つのヘッドライト、2つのラインセンサー、4つの RGB LED、超音波センサー用ソケットを備えます。3D World では Maqueen 自体がロボットになります。
[ライントレーサー](https://velxio.dev/example/microbit-v2-maqueen-lite-line) ·
[走行とヘッドライトの点滅](https://velxio.dev/example/microbit-v2-maqueen-lite-drive) ·
[DFRobot ストア](https://www.dfrobot.com/product-1783.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite)

### Maqueen Lite V5

現行の Maqueen Lite（MBT0046）。I2C 上の専用コントローラを介した RGB ヘッドライト、3つのラインセンサー、2つの光センサー、バッテリー残量を備えます。
[カラーヘッドライトと光センサー](https://velxio.dev/example/microbit-v2-maqueen-lite-v5-lights) ·
[DFRobot ストア](https://www.dfrobot.com/product-2937.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite-v5)

### micro:Driver

I2C 上の1つの PCA9685 チップから4つの DC モーター出力と8つのサーボヘッダ（DFR0548）、さらに3ピンヘッダ上の9つの micro:bit ピンを提供します。
[2つのサーボと1つの DC モーター](https://velxio.dev/example/microbit-v2-micro-driver-servos) ·
[DFRobot ストア](https://www.dfrobot.com/product-1738.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-driver)

### micro:IO-BOX

コンパクトなロボットコントローラ（MBT0005）。I2C 上の2系統モータードライバ、9つの IO ヘッダ、I2C ポートと UART ポート、P0 上のブザーを備えます。
[2つのモーターの正転と逆転](https://velxio.dev/example/microbit-v2-io-box-motors) ·
[DFRobot ストア](https://www.dfrobot.com/product-1847.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-box)

### IO Extender

エッジコネクタのすべてのピンを3ピンヘッダ（信号、3.3 V、グランド）に引き出したブレークアウト（MBT0008）。3つの I2C ポートと、スイッチ付きの P0 上のブザーを備えます。
[P1 上の光センサー](https://velxio.dev/example/microbit-v2-io-extender-light) ·
[DFRobot ストア](https://www.dfrobot.com/product-1867.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-extender)

### micro:Mate

micro:bit と同じサイズのボード（DFR0518）で、その前面にネジ止めします。6つの3ピン Gravity ヘッダを備えます。P0、P1、P2 は 3.3 V、P8、P12、P16 は 5 V です。
[P0 上の光センサー](https://velxio.dev/example/microbit-v2-micro-mate-light) ·
[DFRobot ストア](https://www.dfrobot.com/product-1699.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-mate)

### Robotics & Power IO Extender

micro:bit 用のフルブレークアウト（DFR1231）。IO Extender と同じ順序・同じピン名のヘッダを備えるため、配線名を変えることなくプロジェクトを両者間で移行できます。
[P1 上の光センサー](https://velxio.dev/example/microbit-v2-robotics-io-extender-light) ·
[DFRobot ストア](https://www.dfrobot.com/product-2963.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-robotics-io-extender)

_このページのストアリンクはアフィリエイトリンクです。Velxio はお客様への追加費用なしで少額の手数料を得ます。_

## ボードのアートとピン配置

各ボードのキャンバスアートと完全なピンマップ。シミュレーターから生成されています。

[BBC micro:bit V2](/docs/ja/boards/reference/microbit-v2/) ·
[Maqueen Lite](/docs/ja/boards/reference/microbit-v2-maqueen-lite/) ·
[Maqueen Lite V5](/docs/ja/boards/reference/microbit-v2-maqueen-lite-v5/) ·
[micro:Driver](/docs/ja/boards/reference/microbit-v2-micro-driver/) ·
[micro:IO-BOX](/docs/ja/boards/reference/microbit-v2-io-box/) ·
[IO Extender](/docs/ja/boards/reference/microbit-v2-io-extender/) ·
[micro:Mate](/docs/ja/boards/reference/microbit-v2-micro-mate/) ·
[Robotics & Power IO Extender](/docs/ja/boards/reference/microbit-v2-robotics-io-extender/)

---

BBC micro:bit は Micro:bit Educational Foundation の商標です。Velxio は micro:bit と連携して動作しますが、Foundation によって製造または承認されたものではありません。micro:bit 本体は、Foundation が [microbit.org](https://microbit.org/buy/) で紹介している販売店を通じて販売されています。
