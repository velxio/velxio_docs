---
title: 最初のカスタムチップを作成する
description: カスタムチップ部品を追加し、数行のCコードを書くと、VelxioがWebAssemblyにコンパイルします。
sidebar:
  order: 2
---

**カスタムチップ**は、自分でプログラムするコンポーネントです。`velxio-chip.h` APIに対してプレーンなC言語で記述すると、Velxioがクラウド上でWebAssemblyにコンパイルし、その結果はカタログ上の部品と同じように動作します。配線するピン、編集する属性、シミュレーション内で実行されるロジックを備えています。

## 作成すべきケース

- 必要なICがカタログにない場合（あまり知られていないシフトレジスタ、独自のセンサープロトコルなど）。
- テストフィクスチャが必要な場合 — パルスジェネレータ、プロトコルエクササイザ、スクリプト化された値を持つフェイクセンサーなど。
- デジタルロジックを教えていて、学生にチップを単に使うだけでなく_実装_させたい場合。

## 5分でできる基本手順

1. [コンポーネントピッカー](/docs/ja/circuit-editor/placing-components/)を開き、キャンバスに**Custom Chip**を追加します。
2. チップのエディタを開きます（チップを右クリック）。2つのファイルが表示されます：
   - **Cソース** — 動作を定義するファイル；
   - **`chip.json`** — マニフェスト：名前、ピン、属性。
3. 組み込みの**Inverter**例から始めます：

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

そのマニフェスト：

```json
{
  "schema": "velxio-chip/v1",
  "name": "Inverter",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

4. ダイアログで**Compile**（コンパイル）を実行します — エラーは通常のCコンパイラと同じように返されます。
5. `IN`をボタンに、`OUT`をLEDに配線し、**Run**（実行）を押してトグルしてみてください。

## チップの実行方法

ホストはチップのインスタンスごとに`chip_setup()`を1回呼び出します。その後、チップは**リアクティブ**になります。コードはコールバック内でのみ実行されます — 監視中のピンが変化したとき、I2Cバイトが到着したとき、タイマーが発火したときなどです。ブロックするメインループはないため、カスタムチップを回路のあちこちに配置してもコストを抑えられます。

## 組み込みのサンプルチップ

チップエディタには、読み込んで変更できる動作するソースが用意されています：ロジックゲート（インバータ、XOR）、シフトレジスタ（74HC595、CD4094）、I2C部品（PCF8574、DS3231 RTC、24Cxx EEPROM）、SPI ADC（MCP3008）、UART ROT13トランスフォーマー、パルスカウンタ — そして、冒険心のある方向けの**レトロCPUコレクション**（Intel 4004など）もあります。

次へ：[チップAPIリファレンス](/docs/ja/custom-chips/api/)。
