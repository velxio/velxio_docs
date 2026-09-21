---
title: Wokwi CI からの移行
description: wokwi-cli のジョブを Velxio CI に移すと何が変わり、何が変わらないのか - uses 行、シークレット名など。
sidebar:
  order: 7
---

Velxio CI は、Wokwi CI プロジェクトがすでに持っているファイルを読み取ります: `wokwi.toml`、
`diagram.json`、そして Wokwi のシナリオ YAML です。Wokwi のコードは一切関与しておらず、
独自のパーサーがこれらのフォーマットを読み取ります。実際のところ、移行は 2 行だけです。

```diff
-      - uses: wokwi/wokwi-ci-action@v1
+      - uses: velxio/velxio-ci-action@v1
         with:
-          token: ${{ secrets.WOKWI_CLI_TOKEN }}
+          token: ${{ secrets.VELXIO_CLI_TOKEN }}
           path: /
           timeout: 10000
           expect_text: 'Hello, World!'
           fail_text: 'Error'
           scenario: 'test.scenario.yaml'
```

アクションの入力名は意図的にそのまま維持されています: `path`、`timeout`、
`expect_text`、`fail_text`、`scenario`、`serial_log_file`、`diagram_file`、
`elf`。シークレットは `velxio-cli login --ci --name "<repo>"` で取得し（ブラウザで承認すると
トークンが一度だけ表示されます）、リポジトリのシークレットとして保存します。完全なリストは
[GitHub Actions](/docs/ja/ci/github-action/) にあります。

## コマンドラインでの利用

`wokwi-cli` のフラグは同じ名前で存在します: `--elf`、
`--diagram-file`、`--scenario`、`--expect-text`、`--fail-text`、
`--timeout`、`--timeout-exit-code`、`--interactive`、`--serial-log-file`、
`--screenshot-part`、`--screenshot-time`、`--screenshot-file`、`--quiet`。
`--timeout` はどちらもシミュレーション上のミリ秒です。

`WOKWI_CLI_TOKEN` は決して読み取られません。`VELXIO_CLI_TOKEN`（または
`VELXIO_CI_TOKEN`）を設定するか、`velxio-cli login` を一度実行してください。

## wokwi.toml

そのまま読み取られます。`velxio.toml` にリネームする必要はありません:

```toml
[wokwi]
version = 1
firmware = "build/firmware.bin"   # used
elf = "build/firmware.elf"        # used when firmware is absent (AVR, RP2040)
gdbServerPort = 3333              # warning: not supported
rfc2217ServerPort = 4000          # warning: not supported
vcdFile = "trace.vcd"             # warning: not supported

[[net.forward]]                   # warning: CI runs have no network
from = "localhost:8080"
to = "target:80"

[[chip]]                          # refused: custom chips do not run in CI yet
name = "inverter"
binary = "chips/inverter.chip.wasm"
```

サポートされていないキーは名前を挙げて報告されます。これらは警告であり、
黙って無視されることはありません。ただし `[[chip]]` は例外で、テスト対象のチップを欠いた
回路でパスしてしまうことがないよう、実行を停止します。現在の Velxio CI には GDB サーバー、
RFC2217 ポート、VCD エクスポート、ネットワーク転送はありません。

Velxio が追加するキー - `board`、`diagram`、`project`、`scenario`、
`flasher_args` - は `[velxio]` の下に置きます。詳しくは
[velxio.toml](/docs/ja/ci/velxio-toml/) を参照してください。

## ボード

Wokwi のパーツタイプは Velxio の種類に対応します。現在動作するものは次のとおりです:

| Wokwi `diagram.json` の type | Velxio の kind |
| ------------------------- | ----------- |
| `wokwi-arduino-uno` | `arduino-uno` |
| `wokwi-arduino-nano` | `arduino-nano` |
| `wokwi-arduino-mega` | `arduino-mega` |
| `wokwi-attiny85` | `attiny85` |
| `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | `raspberry-pi-pico` |
| `board-pi-pico-w` | `pi-pico-w` (CI ではネットワークなし: 警告) |
| `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | `esp32` |
| `board-esp32-s3-devkitc-1` | `esp32-s3` |
| `board-esp32-c3-devkitm-1` | `esp32-c3` |
| `board-esp32-c6-devkitc-1` | `esp32-c6` |
| `board-esp32-devkit-c-v4` | `esp32-devkit-c-v4` |
| `board-esp32-cam` | `esp32-cam` |
| `board-wemos-lolin32-lite` | `wemos-lolin32-lite` |
| `board-xiao-esp32-s3` | `xiao-esp32-s3` |
| `board-arduino-nano-esp32` | `arduino-nano-esp32` |
| `board-xiao-esp32-c3` | `xiao-esp32-c3` |
| `board-aitewinrobot-esp32c3-supermini` | `aitewinrobot-esp32c3-supermini` |
| `board-xiao-esp32-c6` | `xiao-esp32c6` |
| `board-esp32-p4-function-ev` | `esp32-p4` |
| `board-velxio-<kind>` | CI で動作する任意のボードを Velxio の書き方で記述 |

Velxio は CI で 36 種類のボードを実行し、そのほとんどは Wokwi に対応するタイプが存在しない
ボードです: RP2350 ファミリー、XIAO ARM ボード、M5Stack や Seeed のキットなどです。これらは
`board-velxio-<kind>` として記述します。完全なリストは
[ボード表](/docs/ja/ci/velxio-toml/) にあります。

その他のすべての Wokwi ボードは実行開始前に失敗し、
`board_not_supported_in_ci` または `unknown_board_type` と、そのタイプ名、および計画された
フェーズが表示されます。これには `board-pi-pico-2` と `-2w`、STM32 ボード、Nucleo、
ESP32-S2/H2/C61 ボード、ESP32-P4 プレビュー devkit、ディスプレイキットが含まれます。
近い Velxio ボードが提案されるのは、それが現在動作する場合のみであり、自動的に置き換えられる
ことはありません。拒否された分は課金されません。

`velxio-cli boards` は、各ボードのステータスとともに最新のリストを表示します。

## シナリオ

Wokwi のシナリオ YAML はそのまま動作します: `delay`、`wait-serial`、
`write-serial`、`expect-pin`、`set-control`、`take-screenshot`、同じフィールド名
（`part-id`、`save-to`、`compare-with`、`value`）を使用します。タイミングはすべて
Wokwi と同様にシミュレーション時間です。違いは 2 点あります:

- **タッチステップ**（`touch-press`、`touch-move`、`touch-release`）は
  実装されていません。CLI は lint 時にこれらを拒否します。
- **`compare-with` はキャプチャされますが、まだ比較されません**: PNG と
  警告が得られ、それによって実行が失敗することはありません。

詳細は [シナリオ](/docs/ja/ci/scenarios/) を参照してください。

## ファームウェア

CLI は、ツールチェーンが生成したものをボードのエンジンが読み込む形式に変換します:

- Arduino ESP32 の「Export compiled binary」フォルダは動作します: `<sketch>.ino.bin`
  は `<sketch>.ino.bootloader.bin` と
  `<sketch>.ino.partitions.bin`（存在する場合は `boot_app0.bin` も）とマージされます。
- PlatformIO の `firmware.bin` + `bootloader.bin` + `partitions.bin` も
  同じようにマージされます。ESP-IDF プロジェクトでは、代わりに `flasher_args` を
  `build/flasher_args.json` に向けることができます。
- 兄弟ファイルのない単独の ESP32 `app.bin` は拒否され、
  `esptool.py merge_bin` のヒントが表示されます。
- Pico の `.uf2` と `.elf` はフラッシュイメージにフラット化され、AVR の `.elf`
  は Intel HEX になります。
- ブートローダーのチップ ID はボードと一致している必要があります: `esp32-s3` ボード上の
  ESP32-C3 イメージは `firmware_format_mismatch`、終了コード 2 となります。

MicroPython はサポートされていません: CI はコンパイル済みファームウェアを実行し、
`language = "micropython"` は別のものとして実行されるのではなく拒否されます。

## 課金

分数はシミュレーション時間で、秒単位に切り上げられ、暦月（UTC）ごとに計算されます:
Maker では月 200 分、Pro では 2,000 分です。開始前に拒否された実行は無料で、
エンジンの停止や実時間の上限によるものは、経過したシミュレーション秒数のみが課金されます。
完全な表は [終了コード](/docs/ja/ci/exit-codes/) を参照してください。

## すでにあるプロジェクトで試す

```bash
velxio-cli lint .        # no token, no network: does Velxio understand this project?
export VELXIO_CLI_TOKEN=vlxci_...
velxio-cli run --scenario test.scenario.yaml --timeout 10000 .
```

`lint` がクリーンであれば、実行はボードに到達します。
