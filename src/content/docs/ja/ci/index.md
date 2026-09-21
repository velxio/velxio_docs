---
title: Velxio CI
description: ターミナルまたは CI ジョブからシミュレートされたボード上でファームウェアを実行し、ファームウェアが誤動作したときにビルドを失敗させます。
sidebar:
  order: 1
  badge:
    text: Paid
    variant: tip
---

Velxio CI は、ブラウザの外から、あなたのプロジェクトを私たちのシミュレータ上で実行します。ターミナル、GitHub Actions ジョブ、バイナリを実行できる任意の CI から利用できます。ボードは実際にコンパイルされたファームウェアを起動し、シリアル出力がストリームで返され、あなたが期待したことが起こらなかった場合にはコマンドが非ゼロで終了します。

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
velxio-cli login                           # approve in the browser, once
cd firmware/blink
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 4 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## 何のためにあるのか

- **ハードウェアが気づく前にファームウェアのリグレッションを捕捉します。** バイナリを起動してシリアルの 1 行を待つテストはコマンド 1 つです。ボタンを押し、センサーを設定し、ピンをチェックするテストは短い YAML ファイルです。
- **机の上に置けないものをテストします。** Velxio がシミュレートするすべてのボードは、ラボもフラッシュも不要で、すべてのジョブから並列に利用できます。
- **手持ちのツールチェーンをそのまま使えます。** 前のステップで arduino-cli、ESP-IDF、PlatformIO、cargo でコンパイルしてください。Velxio はその出力を実行するだけです。

## コスト

CI は **シミュレートされた分** で課金されます。つまり、ゲストファームウェアが経過したと認識する時間であり、私たちのサーバーが要した時間ではありません。10 秒のテストは、エミュレータが実時間より速く実行しても遅く実行しても、どのボードでも 10 秒のコストになります。

| プラン | 月あたりの CI 分 | 同時ジョブ数 | 最長実行時間 |
| ----- | -------------------- | ------------ | ----------- |
| Free  | なし                 | なし         | なし        |
| Maker | 200                  | 1            | 5 分        |
| Pro   | 2,000                | 2            | 10 分       |

開始されなかった実行 (不明なボード、ボードに一致しないファームウェア、拒否されたシナリオ) はコストがかかりません。分は毎月 1 日 (UTC) にリセットされます。残高、実行履歴、トークンは [/account/ci](https://velxio.dev/account/ci) にあります。

![CI アカウントページ: 今月使用した分、存在するトークンとそれぞれの最終使用日時、最近の実行のステータス・シミュレート秒数・課金秒数・終了コードを示す表](../../../../assets/docs/ci/account.png)

## プロジェクトが自身を記述する方法

CLI に指定するディレクトリ内の 2 つのファイル:

- `velxio.toml`: ボードとファームウェア。Wokwi の `wokwi.toml` も使用できます。
- `diagram.json`: 回路。Wokwi のフォーマットなので、既存のダイアグラムはそのまま動作します。

シリアルチェックでは不十分な場合は `scenario.yaml` を追加してください。テキストの待機、テキストの送信、シミュレートされたクロックでの待機、ピンのチェック、パーツのコントロールの設定ができます。詳しくは [Scenarios](/docs/ja/ci/scenarios/) を参照してください。

## 次へ

- [Quickstart](/docs/ja/ci/quickstart/): 5 分で最初の成功する実行。
- [velxio.toml](/docs/ja/ci/velxio-toml/): すべてのキーと、パスの解決方法。
- [Scenarios](/docs/ja/ci/scenarios/): ステップとその意味。
- [GitHub Actions](/docs/ja/ci/github-action/): アクションとその入力。
- [Exit codes](/docs/ja/ci/exit-codes/): それぞれがジョブにとって何を意味するか。
- [Coming from Wokwi CI](/docs/ja/ci/migrating-from-wokwi/): 何が変わるか。
