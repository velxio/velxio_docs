---
title: Raspberry Pi (Linux)
description: Raspberry Pi ボード、Zero から Pi 5 まで。キャンバス上の回路に対して Python を実行し、デフォルトではブラウザ内で、または Velxio のサーバー上の Linux ゲストで動作します。各パーツごとに動作を実測した結果を掲載しています。
sidebar:
  order: 7
  badge: PRO
---

Raspberry Pi ファミリーは**キャンバス上の回路に対して Python スクリプトを実行**します。マイコンボードとは異なり、コンパイルするものは何もありません。スクリプトを書いて **Run** を押すと、Velxio が 2 つのエンジンのうち 1 つを選んで実行します。どちらのエンジンも Raspberry Pi OS のデスクトップではないため、実機向けに書かれたチュートリアルがそのまま動くと思い込む前に、このページを読んでください。ほとんどのものは動きます。以下の表は、2026-09-19 に実際の製品に対してパーツごとに実測したものです。

| ボード                         | CPU プロファイル     |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7 クラス |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

誰でもキャンバスに Pi を配置して、その周りに回路を配線できます。**実行**するには有料プラン、またはサインイン済みのすべてのアカウントが Pi ファミリー向けに取得できる **15 分間の無料トライアルセッション 3 回**のいずれかが必要です（[プラン](/docs/ja/getting-started/plans/) を参照）。Pi で実行できるものが何もないプロジェクト（Pi ボード上の Arduino `.ino` スケッチなど）は、トライアルセッションを消費する前にその旨が通知されます。

![Velxio キャンバス上の Raspberry Pi 5](../../../../assets/docs/boards/raspberry-pi-5.png)

## 2 つのエンジン

### インスタント（ブラウザ内）

デフォルトです。スクリプトはタブ内で WebAssembly にコンパイルされた Python インタプリタ上で実行され、数秒で起動し、Velxio のサーバーを必要としません。ピンへの書き込みはキャンバスに直接届くため、`led.on()` が実行された瞬間に LED が点灯します。I2C、SPI、1-Wire は Pi が持つデバイスファイル（`/dev/i2c-1`、`/dev/spidev0.0`、`/sys/bus/w1/devices` ツリー）として存在し、キャンバス上に配線されたパーツが応答するため、本物の `smbus2`、`w1thermsensor`、Adafruit Blinka がそのまま動作します。

これは単なるインタプリタであり、オペレーティングシステムではありません。シェルも `subprocess` も生のソケットもありません。それらを要求するスクリプトは代わりに Linux エンジンに送られます。ツールバーの**エンジンチップ**は、どのエンジンが実行するか、Linux の場合はそれを要求したファイルと行を示します。

### Linux（Velxio のサーバー上）

QEMU（`-M virt`、お使いのボードの CPU プロファイル付き）で起動された本物の Linux ゲストで、ワークスペースのシリアルコンソールからアクセスします。それが何であるかを正確に述べておきます：

- **Alpine Linux** であり、Raspberry Pi OS ではありません。`python3` と `pip` はインストールされていますが、`apt`、`raspi-config`、デスクトップ、Pi ファームウェアツールはありません。
- ゲスト内部からの**ネットワークはありません**（意図的）。`pip install` は PyPI に到達できません。パッケージは `requirements.txt`（後述）を通じて届きます。
- **ヘッダーバスは本物のデバイスファイルです。** `/dev/i2c-1`、`/dev/spidev0.0`、`/dev/spidev0.1` は Pi 上と同じシステムコールに応答するため、それらを自ら開くライブラリ（Adafruit Blinka）、C プログラム、または独自の `ioctl` コードがキャンバス上のパーツと通信します。誰も保持していないアドレスは、ハードウェア上と同様に `OSError: [Errno 121] Remote I/O error` で失敗します。
- **ヘッダー UART は本物のシリアルポートです。** `/dev/serial0`（および `/dev/ttyAMA0` と `/dev/ttyS0`）は、未改造の pyserial によって駆動される本物の tty です。`serial.tools.list_ports`、ポートに対する `select()`、`cat /dev/serial0` はすべて動作し、バイトはキャンバス上の GPIO14 と GPIO15 に配線されたものへ送られます。
- **1-Wire は Pi が持つ sysfs ツリーとして存在します。** GPIO4 上の DS18B20 は `/sys/bus/w1/devices/28-*/` の下に `w1_slave` と `temperature` とともに現れるため、`cat`、`w1thermsensor` 形式のリーダー、独自のコードが動作します（プロジェクトの `config.txt` の `dtoverlay=w1-gpio,gpiopin=N` でピンを移動できます）。
- **`libcamera-jpeg`、`rpicam-jpeg`、`rpicam-still`** は、スクリプトが `subprocess` で呼び出すのと同じように、キャンバス上のカメラパーツから静止画を取得します。このエンジンでは、画像はパーツの**テストパターン**です。ゲストは Velxio のサーバー上で動作し、あなたのウェブカメラのピクセルがブラウザから出ることはありません。
- `/dev/gpiomem`、`/dev/gpiochip0`、`/sys/class/gpio` は**ありません**。GPIO は存在する `RPi.GPIO` と `gpiozero` を通じて行います。`libgpiod`、`gpioinfo`、`pigpio` には通信相手がありません。
- 起動にはおよそ 20〜30 秒かかり、サーバーが混雑しているときはさらに長くなります。「Booting」オーバーレイがそれを追跡します。ゲストセッションは遅くとも **2 時間**で終了します。
- ゲストは起動時にプロジェクトから **`script.py`** を実行します。Linux モードではメインファイルをその名前で作成してください（インスタントエンジンは最初に見つけた `.py` を実行します）。

ワークスペースの **Linux terminal** ボタンは、シェルが必要なとき（例えばファイルを調べたり、スクリプトを手動で実行したりする場合）に、セッションの残りの間このエンジンを固定します。この選択はプロジェクトに保存されません。明日開き直すと、Run は検出器の答えに戻ります。インスタントエンジンで実行できるものはすべて、それを使わない方が速いです。

## 動作するもの、パーツごと

各行は、Pi のチュートリアルが書くように書かれた 1 つのスクリプトで、キャンバス上にパーツを配線した状態で、Raspberry Pi 4 上の実際の製品を通して実行したものです。ディスプレイの行はキャンバス自体で確認されます。スクリプトが終了するだけでなく、パネルが点灯しなければなりません。

| もの | スクリプトが使うライブラリ | インスタント | Linux |
| --- | --- | --- | --- |
| LED と押しボタン | `gpiozero` | はい | はい |
| サーボ（PWM） | `gpiozero.Servo` | はい | はい |
| MPU6050 加速度計 | `smbus2` | はい | はい |
| DS3231 リアルタイムクロック | `smbus2` | はい | はい |
| BMP280 気圧センサー | `smbus2` | はい | はい |
| SHT31 温度・湿度 | `smbus2` | はい | はい |
| PCA9685 16 チャンネル PWM ドライバ | `smbus2` | はい | はい |
| ADS1115 ADC | `smbus2` | はい | はい |
| 16x2 LCD、I2C バックパック | `smbus2` または `RPLCD.i2c` | はい | はい |
| 16x2 LCD、パラレル（RS、E、D4〜D7） | `RPLCD.gpio` | はい | はい |
| SSD1306 OLED | `smbus2` | はい | はい |
| SSD1306 OLED | `luma.oled` | はい | はい |
| SSD1306 OLED | Adafruit Blinka + `adafruit_ssd1306` | はい | はい |
| ILI9341 TFT | `spidev` | はい | はい |
| microSD カード（SPI モード） | `spidev` | はい | はい |
| DS18B20 温度プローブ | 1-Wire sysfs、`w1thermsensor` | はい | はい |
| ヘッダー UART 上の GPS モジュール | `/dev/serial0` 上の `pyserial` | はい | はい |
| 7.5" e-paper（UC8179） | `spidev` + `RPi.GPIO`、Waveshare 形式のドライバ | はい | はい |
| GPIO に直接接続したポテンショメータ | | いいえ（後述） | いいえ |

OLED と LCD の行は、Linux エンジンの Raspberry Pi Zero（独自のイメージを持つ 32 ビットゲスト）でも実行されました。

## 動作しないもの

- **GPIO 上のアナログ入力。** Raspberry Pi には実機でも **ADC がありません**。ポテンショメータ、LDR、パルスセンサーを GPIO に直接配線しても、ハイかローしか読み取れず、実行コンソールがその旨を伝えます。センサーと Pi の間に、ベンチ上で行うのとまったく同じように **ADS1115**（I2C）または **MCP3008**（SPI）を入れてください。どちらもカタログにあり、ギャラリーにはポテンショメータ付きの MCP3008 の例があります。
- **Linux エンジンでのウェブカメラ。** インスタントエンジンの `picamera2` は、スクリプトがブラウザ内で実行されるため、あなたのウェブカメラを使用できます。ゲストは当社のサーバー上で実行されるため、そのカメラツールは代わりにテストパターンを取得します。
- **画像を間違った場所に送る e-paper ドライバ。** UC8179 パネル（7.5"）では、コマンド `0x10` は前の画像で、`0x13` はガラスが表示する画像です。`0x10` だけを書き込むドライバは、実機のパネルとまったく同じように、ここでは空白のリフレッシュしか得られません。シリアルモニター（そのエンジンでは Linux ターミナル）がその理由を伝えます。BUSY ピンもコントローラに従います。UltraChip パネルが動作している間は LOW、SSD168x では HIGH です。
- **`pigpio`、`libgpiod` / `gpiod`、`/dev/gpiomem`。** どちらのエンジンにもデーモンも GPIO キャラクタデバイスもありません。`RPi.GPIO` または `gpiozero` を使用してください。
- **MicroPython チュートリアルからコピーしたスクリプト。** `import machine`、`from gpio_lcd import GpioLcd` などは Pico や ESP32 には存在しますが、フル Python を実行するボードには存在しません。コンソールは、インストールするパッケージを提案する代わりに、Pi での相当物（`gpiozero`、`RPLCD`、`luma.oled`、`w1thermsensor`）を提示します。
- **PyTorch、TensorFlow。** ギガバイト単位であり、ここにはそれらを加速するものが何もありません。その説明とともに拒否されます。

## 各エンジンの Python モジュール

どちらのエンジンも標準ライブラリを同梱しています。「プリインストール済み」とは、Raspberry Pi OS がハードウェアライブラリをイメージに持つのと同じように、`requirements.txt` なしで `import` 行だけで動作することを意味します。

| モジュール | インスタント（ブラウザ） | Linux（ゲスト） |
| --- | --- | --- |
| `RPi.GPIO` | プリインストール済み | プリインストール済み |
| `gpiozero` | プリインストール済み | プリインストール済み（2.0.1） |
| `smbus2` / `smbus` | プリインストール済み（本物のライブラリ） | プリインストール済み |
| `spidev` | プリインストール済み | プリインストール済み |
| `serial`（pyserial） | Pi UART パスのみ | 本物の tty 上の本物の pyserial 3.5 |
| `w1thermsensor` | プリインストール済み | `requirements.txt` 経由（1-Wire ツリーは存在する） |
| `luma.core`、`luma.oled`、`luma.lcd` | プリインストール済み | プリインストール済み |
| `RPLCD` | プリインストール済み | プリインストール済み |
| `ST7789` | プリインストール済み | プリインストール済み |
| `board`、`busio`、`digitalio`（Adafruit Blinka） | プリインストール済み | プリインストール済み |
| `adafruit_ssd1306`、`adafruit_rgb_display` | プリインストール済み | プリインストール済み |
| `PIL`（Pillow）、`numpy` | プリインストール済み | プリインストール済み（Pillow 10.3、numpy 1.25） |
| `cv2`（OpenCV） | はい | いいえ（ゲスト用ビルドなし） |
| `picamera2` | はい、あなたのウェブカメラ経由 | いいえ（`rpicam-jpeg` / `libcamera-jpeg` を使用） |
| `velxio_screen` | はい | はい |
| `requests` / `urllib` | はい、許可リスト付きの Velxio の egress プロキシ経由 | ネットワークなし |
| その他すべて | `requirements.txt` 経由 | `requirements.txt` 経由 |

DejaVu フォントは、ディスプレイのチュートリアルがパスをハードコードしているため、Raspberry Pi OS が使用するパス（`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`）でゲスト内にあります。

```python
from luma.core.interface.serial import i2c
from luma.core.render import canvas
from luma.oled.device import ssd1306

import time

device = ssd1306(i2c(port=1, address=0x3C))
with canvas(device) as draw:
    draw.text((10, 20), "Hello from a Pi", fill="white")

# luma clears the panel when the script ends, as it does on hardware,
# so keep the script alive for as long as the text should stay up.
while True:
    time.sleep(1)
```

### その他のサードパーティパッケージには `requirements.txt` が必要

スクリプトの隣に `requirements.txt` ファイルを追加してください。1 行に 1 パッケージです。Velxio は実行前にそれを解決し、インストールしたものを実行コンソールで伝えます。スクリプトが不足しているパッケージをインポートすると、コンソールが追加すべき行を提示し、ボタンがそれを書き込みます。どのエンジンがパッケージを受け入れられるかは、そのビルド方法によって異なります：

- 純粋な Python パッケージ（`py3-none-any` ホイール）は両方のエンジンで動作します。
- コンパイル済みコードを含むパッケージは、ブラウザランタイムが同梱している場合（numpy、pillow、opencv-python、scikit-learn など）は**インスタント**エンジンで動作し、PyPI に **musl aarch64** ホイールがある場合（numpy、pandas、scipy、psutil はあります）のみ **Linux** エンジンで動作します。glibc の `manylinux` ホイールしか公開していないパッケージは、ゲストにインストールできません。
- Raspberry Pi Zero、1、2 ではゲストは 32 ビットであり、PyPI にはそれ用のコンパイル済みホイールがほとんどありません。そこでは、プリインストール済みのものか純粋な Python パッケージにとどまってください。
- ゲストがすでに提供している名前（`RPi.GPIO`、`smbus2`、`spidev`、`pyserial`、`gpiozero`）は決してダウンロードされないため、それらを列挙したチュートリアルの `requirements.txt` は害を及ぼしません。

ホイールは Arduino ライブラリと同じストレージクォータにカウントされます。

## ファイル

Pi ワークスペースの**ファイルパネル**は、スクリプトとデータファイルをプロジェクトにアップロードします。Linux モードでは、`script.py` が開始する前にそれらがゲストのホームディレクトリにコピーされます。

## UNIHIKER M10

DFRobot の教育用 SBC（タッチスクリーン内蔵の Linux ボード）は同じ 2 つのエンジンで動作し、Pi のシムの代わりに独自の `pinpong` と `unihiker` モジュールを持ちます。これは独自の 3 回のトライアルセッションを持つ有料ボードです。ピッカーで Pi ファミリーの隣にあります。

## ボードアートとピン配置

各ボードのキャンバスアートと完全なピンマップ（シミュレータから生成）：

[Raspberry Pi 3（アートは Zero/1/2 にも使用）](/docs/ja/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/ja/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/ja/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/ja/boards/reference/unihiker-m10/)
