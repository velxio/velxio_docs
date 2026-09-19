---
title: Raspberry Pi (Linux)
description: Raspberry Pi ボード、Zero から Pi 5 まで。キャンバス上の回路に対して Python を実行。デフォルトではブラウザ内、または Velxio のサーバー上の Linux ゲスト内で動作し、各部分ごとに何が動くかを実測した結果を掲載。
sidebar:
  order: 7
  badge: PRO
---

Raspberry Pi ファミリーは**キャンバス上の回路に対して Python スクリプトを実行**します。マイコンボードとは異なり、コンパイルするものは何もありません。スクリプトを書いて **Run** を押すと、Velxio が 2 つのエンジンのうち 1 つを選んで実行します。どちらのエンジンも Raspberry Pi OS のデスクトップではないため、実機向けに書かれたチュートリアルがそのまま動くと思い込む前に、このページを読んでください。ほとんどのものは動きます。以下の表は、2026-09-19 に実際の製品に対して、部分ごとに実測したものです。

| ボード                         | CPU プロファイル         |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7 クラス |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

誰でもキャンバスに Pi を配置して、その周りに回路を配線できます。**実行**するには有料プラン、またはサインイン済みのすべてのアカウントが Pi ファミリー向けに取得できる**15 分間の無料トライアルセッション 3 回**のいずれかが必要です（[プラン](/docs/ja/getting-started/plans/)を参照）。Pi が実行できるものが何もないプロジェクト、たとえば Pi ボード上の Arduino `.ino` スケッチなどは、トライアルセッションを消費する前にその旨が通知されます。

![Velxio キャンバス上の Raspberry Pi 5](../../../../assets/docs/boards/raspberry-pi-5.png)

## 2 つのエンジン

### インスタント（ブラウザ内）

デフォルトです。スクリプトはタブ内で WebAssembly にコンパイルされた Python インタプリタ上で実行され、数秒で起動し、Velxio のサーバーには何も要求しません。ピンへの書き込みはキャンバスに直接届くため、`led.on()` が実行された瞬間に LED が点灯します。I2C、SPI、1-Wire は Pi が持つデバイスファイル（`/dev/i2c-1`、`/dev/spidev0.0`、`/sys/bus/w1/devices` ツリー）として存在し、キャンバス上に配線された部品によって応答されるため、本物の `smbus2`、`w1thermsensor`、Adafruit Blinka がそのまま動作します。

これは単なるインタプリタであり、オペレーティングシステムではありません。シェルも `subprocess` も生のソケットもありません。それらを要求するスクリプトは代わりに Linux エンジンに送られます。ツールバーの**エンジンチップ**は、どのエンジンが実行するか、そして Linux の場合にはそれを要求したファイルと行を示します。

### Linux（Velxio のサーバー上）

QEMU（`-M virt`、お使いのボードの CPU プロファイル付き）で起動された本物の Linux ゲストで、ワークスペースのシリアルコンソールからアクセスします。それが何であるかを正確に述べておきます。

- **Alpine Linux** であり、Raspberry Pi OS ではありません。`python3` と `pip` はインストールされていますが、`apt`、`raspi-config`、デスクトップ、Pi ファームウェアツールはありません。
- ゲスト内部からの**ネットワークはありません**（意図的に）。`pip install` は PyPI に到達できません。パッケージは `requirements.txt`（後述）を通じて届きます。
- **ヘッダーバスは本物のデバイスファイルです。** `/dev/i2c-1`、`/dev/spidev0.0`、`/dev/spidev0.1` は、Pi 上と同じシステムコールに応答するため、それらを自ら開くライブラリ（Adafruit Blinka）、C プログラム、あるいは独自の `ioctl` コードがキャンバス上の部品と通信できます。誰も保持していないアドレスは、実機と同様に `OSError: [Errno 121] Remote I/O error` で失敗します。
- **ヘッダー UART は本物のシリアルポートです。** `/dev/serial0`（および `/dev/ttyAMA0` と `/dev/ttyS0`）は、改変されていない pyserial によって駆動される本物の tty です。`serial.tools.list_ports`、ポートに対する `select()`、`cat /dev/serial0` はすべて動作し、バイトはキャンバス上の GPIO14 と GPIO15 に配線されたものへ送られます。
- `/dev/gpiomem`、`/dev/gpiochip0`、`/sys/class/gpio`、1-Wire ツリーは**ありません**。GPIO は `RPi.GPIO` と `gpiozero` を通じて行われ、これらは存在します。`libgpiod`、`gpioinfo`、`pigpio` には話しかける相手がありません。
- 起動にはおよそ 20 秒から 30 秒かかり、サーバーが混雑しているとより長くなります。「Booting」オーバーレイがそれを追跡します。ゲストセッションは遅くとも **2 時間**後に終了します。
- ゲストは起動時にプロジェクトから **`script.py`** を実行します。Linux モードではメインファイルをそのように命名してください（インスタントエンジンは最初に見つけた `.py` を実行します）。

ワークスペースの **Linux terminal** ボタンは、シェルが必要なとき、たとえばファイルを検査したりスクリプトを手動で実行したりするときに、セッションの残りの間このエンジンを固定します。この選択はプロジェクトとともに保存されません。翌日開き直すと、Run は検出器の答えに戻ります。インスタントエンジンが実行できるものはすべて、それを使わない方が高速です。

## 何が動くか、部分ごとに

各行は、Pi のチュートリアルが書くように書かれた 1 つのスクリプトで、部品をキャンバスに配線した状態で、Raspberry Pi 4 上の実際の製品を通して実行したものです。ディスプレイの行はキャンバス自体で確認されます。スクリプトが終了するだけでなく、パネルが点灯しなければなりません。

| 何 | スクリプトが使うライブラリ | インスタント | Linux |
| --- | --- | --- | --- |
| LED とプッシュボタン | `gpiozero` | はい | はい |
| サーボ（PWM） | `gpiozero.Servo` | はい | はい |
| MPU6050 加速度計 | `smbus2` | はい | はい |
| DS3231 リアルタイムクロック | `smbus2` | はい | はい |
| BMP280 気圧センサー | `smbus2` | はい | はい |
| SHT31 温度・湿度 | `smbus2` | はい | はい |
| PCA9685 16 チャンネル PWM ドライバー | `smbus2` | はい | はい |
| ADS1115 ADC | `smbus2` | はい | はい |
| 16x2 LCD、I2C バックパック | `smbus2` または `RPLCD.i2c` | はい | はい |
| 16x2 LCD、パラレル（RS、E、D4 から D7） | `RPLCD.gpio` | はい | はい |
| SSD1306 OLED | `smbus2` | はい | はい |
| SSD1306 OLED | `luma.oled` | はい | はい |
| SSD1306 OLED | Adafruit Blinka + `adafruit_ssd1306` | はい | はい |
| ILI9341 TFT | `spidev` | はい | はい |
| microSD カード（SPI モード） | `spidev` | はい | はい |
| DS18B20 温度プローブ | 1-Wire sysfs、`w1thermsensor` | はい | **いいえ** |
| GPIO に直接つないだポテンショメーター | | いいえ（後述） | いいえ |

OLED と LCD の行は、Linux エンジンの Raspberry Pi Zero（独自のイメージを持つ 32 ビットゲスト）でも実行されました。

## 動かないもの

- **GPIO 上のアナログ入力。** Raspberry Pi には実機でも **ADC がありません**。ポテンショメーター、LDR、パルスセンサーを GPIO に直接配線しても、ハイかローしか読み取れず、実行コンソールがその旨を伝えます。実機のベンチでするのとまったく同じように、センサーと Pi の間に **ADS1115**（I2C）または **MCP3008**（SPI）を入れてください。どちらもカタログにあり、ギャラリーにはポテンショメーター付きの MCP3008 の例があります。
- **Linux エンジンでの 1-Wire。** ゲストカーネルには 1-Wire サポートがないため、DS18B20 スクリプトはそこでは `/sys/bus/w1/devices` を見つけられません。これはインスタントエンジンでは動作し、`w1thermsensor` だけをインポートするスクリプトはそもそもそこで実行されます。
- **Linux エンジンでのカメラ。** `picamera2` はインスタントエンジンで動作し、ウェブカメラまたはテストパターンから供給されます。ゲストにはカメラがありません。
- **`pigpio`、`libgpiod` / `gpiod`、`/dev/gpiomem`。** どちらのエンジンにもデーモンも GPIO キャラクターデバイスもありません。`RPi.GPIO` または `gpiozero` を使ってください。
- **MicroPython チュートリアルからコピーしたスクリプト。** `import machine`、`from gpio_lcd import GpioLcd` などは Pico や ESP32 には存在しますが、フル Python を実行するボードには存在しません。コンソールは、インストールするパッケージを提案する代わりに、Pi での相当物（`gpiozero`、`RPLCD`、`luma.oled`、`w1thermsensor`）を挙げます。
- **PyTorch、TensorFlow。** ギガバイト単位であり、ここにはそれらを高速化するものが何もありません。その説明とともに拒否されます。

## 各エンジンの Python モジュール

どちらのエンジンも標準ライブラリを同梱しています。「プリインストール済み」とは、Raspberry Pi OS がハードウェアライブラリをイメージに持つのと同じように、`requirements.txt` なしで `import` 行だけで動作することを意味します。

| モジュール | インスタント（ブラウザ） | Linux（ゲスト） |
| --- | --- | --- |
| `RPi.GPIO` | プリインストール済み | プリインストール済み |
| `gpiozero` | プリインストール済み | プリインストール済み（2.0.1） |
| `smbus2` / `smbus` | プリインストール済み（本物のライブラリ） | プリインストール済み |
| `spidev` | プリインストール済み | プリインストール済み |
| `serial`（pyserial） | Pi UART パスのみ | 本物の tty 上の本物の pyserial 3.5 |
| `w1thermsensor` | プリインストール済み | 利用不可（1-Wire なし） |
| `luma.core`、`luma.oled`、`luma.lcd` | プリインストール済み | プリインストール済み |
| `RPLCD` | プリインストール済み | プリインストール済み |
| `ST7789` | プリインストール済み | プリインストール済み |
| `board`、`busio`、`digitalio`（Adafruit Blinka） | プリインストール済み | プリインストール済み |
| `adafruit_ssd1306`、`adafruit_rgb_display` | プリインストール済み | プリインストール済み |
| `PIL`（Pillow）、`numpy` | プリインストール済み | プリインストール済み（Pillow 10.3、numpy 1.25） |
| `cv2`（OpenCV） | はい | いいえ（ゲスト用ビルドなし） |
| `picamera2` | はい、ウェブカメラ経由 | いいえ |
| `velxio_screen` | はい | はい |
| `requests` / `urllib` | はい、許可リスト付きの Velxio の egress プロキシ経由 | ネットワークなし |
| その他すべて | `requirements.txt` 経由 | `requirements.txt` 経由 |

DejaVu フォントは、Raspberry Pi OS が使うパス（`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`）でゲスト内にあります。ディスプレイのチュートリアルがそれをハードコードしているためです。

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

スクリプトの隣に `requirements.txt` ファイルを追加し、1 行に 1 パッケージを記述してください。Velxio は実行前にそれを解決し、何をインストールしたかを実行コンソールで伝えます。スクリプトが不足しているパッケージをインポートすると、コンソールは追加すべき行を提示し、ボタンがそれを書き込んでくれます。どのエンジンがパッケージを受け入れられるかは、そのビルド方法によります。

- 純粋な Python パッケージ（`py3-none-any` ホイール）は両方のエンジンで動作します。
- コンパイル済みコードを含むパッケージは、ブラウザランタイムが同梱している場合（numpy、pillow、opencv-python、scikit-learn など）は**インスタント**エンジンで動作し、PyPI に **musl aarch64** ホイールがある場合（numpy、pandas、scipy、psutil にはあります）のみ **Linux** エンジンで動作します。glibc の `manylinux` ホイールしか公開していないパッケージは、ゲストにインストールできません。
- Raspberry Pi Zero、1、2 ではゲストは 32 ビットであり、PyPI にはそのためのコンパイル済みホイールがほとんどありません。そこでは、プリインストール済みのものか純粋な Python パッケージにとどめてください。
- ゲストがすでに提供している名前（`RPi.GPIO`、`smbus2`、`spidev`、`pyserial`、`gpiozero`）は決してダウンロードされないため、それらを列挙したチュートリアルの `requirements.txt` は害を及ぼしません。

ホイールは Arduino ライブラリと同じストレージクォータにカウントされます。

## ファイル

Pi ワークスペースの**ファイルパネル**は、スクリプトとデータファイルをプロジェクトにアップロードします。Linux モードでは、`script.py` が起動する前にそれらがゲストのホームディレクトリにコピーされます。

## UNIHIKER M10

DFRobot の教育用 SBC（タッチスクリーン内蔵の Linux ボード）は同じ 2 つのエンジンで動作し、Pi のシムの代わりに独自の `pinpong` と `unihiker` モジュールを持ちます。独自の 3 回のトライアルセッションがある有料ボードです。ピッカーで Pi ファミリーの隣にあります。

## ボードアートとピン配置

各ボードのキャンバスアートと完全なピンマップは、シミュレーターから生成されたものです。

[Raspberry Pi 3（アートは Zero/1/2 にも）](/docs/ja/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/ja/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/ja/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/ja/boards/reference/unihiker-m10/)
