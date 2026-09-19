---
title: GitHub Actions
description: velxio-ci-action のすべての入力と出力、デフォルト値、そしてそれを利用するワークフローについて。
sidebar:
  order: 5
---

`velxio/velxio-ci-action` はランナーに CLI をインストールし、1 つのプロジェクトを実行します。これはコンポジットアクションです。コンテナも Docker プルも不要で、バイナリはジョブ間でキャッシュされます。

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
    fail_text: "Guru Meditation"
```

コンパイルは、すでにお使いのツールチェーンを使って、前のステップで行ってください。このアクションは、その結果出力されたものだけを実行します。

## ワークフロー全体

```yaml
name: firmware
on: [push, pull_request]

jobs:
  simulate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: |
          arduino-cli core install arduino:avr
          arduino-cli compile -b arduino:avr:uno --output-dir build sketch

      - name: Run it on a simulated Uno
        uses: velxio/velxio-ci-action@v1
        with:
          token: ${{ secrets.VELXIO_CLI_TOKEN }}
          path: .
          scenario: scenario.yaml
          timeout: 10000
```

ランナーにはサインインを承認するブラウザがないため、このジョブにはシークレットが 1 つ必要です。次のコマンドで発行します。

```bash
velxio-cli login --ci --name "my-firmware"
```

これはトークンを一度だけ出力するので、リポジトリのシークレットとして保存してください（**Settings, Secrets and variables, Actions**）。アカウントページ（[velxio.dev/account/ci](https://velxio.dev/account/ci)）でも発行でき、どちらのトークンもそこで失効させられます。

## 入力

| input               | default              | meaning                                                                    |
| ------------------- | -------------------- | -------------------------------------------------------------------------- |
| `token`             | required             | あなたの Velxio CI トークン                                                |
| `path`              | `.`                  | プロジェクトディレクトリ: `velxio.toml`（または `wokwi.toml`）と `diagram.json` |
| `timeout`           | `10000`              | シミュレーション時間の予算（ミリ秒）                                       |
| `expect_text`       |                      | これがシリアルに現れた時点で実行は成功                                     |
| `fail_text`         |                      | これがシリアルに現れた時点で実行は失敗                                     |
| `scenario`          |                      | シナリオ YAML（`path` からの相対パス）                                     |
| `serial_log_file`   |                      | 実行中のすべてのシリアルバイトをここに書き出す（`path` からの相対パス）    |
| `diagram_file`      | `diagram.json`       | 回路ファイル（`path` からの相対パス）                                      |
| `elf`               |                      | ELF ファームウェア。設定ファイルを上書きする                               |
| `firmware`          |                      | `.hex`、`.bin`、`.uf2`、またはマージ済み ESP32 イメージ。設定ファイルを上書きする |
| `screenshot_part`   |                      | スクリーンショットを撮るパーツ ID                                          |
| `screenshot_time`   |                      | スクリーンショットのシミュレーション時間（ミリ秒）                         |
| `screenshot_file`   | `screenshot.png`     | その書き出し先                                                             |
| `timeout_exit_code` | `42`                 | 予算に達したときのステップの終了コード                                     |
| `server`            | `https://velxio.dev` | Velxio サーバー                                                            |
| `cli_version`       | `latest`             | インストールする `velxio-cli` リリース。例えば `v0.1.1`                     |

すべての入力は `velxio-cli` のフラグに 1 対 1 で対応します。このアクションが公開していないもの - `--project-file`、`--interactive`、`--json`、`--screenshot-tolerance`、`--allow-unsupported` - が必要な場合は、代わりに `run:` ステップで CLI を直接呼び出してください。

## 出力

| output        | value                                                         |
| ------------- | ------------------------------------------------------------- |
| `run_id`      | サーバー側の実行 ID                                           |
| `run_url`     | あなたのアカウントページ上の実行                              |
| `status`      | `passed`、`failed`、`timeout`、`error`、`cancelled`、`lost` のいずれか |
| `sim_time_ms` | 実行が継続したシミュレーション時間（ミリ秒）                  |

これらは実行が失敗した場合でも公開されるので、後続のステップからリンクできます。

```yaml
- name: Run it
  id: sim
  continue-on-error: true
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    expect_text: "READY"

- name: Report
  run: |
    echo "status=${{ steps.sim.outputs.status }}"
    echo "run: ${{ steps.sim.outputs.run_url }}"
    echo "simulated: ${{ steps.sim.outputs.sim_time_ms }} ms"
```

`continue-on-error` がない場合、CLI の非ゼロ終了はステップとジョブを失敗させます。通常はそれが望ましい動作です。各コードの意味については[終了コード](/docs/ja/ci/exit-codes/)を参照してください。

## 複数のボードを同時に

ステップごとに 1 プロジェクト、またはマトリクスを使います - ただしプランの同時実行数に注意してください。Maker は同時に 1 ジョブ、Pro は 2 ジョブを実行します。3 つ目の同時実行は終了コード 4 で拒否され、コストはかからないので、マトリクスは自分で上限を設定してください。

```yaml
jobs:
  simulate:
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 2
      matrix:
        project: [uno-ready, esp32s3-boot]
    steps:
      - uses: actions/checkout@v4
      - uses: velxio/velxio-ci-action@v1
        with:
          token: ${{ secrets.VELXIO_CLI_TOKEN }}
          path: test/ci/projects/${{ matrix.project }}
          expect_text: "READY"
```

## ランナー

Linux、macOS、Windows のランナーに対応しており、x64 と ARM64 の両方で動作します（Windows は x64 のみ）。このアクションはリリースタグを解決し、リリースの `SHA256SUMS` に対してバイナリを検証し、バージョンとプラットフォームをキーとして `actions/cache` にキャッシュします - したがって、新しい CLI バージョンの最初のジョブだけが何かをダウンロードします。

## 実行が生成したもののアップロード

シリアルログとスクリーンショットは、プロジェクトディレクトリ内の通常のファイルです。

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: velxio-run
    path: |
      firmware/blink/serial.log
      firmware/blink/*.png
```

実行ステップで `serial_log_file: serial.log` を指定してください。

## その他の CI システム

他の場所にインストールするアクションはありません - CLI をインストールして呼び出すだけです。

```yaml
script:
  - curl -fsSL https://velxio.dev/ci/install.sh | sh
  - ~/.velxio/bin/velxio-cli run --expect-text 'READY' --timeout 10000 .
```

ジョブのシークレット環境に `VELXIO_CLI_TOKEN` を設定してください。終了コードが契約のすべてであり、それはどこでも同じです。
