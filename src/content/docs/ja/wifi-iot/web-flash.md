---
title: ブラウザから実機に書き込む
description: ツールチェーンをインストールせずに、ブラウザから直接USB経由でコンパイル済みプロジェクトを実機ボードに書き込みます。
sidebar:
  order: 4
---

プロジェクトがシミュレータで動作したら、何もインストールせずに**実機ボード**に書き込むことができます。Velxioはコンパイル済みファームウェアをUSB経由でブラウザから直接フラッシュします。

## 要件

- Chromiumベースのブラウザ（ChromeまたはEdge）。フラッシャーはブラウザのWeb Serial APIとWebUSB APIを使用しますが、FirefoxとSafariにはこれらが搭載されていません。Picoファミリのボードでは、これらのブラウザでも**Download .uf2**ボタンが表示されます（下記参照）。
- データ通信対応のUSBケーブル（ボード接続用）。
- 先にポートを使用している他のソフトウェア（シリアルモニタ、IDE、picotool）をすべて閉じてください。ブラウザが排他的にアクセスする必要があります。

![USBシリアルポートを選択するフラッシュダイアログ](../../../../assets/docs/wifi-iot/flash-modal.png)

## フラッシュ手順

1. キャンバス上のボードを右クリックし、**Flash to real board**（実機ボードにフラッシュ）を選択します。
2. **Connect & flash**（接続してフラッシュ）をクリックします。ブラウザがどのUSBデバイスに許可を与えるか尋ねるので、ボードを選択します。
3. Velxioは、そのボード用にすでに作成したビルド（シミュレータが実行していたものと同じバイナリ）を使用します。コードが変更されている場合は、最初に再コンパイルされ、コンパイラの出力がダイアログにストリーミング表示されます。
4. プログレスバーを確認します。完了すると、ボードはプロジェクトで再起動します。

ダイアログはターゲットに応じてプロトコルを選択します：

| ファミリ | 書き込み方法 | ボードの状態 |
| --- | --- | --- |
| ESP32、S3、C3、C6 | シリアルポート経由のesptool、マージされた`.bin` | 接続済みであること。応答しない場合はBOOTボタンを押したままにする |
| Arduino Uno、Nano、Mega、ATtiny85 | ボードのブートローダに対するSTK500、`.hex` | 接続済みであること（ATtiny85：ArduinoISPを実行しているArduino経由） |
| Raspberry Pi Pico、Pico W、Pico 2、Pimoroni RP2040 / RP2350ボード | WebUSB経由のPICOBOOT、picotoolがビルドした`.uf2` | **BOOTSEL**モードであること（次のセクション） |

## Picoファミリボード：最初にBOOTSEL

RP2040またはRP2350は、チップが**BOOTSEL**モードでのみ表示する別のUSBパーソナリティであるブートローダによってプログラムされます。そこに到達するには2つの方法があります：

- **手動**: BOOTSELボタンを押したままボードを接続し、その後離します。ボードは`RPI-RP2`（RP2040）または`RP2350`という名前のUSBドライブとしてマウントされます。
- **ダイアログから**: これらのボードのフラッシュダイアログには、**Reboot into bootloader over USB**（USB経由でブートローダに再起動）ボタンがあります。これは、ボードがVelxioがビルドしたスケッチ（Arduinoコアが1200ボーオープンで再起動する）またはMicroPython（REPLが`machine.bootloader()`を実行する）を実行している場合に機能します。ブラウザがボードのシリアルポートを尋ね、ボードは切断され、ブートローダとして戻ってきます。次に**Connect & flash**（接続してフラッシュ）をクリックし、`RP2 Boot` / `RP2350 Boot`デバイスを選択します。

2回のクリック、2つの権限プロンプト：再起動用のシリアルポートと書き込み用のUSBデバイスです。ボードがBOOTSELモードになると、以降のフラッシュでは2番目のプロンプトのみが必要です。

ダイアログは、応答したチップと一致しないイメージ（RP2040上のRP2350ビルド、ARM構成上のRISC-Vビルドなど）を、何かを消去する前に拒否し、書き込み後にすべてのバイトを検証し、ボードをプログラムで再起動します。

### WindowsとRP2040：WinUSBを一度インストール

RP2040ブートローダにはWindowsドライバ記述子が含まれていないため、WinUSBがバインドされるまでブラウザはそれを要求できません。一度だけのセットアップ：

1. ボードをBOOTSELモードにして接続します。
2. [Zadig](https://zadig.akeo.ie)をダウンロードして実行します。
3. リストから`RP2 Boot (Interface 1)`を選択し（非表示の場合はOptions、List All Devices）、ドライバとして**WinUSB**を選択し、**Install Driver**（ドライバをインストール）をクリックします。

RP2350ボード（Pico 2、Pico 2 W、Pimoroni "Pico 2 W Aboard" Unicorns、Badger 2350）は何も必要ありません。これらのブートローダには記述子が含まれており、Windowsが自動的にWinUSBをバインドします。macOSはどちらのチップでも何も必要ありません。

### Linux：udevルール

LinuxはデフォルトでUSBデバイスをrootに割り当てます。`/etc/udev/rules.d/99-velxio-rp2.rules`を作成します：

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="2e8a", MODE="0666", TAG+="uaccess"
```

次に`sudo udevadm control --reload-rules && sudo udevadm trigger`を実行し、ボードを再接続します。再起動ステップで使用されるシリアルポートには、通常の`dialout`グループメンバーシップも必要です。

### 任意のブラウザ：.uf2をダウンロード

Picoファミリボードのフラッシュダイアログには常に**Download .uf2**オプションがあります（FirefoxとSafariでは、ブラウザがフラッシュできないため、ダイアログ全体がこれになります）。ファイルを保存し、ボードをBOOTSELモードにして、`RPI-RP2` / `RP2350`ドライブにファイルをドロップします。コピーが終了するとすぐにボードはスケッチで再起動します。

### PicoでのMicroPythonプロジェクト

ダイアログはプロジェクトの`.py`ファイルをREPL経由でアップロードし、`main.py`で再起動します。MicroPython自体が最初にボードにインストールされている必要があります：

- **PicoおよびPico W**: ダイアログがインストールします。REPLが応答しない場合は、ボードをBOOTSELモードにしてRetryをクリックするよう求められます。そのクリックでシミュレータが実行するのと同じMicroPythonビルドが書き込まれ、もう一度Retryするとファイルがアップロードされます。
- **Pimoroni RP2350ボード**（Badger 2350、Pico Plus 2W）：これらにはPimoroni独自のMicroPythonがプリインストールされています。失われた場合は、[pimoroni-pico-rp2350](https://github.com/pimoroni/pimoroni-pico-rp2350/releases)から`.uf2`をダウンロードし、BOOTSELドライブに一度ドロップしてから、ダイアログからフラッシュします。

## トラブルシューティング

- **「No board in BOOTSEL mode was found」（BOOTSELモードのボードが見つかりません）**: デバイスピッカーが空でした。再起動ボタンを使用するか、接続中にBOOTSELを押したままにして、再度接続してください。
- **「The board in BOOTSEL is an RP2040 but this project is built for RP2350」（BOOTSELのボードはRP2040ですが、このプロジェクトはRP2350用にビルドされています）**: Pimoroniは2025年1月までStellarおよびGalactic UnicornをPico W（RP2040）で販売し、それ以降はPico 2 W（RP2350）で販売しています。ユニットのラベルを確認し、エディタで一致するボードを選択してください。
- **WindowsでRP2040を使用時に「Could not claim the USB device」（USBデバイスを要求できませんでした）**: 上記のZadigの手順を実行してください。Linuxの場合：上記のudevルールを適用してください。
- **シリアル再起動が機能しなかった**: USBスタックが無効な状態でビルドされたスケッチは、USB経由で再起動できません。接続中にBOOTSELを押したままにしてください。

## 最初にシミュレート、次にフラッシュ

これにより、Velxioを実際の作業に役立てるループが完成します。シミュレータで高速に反復処理（ケーブル不要、ハードウェアの摩耗なし、即時リセット）を行い、動作が確認できたら、まったく同じビルド成果物をフラッシュします。
