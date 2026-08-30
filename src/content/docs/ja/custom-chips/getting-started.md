---
title: 最初のカスタムチップを作成する
description: カスタムチップ部品を追加し、数行のCコードを書くと、VelxioがWebAssemblyにコンパイルします。
sidebar:
  order: 2
---

**カスタムチップ**は、自分でプログラムするコンポーネントです。`velxio-chip.h` APIに対してプレーンなC言語で記述すると、VelxioがクラウドでWebAssemblyにコンパイルし、その結果はカタログ上の部品と同じように動作します。配線するピン、編集する属性、シミュレーション内で実行されるロジックを備えています。

## 作成すべき場合

- 必要なICがカタログにない場合（あまり知られていないシフトレジスタ、独自のセンサープロトコルなど）。
- テストフィクスチャが必要な場合（パルスジェネレータ、プロトコルエクササイザ、スクリプト化された値を持つフェイクセンサーなど）。
- デジタルロジックを教えていて、学生にチップを単に使うだけでなく_実装_させたい場合。

## 5分でできる手順

1. [コンポーネントピッカー](/docs/ja/circuit-editor/placing-components/)を開き、キャンバスに**Custom Chip**を追加します。
2. サンプルギャラリーが開きます。開始点を選択します（または空白から始めます）。
3. 通常のコードエディタが開きます。チップはファイルエクスプローラー内に独自のセクションを持ち、2つの通常ファイルがあります。
   - **`chip.c`** — 動作;
   - **`chip.json`** — マニフェスト: 名前、ピン、属性（入力時に補完で検証されます）。
   これは組み込みの**Inverter**の例です:

```c
#include "velxio-chip.h"
#include <stdlib.h>

typedef struct { vx_pin in, out; } chip_state_t;

static void on_in_change(void* ud, vx_pin pin, int value) {
  chip_state_t* s = ud;
  vx_pin_write(s->out, value ? VX_LOW : VX_HIGH);
}

void chip_setup(void) {
  chip_state_t* s = malloc(sizeof *s);
  s->in  = vx_pin_register("IN",  VX_INPUT);
  s->out = vx_pin_register("OUT", VX_OUTPUT);
  vx_pin_write(s->out, vx_pin_read(s->in) ? VX_LOW : VX_HIGH);
  vx_pin_watch(s->in, VX_EDGE_BOTH, on_in_change, s);
  vx_log("inverter ready");
}
```

そのマニフェストは次のとおりです:

```json
{
  "schema": "velxio-chip/v1",
  "name": "Inverter",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

4. `IN`をボタンに、`OUT`をLEDに配線し、**Run**を押します。ソースが変更されるたびにチップは自動的にコンパイルされます（チップのファイルエクスプローラーセクションにあるハンマーボタンで単独でコンパイルでき、エラーは他のCコンパイラと同様に出力コンソールに表示されます）。
5. トグルして動作を確認します。シミュレーションを停止した状態でチップをクリックすると、その`chip.c`に戻ります。編集して再度**Run**を押します。

## チップの実行方法

ホストは各チップインスタンスに対して`chip_setup()`を1回呼び出します。その後、チップは**リアクティブ**になります。コードはコールバック内でのみ実行されます（監視中のピンの変化、I2Cバイトの到着、タイマーの発火など）。ブロックするメインループはないため、カスタムチップは回路のあちこちに配置してもコストがかかりません。

## 組み込みのサンプルチップ

チップエディタには、読み込んで変更できる動作するソースが付属しています。ロジックゲート（インバータ、XOR）、シフトレジスタ（74HC595、CD4094）、I2C部品（PCF8574、DS3231 RTC、24Cxx EEPROM）、SPI ADC（MCP3008）、UART ROT13トランスフォーマー、パルスカウンター、そして本当に冒険好きな人のための**レトロCPUコレクション**（Intel 4004など）です。

次: [チップAPIリファレンス](/docs/ja/custom-chips/api/)。
----- END PAGE -----
