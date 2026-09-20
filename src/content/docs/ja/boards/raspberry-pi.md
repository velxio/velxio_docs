---
title: Raspberry Pi (Linux)
description: Raspberry Pi ボード、Zero から Pi 5 まで。キャンバス上の回路に対して Python を実行でき、デフォルトではブラウザ内、または Velxio のサーバー上の Linux ゲストで動作します。各パーツごとに実測した動作内容も掲載しています。
sidebar:
  order: 7
  badge: PRO
---

Raspberry Pi ファミリーは**キャンバス上の回路に対して Python スクリプトを実行**します。マイコンボードとは異なり、コンパイルするものは何もありません。スクリプトを書いて **Run** を押すと、Velxio が 2 つのエンジンのうち 1 つを選んで実行します。どちらのエンジンも Raspberry Pi OS のデスクトップではないため、実機向けに書かれたチュートリアルがそのまま動くと思い込む前に、このページを読んでください。ほとんどはそのまま動きます。以下の表は、2026-09-19 と 2026-09-20 に、実際の製品に対してパーツごとに実測したものです。

| ボード                         | CPU プロファイル         |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | ARM Cortex-A7 クラス |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

誰でもキャンバスに Pi を配置して、その周りに回路を配線できます。**実行**するには有料プラン、またはサインイン済みのすべてのアカウントが Pi ファミリー向けに取得できる **15 分間の無料トライアルセッション 3 回**のいずれかが必要です（[プラン](/docs/ja/getting-started/plans/)を参照）。Pi が実行できるものが何もないプロジェクト、たとえば Pi ボード上の Arduino `.ino` スケッチなどは、トライアルセッションを消費する前にその旨が通知されます。

![Velxio キャンバス上の Raspberry Pi 5](../../../../assets/docs/boards/raspberry-pi-5.png)

## 2 つのエンジン

### インスタント（ブラウザ内）

デフォルトのエンジンです。スクリプトはタブ内で WebAssembly にコンパイルされた Python インタプリタ上で実行され、数秒で起動し、Velxio のサーバーに何も要求しません。ピンへの書き込みはキャンバスに直接届くため、`led.on()` が実行された瞬間に LED が点灯します。I2C、SPI、1-Wire は、Pi が持つデバイスファイル（`/dev/i2c-1`、`/dev/spidev0.0`、`/sys/bus/w1/devices` ツリー）として存在し、キャンバス上に配線されたパーツが応答するため、本物の `smbus2`、`w1thermsensor`、Adafruit Blinka がそのまま動作します。

これは単なるインタプリタであり、オペレーティングシステムではありません。シェルも `subprocess` も生のソケットもありません。それらを要求するスクリプトは代わりに Linux エンジンへ送られます。ツールバーの**エンジンチップ**は、どのエンジンが実行するか、そして Linux の場合はそれを要求したファイルと行を示します。

### Linux（Velxio のサーバー上）

QEMU（`-M virt`、お使いのボードの CPU プロファイル付き）で起動された本物の Linux ゲストで、ワークスペースのシリアルコンソールからアクセスします。それが何であるかを正確に述べておきます。

- **Alpine Linux** であり、Raspberry Pi OS ではありません。`python3` と `pip` はインストールされていますが、`apt`、`raspi-config`、デスクトップ、Pi ファームウェアツールはありません。
- ゲスト内部からの**ネットワークは意図的にありません**。内部から PyPI に到達できるものは何もありません。プロジェクトが `requirements.txt` で宣言したパッケージは、ゲストの起動時点でインポート可能であり、`pip` 自体もローカルの wheelhouse に対してオフラインで動作します（後述）。
- **ヘッダーバスは本物のデバイスファイルです。** `/dev/i2c-0`、`/dev/i2c-1`、`/dev/spidev0.0`、`/dev/spidev0.1` は、Pi 上と同じシステムコールに応答するため、それらを自ら開くライブラリ（Adafruit Blinka）、C プログラム、あるいは独自の `ioctl` コードがキャンバス上のパーツと通信できます。誰も保持していないアドレスは、ハードウェア上と同様に `OSError: [Errno 121] Remote I/O error` で失敗します。
- **`smbus2` と `spidev` はアップストリームのパッケージ**であり、Velxio の代替品ではありません。`import smbus2` は本物の smbus2 を、`import spidev` はコンパイル済みの py-spidev を提供し、どちらもそれらのデバイスノードを経由します。したがって、カーネルのルールがボード上と同様に適用されます。32 バイトを超える SMBus ブロック転送は、黙って短縮されるのではなくエラーで失敗し、存在しないバス（たとえば `SMBus(2)`）を開くと、最初の読み取り時ではなく open 呼び出しの時点で例外が発生します。
- **ヘッダー UART は本物のシリアルポートです。** `/dev/serial0`（および `/dev/ttyAMA0` と `/dev/ttyS0`）は、改変されていない pyserial によって駆動される本物の tty です。`serial.tools.list_ports`、ポートに対する `select()`、`cat /dev/serial0` はすべて動作し、バイトはキャンバス上の GPIO14 と GPIO15 に配線されたものへ送られます。
- **1-Wire は Pi が持つ sysfs ツリーとして存在します。** GPIO4 上の DS18B20 は `/sys/bus/w1/devices/28-*/` の下に `w1_slave` と `temperature` とともに現れるため、`cat`、`w1thermsensor` 形式のリーダー、独自のコードが動作します（プロジェクトの `config.txt` 内の `dtoverlay=w1-gpio,gpiopin=N` でピンを移動できます）。
- **`libcamera-jpeg`、`rpicam-jpeg`、`rpicam-still`、`libcamera-still`** は、スクリプトが `subprocess` で呼び出すのと同じように、キャンバス上のカメラパーツから静止画を取得します。ゲストにあなたのウェブカメラの使用を許可しない限り、画像はパーツの**テストパターン**です。許可は、プログラムが初めて静止画を取得するときに Velxio が求めます（後述）。
- **GPIO には本物のキャラクタデバイスがあります。** `/dev/gpiochip0` が存在し、非推奨の `/sys/class/gpio` も存在し、`RPi.GPIO` と `gpiozero` の上に成り立っています。ただし `/dev/gpiomem` は**依然として存在しない**ため、ペリフェラルレジスタを必要とする `pigpio` は通信相手がありません（後述）。
- 起動にはおよそ 20〜30 秒かかり、サーバーが混雑しているときはさらに長くなります。「Booting」オーバーレイが進行状況を追跡します。ゲストセッションは遅くとも **2 時間**で終了します。
- ゲストは起動時にプロジェクトから **`script.py`** を実行します。Linux モードではメインファイルをその名前で作成してください（インスタントエンジンは最初に見つけた `.py` を実行します）。

ワークスペースの **Linux terminal** ボタンは、シェルが必要なとき（たとえばファイルを調べたりスクリプトを手動で実行したりする場合）に、そのセッションの残りの間このエンジンを固定します。この選択はプロジェクトに保存されません。明日開き直すと、Run は検出器の答えに戻ります。インスタントエンジンが実行できるものはすべて、それを使わない方が高速です。

## Linux エンジンの GPIO: gpiochip0 と libgpiod

ゲストは Pi 自身のアイデンティティを持つ GPIO キャラクタデバイスを登録するため、Bookworm と Pi 5 のドキュメントが教えるモダンなスタックがここで動作します。`gpiodetect` は次のように答えます。

```text
gpiochip0 [pinctrl-bcm2835] (54 lines)
```

ツールはインストール済み（`gpiodetect`、`gpioinfo`、`gpioget`、`gpioset`、`gpiomon`）で、それらが駆動するラインはキャンバス上のそのピンに配線されたパーツに届きます。

イメージには **libgpiod バージョン 1** が同梱されているため、バージョン 1 の書き方でコマンドを書いてください。チップは位置引数であり、`--chip` オプションではありません。

```bash
gpioset gpiochip0 17=1     # drive GPIO17 high
gpioget gpiochip0 5        # read GPIO5, prints 0 or 1
gpiomon gpiochip0 5        # print edges on GPIO5 as they arrive
```

バージョン 2 の書き方（`gpioset --chip gpiochip0 17=1`）は理解されません。チュートリアルがそれを使っている場合は、オプションを外してチップを単独で渡してください。

Python バインディングも同様に、やはりバージョン 1 の API でプリインストールされています。

```python
import gpiod

chip = gpiod.Chip("gpiochip0")
line = chip.get_line(17)
line.request(consumer="velxio", type=gpiod.LINE_REQ_DIR_OUT)
line.set_value(1)
```

`RPi.GPIO` と `gpiozero` はこれによる影響を受けず、依然としてスクリプトを書く最短の方法です。`/sys/class/gpio` 以下の非推奨の sysfs インターフェースも動作するため、ファイルに書き込んでピンをエクスポートする古いチュートリアルもその通りに動作します。依然として存在しないのは `/dev/gpiomem` であり、それに伴い `pigpio` も存在しません。このライブラリはペリフェラルレジスタを直接マップしますが、ここにはマップするものが何もありません。

インスタントエンジンにはキャラクタデバイスがありません。ブラウザ内では、GPIO は `RPi.GPIO`、`gpiozero`、または Blinka です。

## Linux エンジンのカメラ

デフォルトでは、ゲストのカメラツールはカメラパーツの**テストパターン**を返し、静止画を取得するスクリプトは誰にも何も尋ねられることなく画像を取得します。

Linux エンジンでカメラパーツがウェブカメラモードのときにプログラムが初めて静止画を要求すると、Velxio はそれにあなたの実際のウェブカメラを使用してよいか尋ねます。コードが実行される場所の関係で尋ねる必要があります。インスタントエンジンではフレームがあなたのマシンから出ることはありませんが、Linux ゲストは Velxio のサーバー上で実行されるため、許可することはフレームがそこへ送信されることを意味します。

- **いいえ**と答えると、ツールはテストパターンを返し続けます。何も壊れず、スクリプトを変更する必要もありません。
- **はい**と答えると、静止画はあなたの実際のウェブカメラになり、**そのページセッションに限り**有効です。答えはプロジェクトに保存されず、リロード後も記憶されないため、次にページを開いたときに再び尋ねられます。

`picamera2` は別問題です。これは依然としてインスタントエンジンのモジュールです。Linux ゲストでは、コマンドラインツールで静止画を取得してください。

## パーツごとの動作内容

各行は、Pi のチュートリアルが書くように書かれた 1 つのスクリプトを、キャンバス上にパーツを配線した状態で、Raspberry Pi 4 上の実際の製品で実行したものです。ディスプレイの行はキャンバス自体で確認されます。スクリプトが終了するだけでなく、パネルが点灯する必要があります。

| 内容 | スクリプトが使用するライブラリ | インスタント | Linux |
| --- | --- | --- | --- |
| LED とプッシュボタン | `gpiozero` | はい | はい |
| シェルからの LED | `gpioset` (libgpiod 1) | いいえ | はい |
| サーボ (PWM) | `gpiozero.Servo` | はい | はい |
| MPU6050 加速度計 | `smbus2` | はい | はい |
| DS3231 リアルタイムクロック | `smbus2` | はい | はい |
| BMP280 気圧センサー | `smbus2` | はい | はい |
| SHT31 温度・湿度センサー | `smbus2` | はい | はい |
| PCA9685 16 チャンネル PWM ドライバ | `smbus2` | はい | はい |
| ADS1115 ADC | `smbus2` | はい | はい |
| 16x2 LCD、I2C バックパック | `smbus2` または `RPLCD.i2c` | はい | はい |
| 16x2 LCD、パラレル (RS、E、D4〜D7) | `RPLCD.gpio` | はい | はい |
| SSD1306 OLED | `smbus2` | はい | はい |
| SSD1306 OLED | `luma.oled` | はい | はい |
| SSD1306 OLED | Adafruit Blinka + `adafruit_ssd1306` | はい | はい |
| ILI9341 TFT | `spidev` | はい | はい |
| microSD カード (SPI モード) | `spidev` | はい | はい |
| DS18B20 温度プローブ | 1-Wire sysfs、`w1thermsensor` | はい | はい |
| ヘッダー UART 上の GPS モジュール | `/dev/serial0` 上の `pyserial` | はい | はい |
| 7.5" 電子ペーパー (UC8179) | `spidev` + `RPi.GPIO`、Waveshare 形式のドライバ | はい | はい |
| GPIO に直接接続したポテンショメータ | | いいえ (後述) | いいえ |

OLED と LCD の行は、Linux エンジンの Raspberry Pi Zero でも実行されました。これは独自のイメージを持つ 32 ビットゲストです。

## 動作しないもの

- **GPIO 上のアナログ入力。** Raspberry Pi には実機でも **ADC がありません**。ポテンショメータ、LDR、パルスセンサーを GPIO に直接配線しても、ハイかローしか読み取れず、実行コンソールがその旨を伝えます。実機のベンチで行うのとまったく同じように、センサーと Pi の間に **ADS1115**（I2C）または **MCP3008**（SPI）を入れてください。どちらもカタログにあり、ギャラリーにはポテンショメータを使った MCP3008 の例があります。
- **Linux エンジンの `picamera2`。** インスタントエンジンではあなたのウェブカメラを使用します。スクリプトがブラウザ内で実行されるためです。ゲストでは、代わりに `rpicam-jpeg` とその兄弟がテストパターン上、または許可後にあなたのウェブカメラ上で静止画を取得します（前述）。
- **画像を間違った場所へ送る電子ペーパードライバ。** UC8179 パネル（7.5"）では、コマンド `0x10` は前の画像であり、`0x13` がガラスに表示される画像です。`0x10` だけを書き込むドライバは、実機のパネルとまったく同じように、ここでは空白のリフレッシュしか得られず、シリアルモニター（そのエンジンでは Linux ターミナル）がその理由を伝えます。BUSY ピンもコントローラに従います。UltraChip パネルが動作中は LOW、SSD168x では HIGH です。
- **`pigpio` と `/dev/gpiomem`。** `pigpio` はペリフェラルレジスタをマップしてピンに到達しますが、どちらのエンジンもそのマッピングを提供しません。`RPi.GPIO`、`gpiozero`、または Linux エンジンでは `libgpiod`（前述）を使用してください。
- **インスタントエンジンの `libgpiod` / `gpiod`。** キャラクタデバイスは Linux エンジンのものであり、ブラウザには開くべき `/dev/gpiochip0` がありません。
- **MicroPython チュートリアルからコピーしたスクリプト。** `import machine`、`from gpio_lcd import GpioLcd` などは Pico や ESP32 に存在するものであり、フル Python を実行するボードにはありません。コンソールは、インストールすべきパッケージを提案する代わりに、Pi での相当物（`gpiozero`、`RPLCD`、`luma.oled`、`w1thermsensor`）を提示します。
- **PyTorch、TensorFlow。** ギガバイト単位であり、ここにはそれらを加速するものが何もありません。その説明とともに拒否されます。

## 各エンジンの Python モジュール

どちらのエンジンも標準ライブラリを同梱しています。「プリインストール」とは、`requirements.txt` なしで `import` 行だけで動作することを意味し、Raspberry Pi OS がハードウェアライブラリをイメージに持つのと同じです。

| モジュール | インスタント (ブラウザ) | Linux (ゲスト) |
| --- | --- | --- |
| `RPi.GPIO` | プリインストール | プリインストール |
| `gpiozero` | プリインストール | プリインストール (2.0.1) |
| `gpiod` (libgpiod 1) | ブラウザにキャラクタデバイスなし | プリインストール、`gpio*` ツール付き |
| `smbus2` / `smbus` | プリインストール (本物のライブラリ) | プリインストール (本物のライブラリ) |
| `spidev` | プリインストール | プリインストール (コンパイル済み py-spidev) |
| `serial` (pyserial) | Pi の UART パスのみ | 本物の tty 上の本物の pyserial 3.5 |
| `w1thermsensor` | プリインストール | `requirements.txt` 経由 (1-Wire ツリーは存在) |
| `luma.core`、`luma.oled`、`luma.lcd` | プリインストール | プリインストール |
| `RPLCD` | プリインストール | プリインストール |
| `ST7789` | プリインストール | プリインストール |
| `board`、`busio`、`digitalio` (Adafruit Blinka) | プリインストール | プリインストール |
| `adafruit_ssd1306`、`adafruit_rgb_display` | プリインストール | プリインストール |
| `PIL` (Pillow)、`numpy` | プリインストール | プリインストール (Pillow 10.3、numpy 1.25) |
| `cv2` (OpenCV) | はい | いいえ (ゲスト用ビルドなし) |
| `picamera2` | はい、あなたのウェブカメラ経由 | いいえ (`rpicam-jpeg` / `libcamera-jpeg` を使用) |
| `velxio_screen` | はい | はい |
| `requests` / `urllib` | はい、許可リスト付きの Velxio の egress プロキシ経由 | ネットワークなし |
| その他すべて | `requirements.txt` 経由 | `requirements.txt` 経由 |

DejaVu フォントは、Raspberry Pi OS が使用するパス（`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`）でゲスト内に存在します。ディスプレイのチュートリアルがそれをハードコードしているためです。

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

スクリプトの隣に `requirements.txt` ファイルを追加してください。1 行に 1 パッケージです。Velxio は実行前にそれを解決し、何をインストールしたかを実行コンソールで伝えます。スクリプトが不足しているパッケージをインポートすると、コンソールは追加すべき行を提示し、ボタンがそれを代わりに書き込みます。どのエンジンがパッケージを受け入れられるかは、そのビルド方法によります。

- 純粋な Python パッケージ（`py3-none-any` wheel）は両方のエンジンで動作します。
- コンパイル済みコードを含むパッケージは、ブラウザランタイムが同梱している場合（numpy、pillow、opencv-python、scikit-learn など）は**インスタント**エンジンで動作し、PyPI に **musl aarch64** wheel がある場合（numpy、pandas、scipy、psutil はあります）のみ **Linux** エンジンで動作します。glibc の `manylinux` wheel しか公開していないパッケージは、ゲストにインストールできません。
- Raspberry Pi Zero、1、2 ではゲストは 32 ビットであり、PyPI にはそれ用のコンパイル済み wheel がほとんどありません。そこでは、プリインストールされているものか純粋な Python パッケージにとどめてください。
- ゲストがすでに提供している名前（`RPi.GPIO`、`smbus2`、`spidev`、`pyserial`、`gpiozero`、`gpiod`）は決してダウンロードされないため、それらを列挙したチュートリアルの `requirements.txt` は害を及ぼしません。

Wheel は Arduino ライブラリと同じストレージクォータを消費します。

### Linux ゲストで手動で pip を実行する

その必要は決してありません。`requirements.txt` が宣言したものは、インストール手順なしでゲストの起動時点でインポート可能です。それを明示するチュートリアルに従う人のために、実際のコマンドも動作します。

```bash
python3 -m venv --system-site-packages ~/.venv
~/.venv/bin/pip install -r requirements.txt
```

ゲストにはネットワークがないため、`pip` はプロジェクトのパッケージとともに同梱されるローカルの wheelhouse に対して解決します。プロジェクトが宣言したものをインストールし、それ以外のために PyPI に到達することはできません。

始める前にそのコストを知っておき、沈黙をハングと読み違えないでください。エミュレートされた CPU では、pip **付き**で virtualenv を作成するのに約 4 分（なしなら約 6 秒）、インストール自体に約 30 秒かかります。宣言したパッケージはプロンプトが出る時点ですでにインポートされているため、この待ち時間はすでに持っている以上のものを何ももたらしません。これは本物のワークフローが欲しいときのためにあります。

システム Python は Raspberry Pi OS Bookworm とまったく同じように外部管理（PEP 668）とマークされているため、virtualenv 外での素の `pip install` は、ボード上で返すのと同じメッセージで拒否します。

## ファイル

Pi ワークスペースの**ファイルパネル**は、スクリプトとデータファイルをプロジェクトにアップロードします。Linux モードでは、`script.py` が起動する前にそれらがゲストのホームディレクトリにコピーされます。

## UNIHIKER M10

DFRobot の教育用 SBC（タッチスクリーン内蔵の Linux ボード）は同じ 2 つのエンジンで動作し、Pi ライブラリの代わりに独自の `pinpong` と `unihiker` モジュールを持ちます。これは独自の 3 回のトライアルセッションを持つ有料ボードです。Pi ファミリーの隣のピッカーで見つかります。

## ボードアートとピン配置

各ボードのキャンバスアートと完全なピンマップは、シミュレータから生成されています。

[Raspberry Pi 3 (アートは Zero/1/2 にも)](/docs/ja/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/ja/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/ja/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/ja/boards/reference/unihiker-m10/)
