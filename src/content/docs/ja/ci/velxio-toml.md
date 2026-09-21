---
title: velxio.toml
description: Velxio CI が読み取るプロジェクトファイル（ボード、ファームウェア、回路、シナリオ）。現在 CI で実行できるボードと、すべてのパスの解決方法を説明します。
sidebar:
  order: 3
---

`velxio.toml` は CLI に何を実行させるかを伝えます。どのボード、どのコンパイル済みファームウェア、どの回路、どのシナリオを使うかです。このファイルは CLI に指定したディレクトリに置きます。ファイル内のすべてのパスはこのファイル自身からの相対パスで、フォワードスラッシュはどの OS でも動作します。

```toml
[velxio]
version = 1                      # required
board = "esp32-s3"               # Velxio board kind
firmware = "build/app.bin"       # .hex | .bin | .uf2 | merged ESP32 image
diagram = "diagram.json"         # Wokwi-format circuit (the default when present)
scenario = "test.yaml"           # default scenario; --scenario overrides it
```

`velxio-cli init --board arduino-uno` は、開始用の `velxio.toml` と、ボードを 1 つ含む `diagram.json` を書き出します。

## キー

| key            | 意味                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | `1` でなければなりません。                                                                                                                                 |
| `board`        | Velxio のボード種別（下の表を参照）。diagram または `.vlx` がすでにボードを指定している場合は省略可能です。両方が存在する場合は一致していなければなりません。 |
| `firmware`     | コンパイル済みイメージ: `.hex`、`.bin`、`.uf2`、またはマージ済み ESP32 フラッシュイメージ。                                                                   |
| `flasher_args` | `firmware` の代わりに ESP-IDF の `build/flasher_args.json` を指定します。この 2 つは同時に指定できません。                                                  |
| `elf`          | `firmware` がない場合に使用する ELF。AVR および RP2040 ボード用に変換されます。                                                                  |
| `diagram`      | 回路。Wokwi の `diagram.json` 形式です。                                                                                               |
| `project`      | Velxio の `.vlx` プロジェクトエクスポート。`diagram` より優先されます。                                                                                         |
| `scenario`     | デフォルトで実行するシナリオ YAML。[シナリオ](/docs/ja/ci/scenarios/)を参照してください。                                                                   |
| `language`     | `arduino`。`micropython` は終了コード 2 で拒否されます。CI はコンパイル済みファームウェアのみを実行します。                                                            |

何も黙って無視されることはありません。CLI が知らないキーは警告になります。まだ実装されていない機能は、書いたプロジェクトとは別のプロジェクトを黙って実行するのではなく、`feature_unsupported` で実行を失敗させます。`[[chip]]`（カスタムチップ）もその 1 つです。現在は拒否され、ソースファイル名が示されます。

## 現在 CI で実行できるボード

決定するのはサーバーであり、CLI ではありません。現在 36 種類が実行できます。ブラウザ内エンジンを持つすべてのボードで、それぞれ実際のファームウェアを起動して検証済みです。

### AVR

| kind | board | `diagram.json` type | firmware |
| ---- | ----- | ------------------- | -------- |
| `arduino-uno` | Arduino Uno | `wokwi-arduino-uno` | Intel HEX |
| `arduino-nano` | Arduino Nano | `wokwi-arduino-nano` | Intel HEX |
| `arduino-mega` | Arduino Mega | `wokwi-arduino-mega` | Intel HEX |
| `attiny85` | ATtiny85 | `wokwi-attiny85` | Intel HEX |

### RP2040 および RP2350

| kind | board | `diagram.json` type | firmware |
| ---- | ----- | ------------------- | -------- |
| `raspberry-pi-pico` | Raspberry Pi Pico | `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | flash image |
| `pi-pico-w` | Raspberry Pi Pico W | `board-pi-pico-w` | flash image |
| `xiao-rp2040` | XIAO RP2040 | `board-velxio-xiao-rp2040` | flash image |
| `xiao-rp2350` | XIAO RP2350 | `board-velxio-xiao-rp2350` | flash image |
| `pimoroni-pico-plus-2w` | Pimoroni Pico Plus 2 W | `board-velxio-pimoroni-pico-plus-2w` | flash image |
| `badger-2350` | Pimoroni Badger 2350 | `board-velxio-badger-2350` | flash image |
| `stellar-unicorn` | Pimoroni Stellar Unicorn | `board-velxio-stellar-unicorn` | flash image |

### XIAO ARM

| kind | board | `diagram.json` type | firmware |
| ---- | ----- | ------------------- | -------- |
| `xiao-nrf52840-sense` | XIAO nRF52840 Sense | `board-velxio-xiao-nrf52840-sense` | Intel HEX |
| `xiao-samd21` | XIAO SAMD21 | `board-velxio-xiao-samd21` | Intel HEX |
| `xiao-ra4m1` | XIAO RA4M1 | `board-velxio-xiao-ra4m1` | Intel HEX |
| `xiao-mg24-sense` | XIAO MG24 Sense | `board-velxio-xiao-mg24-sense` | Intel HEX |
| `xiao-nrf54l15-sense` | XIAO nRF54L15 Sense | `board-velxio-xiao-nrf54l15-sense` | Intel HEX |

### ESP32

| kind | board | `diagram.json` type | firmware |
| ---- | ----- | ------------------- | -------- |
| `esp32` | ESP32 DevKit v1 | `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | merged ESP32 image |
| `esp32-s3` | ESP32-S3 DevKitC-1 | `board-esp32-s3-devkitc-1` | merged ESP32 image |
| `esp32-c3` | ESP32-C3 DevKitM-1 | `board-esp32-c3-devkitm-1` | merged ESP32 image |
| `esp32-c6` | ESP32-C6 DevKitC-1 | `board-esp32-c6-devkitc-1` | merged ESP32 image |
| `esp32-devkit-c-v4` | ESP32 DevKitC v4 | `board-esp32-devkit-c-v4` | merged ESP32 image |
| `esp32-cam` | ESP32-CAM | `board-esp32-cam` | merged ESP32 image |
| `wemos-lolin32-lite` | WEMOS LOLIN32 Lite | `board-wemos-lolin32-lite` | merged ESP32 image |
| `xiao-esp32-s3` | XIAO ESP32-S3 | `board-xiao-esp32-s3` | merged ESP32 image |
| `arduino-nano-esp32` | Arduino Nano ESP32 | `board-arduino-nano-esp32` | merged ESP32 image |
| `xiao-esp32-c3` | XIAO ESP32-C3 | `board-xiao-esp32-c3` | merged ESP32 image |
| `aitewinrobot-esp32c3-supermini` | ESP32-C3 SuperMini | `board-aitewinrobot-esp32c3-supermini` | merged ESP32 image |
| `xiao-esp32c6` | XIAO ESP32-C6 | `board-xiao-esp32-c6` | merged ESP32 image |
| `esp32-p4` | ESP32-P4 Function EV | `board-esp32-p4-function-ev` | merged ESP32 image |
| `m5stack-core` | M5Stack Core | `board-velxio-m5stack-core` | merged ESP32 image |
| `esp32-c3-lcdkit` | ESP32-C3-LCDkit | `board-velxio-esp32-c3-lcdkit` | merged ESP32 image |
| `cardputer-adv` | M5Stack Cardputer ADV | `board-velxio-cardputer-adv` | merged ESP32 image |
| `xiao-esp32s3-sense` | XIAO ESP32-S3 Sense | `board-velxio-xiao-esp32s3-sense` | merged ESP32 image |
| `esp-vocat` | ESP-VoCat | `board-velxio-esp-vocat` | merged ESP32 image |
| `esp32-s3-eye` | ESP32-S3-EYE | `board-velxio-esp32-s3-eye` | merged ESP32 image |
| `esp-sensairshuttle` | ESP-SensAirShuttle | `board-velxio-esp-sensairshuttle` | merged ESP32 image |

これらのボードは diagram 内で `board-velxio-<kind>` と書くこともできます。たとえば `board-velxio-esp32-c6` です。独自の Wokwi タイプを持たないボードには、他の書き方はありません。

`velxio-cli boards` は、各ボードのステータス、`diagram.json` タイプ、受け付けるファームウェア形式を含む最新のリストを出力します。

:::caution
残りのボードはエディタでは動作しますが、まだ CI では動作しません。STM32 ボード（QEMU レーンが必要）、Raspberry Pi および UNIHIKER ボード、ESP32-P4 プレビュー devkit、そしてまだ起動フラグの背後にある DFRobot ファミリーです。それぞれ実行開始前に拒否され、`board_not_supported_in_ci` と予定されているフェーズが示されます。課金は発生せず、近いボードが黙って代用されることもありません。
:::

Pico W は動作しますが、CI にはネットワークがありません。WiFi とソケットは決して接続されず、実行には `no_network` 警告が付きます。

## パスの解決方法

- **設定ファイル:** `velxio.toml`、次に `wokwi.toml`、次にディレクトリ内のちょうど 1 つの `*.vlx`。どれもなければ終了コード 2 です。
- **回路:** `--project-file`、次に `[velxio] project`、次に `--diagram-file`、次に `[velxio] diagram`、次に設定ファイルの隣の `diagram.json`。
- **ファームウェア:** `--firmware`、次に `--elf`、次に `[velxio] firmware` または `flasher_args`、次に `[velxio] elf`、次に `[wokwi] firmware`、次に `[wokwi] elf`。
- **ボード:** `[velxio] board`、次に diagram のボード部分（または `.vlx` のアクティブボード）。

コマンドラインで指定した相対パスは、シェルの作業ディレクトリではなく、プロジェクトディレクトリを基準に解決されます。

## diagram.json

Wokwi の形式をそのまま読み取ります。`version: 1`、`{id, type, left, top, attrs, rotate, hide}` の `parts`、および `[from, to, color, path]` の `connections` です。diagram 内のパーツ id は、シナリオのステップで使用する id です。

```json
{
  "version": 1,
  "parts": [
    {
      "type": "wokwi-arduino-uno",
      "id": "uno",
      "top": 0,
      "left": 0,
      "attrs": {}
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": -40,
      "left": 300,
      "attrs": { "value": "220" }
    },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": -100,
      "left": 420,
      "attrs": { "color": "red" }
    }
  ],
  "connections": [
    ["uno:13", "r1:1", "green", ["v0"]],
    ["r1:2", "led1:A", "green", ["v0"]],
    ["led1:C", "uno:GND.1", "black", ["v0"]]
  ]
}
```

パーツは `wokwi-*` 要素です（`wokwi-led`、`wokwi-pushbutton`、`wokwi-dht22` など）。CLI が認識しないパーツタイプはエラーではなく警告です。決定するのはサーバーであり、シミュレートできないパーツは黙って削除されるのではなく、id で報告されます。

## .vlx

Velxio エディタからエクスポートしたプロジェクト（`format: "velxio-project"`、`version: 1`）は、diagram の代わりに回路として使用できます。ディレクトリに 1 つの `.vlx` を置くか、`project =` または `--project-file` で指定します。エクスポートのプライマリボードが実行のボードになります。ファームウェアは引き続き toml または `--firmware` から取得されます。

## 制限

| 項目                       | 上限                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| ボードあたりのファームウェア         | 16 MiB                                                                                             |
| 実行あたりの全アップロードファイル | 20 MiB                                                                                             |
| 回路                    | 300 パーツ、2,000 ワイヤ                                                                             |
| シナリオ                   | 200 ステップ、20 スクリーンショット、`wait-serial` テキストあたり 512 バイト                                        |
| `--timeout`                | プランの上限（Maker で 5 分、Pro で 10 分）、および残り時間を超えない範囲 |

上限を超える `--timeout` はエラーではありません。クランプされ、実際に割り当てられた予算とともに `timeout_clamped` 警告が報告されます。

## 何分も費やす前に確認する

```bash
velxio-cli lint .
```

`lint` はトークンもネットワークも必要としません。toml を解析し、すべてのパスを解決し、ファイルが存在して上限に収まることを確認し、パーツ id が一意で接続が既存のパーツを参照していることを確認し、ボードが CI で実行できるものであることを確認し、ファームウェア形式がボードファミリーと一致することを確認し、すべてのシナリオステップが既知で、フィールドを持ち、既存のパーツを参照し、その時間指定が解析できることを確認します。ほとんどの `exit 2` 失敗は、ここで見つける方が安上がりです。
