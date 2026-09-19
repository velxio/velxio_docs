---
title: 終了コード
description: velxio-cli がジョブに返すもの、各コードの意味、そしてそれが分単位で何を消費するか。
sidebar:
  order: 6
---

終了コードは Velxio CI とあなたのジョブの間の契約です。これは安定しており、
スクリプトが依存してもかまいません。

| code  | meaning                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`   | **Passed。** `--expect-text` が一致した、シナリオが完了した、または要求されたのがスクリーンショットの取得だけでそれが撮影された。                                                  |
| `1`   | **Failed。** `--fail-text` が出現した、`expect-pin` が一致しなかった、ステップが失敗した、またはゲストがクラッシュした。                                                                     |
| `2`   | **Config。** 使用方法または lint のエラー、あるいは実行開始前にサーバーが実行を拒否した。何も課金されない。                                                                     |
| `3`   | **Auth。** トークンが欠落、不正な形式、未知、失効、または期限切れである。あるいはプランが CI を利用する権利を持っていない。                                                                  |
| `4`   | **Quota。** 今月の CI 分が残っていない、または同時実行ジョブ数がプランの上限を超えている。何も課金されない。                                                                     |
| `5`   | **Server or runner。** レート制限、CI 無効化、時間内に空きランナーなし、ランナー喪失、エンジンの停止、ウォールクロック上限、レンダラーのクラッシュ、接続切断。 |
| `42`  | **予算切れ。** 期待が満たされる前にシミュレート時間の予算に達した。`--timeout-exit-code` で変更できる。                                         |
| `130` | **Ctrl-C。** CLI は実行をキャンセルし、最終レポートを最大 5 秒待ってから終了する。                                                                                        |

`--timeout-exit-code 0` は予算を通常の終了に変えます。これは
「N シミュレート秒間実行してシリアルを返して」と言う方法です:

```bash
velxio-cli run --timeout 5000 --timeout-exit-code 0 --serial-log-file serial.log .
```

## ステータスと理由

実行の最終行は両方を示します:

```
FAIL (expect_pin_mismatch) in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 1
```

| status      | reasons                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `passed`    | `plan_complete`, `expect_text`, `screenshots_done`                                                                                             |
| `failed`    | `fail_text`, `expect_pin_mismatch`, `pin_not_connected`, `pin_unknown`, `control_unknown`, `step_failed`, `screenshot_mismatch`, `guest_crash` |
| `timeout`   | `budget_reached`                                                                                                                               |
| `error`     | `engine_stalled`, `wall_cap`, `renderer_crash`, `page_load_failed`, `runner_lost`, `no_runner`, `server_error`, `load_failed`                  |
| `cancelled` | `user`, `client_disconnected`                                                                                                                  |
| `lost`      | `heartbeat`, `api_restart`                                                                                                                     |

`screenshot_mismatch` は予約済みです。スクリーンショット比較はまだ実装されていないため、
現在 `compare-with` が実行を失敗させることはありません。詳しくは
[Scenarios](/docs/ja/ci/scenarios/) を参照してください。

`--json` を指定すると、すべての行がオブジェクトになり、最後の行がすべてを運びます:

```json
{
  "t": "end",
  "status": "failed",
  "reason": "expect_pin_mismatch",
  "exit_code": 1
}
```

GitHub Actions では、同じ値が [action](/docs/ja/ci/github-action/) の `status` および
`sim_time_ms` 出力として届きます。

## 実行が拒否された理由 (exit 2)

これらは何も課金される前に返され、それぞれメッセージに問題のある名前が含まれます:

| code                                                                          | what to fix                                                                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `unknown_board_type`                                                          | ボードが Velxio の種類でも CI が知るボードタイプでもない。`velxio-cli boards`。                                              |
| `board_not_supported_in_ci`                                                   | Velxio にはそのボード向けの CI シミュレーションがまだない。メッセージがフェーズを示す。[board table](/docs/ja/ci/velxio-toml/) を参照。 |
| `board_not_launched`                                                          | ボードは存在するが実行には利用できない。                                                                              |
| `unsupported_part`                                                            | ダイアグラム内の部品がシミュレートできない。id が列挙される。                                                             |
| `firmware_format_mismatch`                                                    | イメージがそのチップ向けではない - 例えば `esp32-s3` ボード上の ESP32-C3 イメージ。                                            |
| `firmware_too_large`, `bundle_too_large`, `blob_missing`, `blob_sha_mismatch` | サイズ上限超過、またはアップロードが完全に届かなかった。                                                                  |
| `scenario_invalid`                                                            | ステップが未知、またはフィールドが欠落あるいは解析不能。                                                                    |
| `scenario_part_missing`                                                       | ステップが回路に存在しない `part-id` を指定している。                                                                        |
| `feature_unsupported`                                                         | まだ構築されていないもの: `language = "micropython"`、`[[chip]]`、タッチステップ。                                           |
| `no_sim_clock`                                                                | そのボードには読み取り可能なシミュレートクロックがないため、シミュレート時間で課金できなかった。                                  |
| `too_many_parts`, `bad_request`                                               | 回路の上限超過、または不正なリクエスト。                                                                           |

Exit 4 は `quota_exhausted` (メッセージにリセット日が含まれる) または
`concurrency` です。Exit 5 は `rate_limited`、`ci_disabled`、または `server_error` です。

まず `velxio-cli lint .` を実行してください。トークンもネットワークも不要で、
exit-2 の原因のほとんどをローカルで捕捉します。

## 各終了が消費するもの

分は**シミュレート**時間であり、秒単位に切り上げられ、実行が予約した予算を
超えることはありません。

- **開始前に拒否された** (exit 2, 3, 4) - 何も消費しない。実行は
  ランナーに到達しなかった。
- **時間内に空きランナーがなかった**、またはファームウェアが開始する前に
  接続が切断された - 何も消費しない。
- **Passed、failed、または timed out** - 経過したシミュレート秒。
- **実行中のサーバーまたはランナーエラー** (exit 5) - 経過したシミュレート
  秒のみで、試行にかかったウォールクロック時間ではない。
- **Ctrl-C** - キャンセルまでのシミュレート秒。

あなたの残高と、すべての実行のステータス、シミュレート時間、課金秒数、終了
コードは [velxio.dev/account/ci](https://velxio.dev/account/ci) にあります。
