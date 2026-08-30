---
title: WokwiチップをVelxioに持ち込む
description: WokwiカスタムチップC API用に書かれたチップは、変更なしでVelxioでコンパイルでき、Wokwiプロジェクトのzipファイルはチップごとインポートできます。
sidebar:
  order: 5
---

Wokwi用にカスタムチップを書いたことがあるなら、そのまま使えます。Velxioは、文書化されたWokwiカスタムチップC APIと**ソース互換**です。

## 同じCコード、そのまま

`#include "wokwi-api.h"` は、クリーンルーム実装の互換性ヘッダーに解決され、コンパイル時に文書化されたすべてのシンボルをVelxioのネイティブな `vx_*` APIに適応させます。

- `chip_init()` がエントリーポイントです。Wokwiとまったく同じです。
- `pin_init`、`pin_read`、`pin_write`、`pin_mode`、`pin_watch`（その `pin_watch_config_t` も含む）、`pin_adc_read`、`pin_dac_write` — すべて揃っています。
- `i2c_init`、`uart_init`、`spi_init` は設定構造体を受け取ります。フィールド（`connect`/`read`/`write`/`disconnect`、`rx_data`/`write_done`、`done`）は一対一で変換されます。
- `attr_init` / `attr_read`（および `_float` と文字列バリアント）、`timer_init` / `timer_start`（マイクロ秒、自動変換）/ `timer_start_ns` / `timer_stop`、`get_sim_nanos`、`framebuffer_init` / `buffer_write` / `buffer_read`。
- `INPUT`/`OUTPUT`/`INPUT_PULLUP`/`INPUT_PULLDOWN`/`ANALOG`、`OUTPUT_LOW`/`OUTPUT_HIGH`、`LOW`/`HIGH`、`RISING`/`FALLING`/`BOTH`、`NO_PIN` — 同一の値です。

他のVelxioチップと同じようにコンパイルします。Cコードをカスタムチップの `chip.c` に貼り付けて、**Run**（実行）を押すだけです。

## chip.json の互換性

`name`、位置指定の `pins` 配列（`""` スロットスキップを含む）、`attributes`、`controls`（ライブスライダー）、`display` はすべてWokwiと同様に機能します。`symbol` とカスタムSVGアートワークは無視されます — Velxioは、ピン数に合わせてサイズ調整された独自の汎用チップボディを描画します。

## プロジェクトzipファイル

**File**（ファイル）→ **Open project**（プロジェクトを開く）でWokwiプロジェクトのzipファイルを受け付けます。`diagram.json` 内の `chip-<name>` パーツは、同じディレクトリの `<name>.chip.c` / `<name>.chip.json` からソースが読み込まれたカスタムチップになり、配線はそのまま維持されます。エクスポート時も同じレイアウトで書き出されます。

## 引き継がれないもの

- **プリコンパイル済みの `.wasm` バイナリ** — Velxioのインポート名前空間が異なるため、ソースから再コンパイルしてください（数秒で完了し、zipインポート時に最初のRunで自動的に行われます）。
- 実験的な `_mcu_*` イントロスペクションAPI。

## 新しいチップにはネイティブAPIを推奨

互換性レイヤーは、既存の作業をそのまま実行できるようにするために存在します。新しいチップには、ネイティブの [`velxio-chip.h` API](/docs/ja/custom-chips/api/) が、より明確な型（電圧は `double`、ナノ秒タイマー）で同じアイデアを提供します。また、これはサンプル、AIエージェント、[My Chips](/docs/ja/custom-chips/my-chips/) がネイティブに使用しているAPIです。
----- END PAGE -----
