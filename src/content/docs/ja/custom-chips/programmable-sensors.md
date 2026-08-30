---
title: ライブスライダー付きプログラマブルセンサー
description: シミュレーション実行中にスライダーで値を変更できるセンサーを、chip.jsonのコントロールセクションを使って構築します。
sidebar:
  order: 3
---

カスタムチップは**プログラマブルセンサー**にできます。これは、シミュレーション実行中にスライダーで出力を操作する部品です。しきい値をテストするためにppm値をスイープするCO2センサー、I2Cの背後にある温度/湿度プローブ、光センサー、独自の意思を持つポテンショメータなど、「値が変わったらどうなるか？」が重要となるあらゆるものに使えます。

## レシピ

すでに書き方を知っているチップに、3つの要素を追加します：

1. **属性（Attribute）** — 調整可能な値：`vx_attr_register("ppm", 1000)`。
2. **`chip.json`の`controls`セクション** — これにより、シミュレーション中にスライダーが画面に表示されます：

```json
{
  "name": "CO2 Sensor",
  "pins": ["VCC", "GND", "OUT"],
  "attributes": [
    { "name": "ppm", "label": "CO2 (ppm)", "type": "int",
      "default": 1000, "min": 400, "max": 5000, "step": 10 }
  ],
  "controls": [
    { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
      "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
  ]
}
```

3. **コールバックまたはタイマー内で属性を再読み取りする** — キャッシュしないでください。スライダーは実行中に値を変更します：

```c
#include "velxio-chip.h"

typedef struct { vx_pin out; vx_attr ppm; vx_timer t; } chip_state_t;
static chip_state_t S;

static void on_tick(void *ud) {
  double ppm = vx_attr_read(S.ppm);              /* live slider value */
  double volts = (ppm - 400.0) / 4600.0 * 5.0;   /* 400..5000 -> 0..5 V */
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out = vx_pin_register("OUT", VX_ANALOG);
  S.ppm = vx_attr_register("ppm", 1000);
  S.t = vx_timer_create(on_tick, 0);
  vx_timer_start(S.t, 50000000ULL, true);        /* 50 ms, nanoseconds */
  on_tick(0);
}
```

`OUT`をボードのアナログピン（たとえばArduinoの`A0`）に配線し、**Run**（実行）を押して、チップをクリックします。スライダーパネルが開きます。スライダーをドラッグすると、`analogRead(A0)`がリアルタイムで追従します。

## 各部分の連携

- 各`controls`エントリは、**同じidを持つ属性**を駆動します — `vx_attr_read`は、スライダーが動いた瞬間に新しい値を返します。
- `type: "range"`はスライダーです。`type: "button"`は、トリガー/リセット入力用に瞬間的な`1 → 0`パルス（約150ms）を送信します。
- `controls`セクションがない場合、`min`と`max`の両方を宣言する属性は自動的にライブスライダーを取得します。ほとんどの既存チップは、マニフェストを変更せずに調整可能です。
- `unit`（値の後に表示）と`scale: "log"`は、スライダーのオプションの追加機能です。
- 設計時のデフォルト値は、部品インスペクタ（停止中にチップを右クリック）にあります。

## 既製テンプレート

サンプルギャラリーには、この方法で正確に構築された2つのセンサーが含まれています：

- **CO2 Sensor (live slider)** — 上記のアナログレシピをそのまま使用。
- **I2C Env Sensor (live sliders)** — `0x44`のI2Cレジスタマップの背後にある温度+湿度。両方ともスライダーで駆動されます。デジタルプロトコルセンサーのパターンです。

独自のバリアントを[My Chips](/docs/ja/custom-chips/my-chips/)に保存すると、すべてのプロジェクトでワンクリックで利用できます。
