---
title: CI クイックスタート
description: 何もない状態から5分で成功する実行まで。CLI をインストールし、2つのファイルを書き、実行します。
sidebar:
  order: 2
---

有料プランの Velxio アカウントと、コンパイル済みのファームウェアファイルが必要です。ここではシミュレータは何もコンパイルしません。ご自身のツールチェーンが生成した `.hex`、`.bin`、`.uf2`、または `.elf` を持ち込んでください。

## 1. CLI をインストールする

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
```

`~/.velxio/bin` に単一のバイナリを配置し、`PATH` に追加する方法を案内します。Windows の場合: `iwr https://velxio.dev/ci/install.ps1 -useb | iex`。ご自身で取得したい場合は、バイナリは[リリースページ](https://github.com/velxio/velxio-cli/releases)にあります。

## 2. サインインする

```bash
velxio-cli login
```

短いコードを表示し、ブラウザを開いて待機します。リクエストを承認すると、CLI は渡された情報を保存するので、ご自身のマシンでトークンを扱う必要はありません。

```
code     7XJ6-33M5
approve  https://velxio.dev/account/ci/device?code=7XJ6-33M5
waiting for approval of 7XJ6-33M5 (the code expires in 10 min)
signed in as velxio-cli on laptop
```

承認する前に、ページには何が、どのマシンから、何のために要求しているかが表示されます:

![CLI のサインインを承認するブラウザページ: ツール名、実行されているマシン、要求内容が表示され、Approve と Deny ボタンがある](../../../../assets/docs/ci/device-approve.png)

CI ジョブにはブラウザがないため、代わりに1つのシークレットを持ちます。同じフローでそれが発行され、それを保持するリポジトリにちなんで命名されます:

```bash
velxio-cli login --ci --name "my-firmware"
```

こちらはトークンを一度だけ表示します。リポジトリのシークレットとして保存してください (GitHub では Settings、Secrets and variables、Actions)。リポジトリ自体には決して保存しないでください。どちらの種類も [velxio.dev/account/ci](https://velxio.dev/account/ci) に表示され、そこでどちらも失効させることができます。

## 3. プロジェクトを記述する

ファームウェアの隣に2つのファイルを置きます。`velxio-cli init` が出発点となるペアを書き出します。手書きで書くこともできます:

```toml
# velxio.toml
[velxio]
version = 1
board = "esp32-s3"
firmware = "build/blink.bin"
```

```json
{
  "version": 1,
  "parts": [
    { "type": "board-esp32-s3-devkitc-1", "id": "esp", "top": 0, "left": 0 },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 0,
      "left": 120,
      "attrs": { "color": "red" }
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": 60,
      "left": 60,
      "attrs": { "value": "220" }
    }
  ],
  "connections": [
    ["esp:2", "r1:1", "green", []],
    ["r1:2", "led1:A", "green", []],
    ["led1:C", "esp:GND.1", "black", []]
  ]
}
```

これは Wokwi の `diagram.json` 形式なので、既存のダイアグラムはそのまま使えます。

## 4. 実行する

```bash
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

ファームウェアが起動し、シリアル出力がリアルタイムで表示され、テキストが現れるとすぐにコマンドは 0 で終了します。シミュレートされた10秒が経過してもテキストが現れない場合は 42 で終了します。

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 3 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## 5. CI に組み込む

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
```

前のステップでコンパイルしてください。このステップはビルドしたものだけを実行します。

## うまくいかないとき

- **何かが実行される前の `exit 2`。** 設定の問題です: ボードが Velxio で実行できるものではない、ファームウェアがボードと一致しない、またはシナリオにダイアグラムに存在しない部品を指定するステップがある。何も課金されていません。`velxio-cli lint .` はトークンもネットワークもなしでこれらのほとんどを見つけます。
- **`exit 3`。** トークンが欠落している、失効している、または CI のないプランに属しています。
- **`exit 4`。** 今月の残り時間がありません、またはプランが実行できる数を超えるジョブが同時にあります。
- **テキストがまったく現れない。** `--timeout` を増やし、期待値を指定せずに実行して (`velxio-cli run --timeout 5000 .`)、ファームウェアが実際に何を出力するかを確認してください。
