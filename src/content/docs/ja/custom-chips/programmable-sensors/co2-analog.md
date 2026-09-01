---
title: "チュートリアル：アナログCO2センサー"
description: ライブppmスライダーから電圧を出力するカスタムチップを構築し、Arduinoのアナログピンに配線して、analogReadがリアルタイムでスライダーを追跡するのを確認します。
sidebar:
  order: 4
---

最も短い完全なプログラマブルセンサー：400〜5000 ppmのスライダー、ピン上の電圧、そしてそれを読み取るArduino。最初から最後まで10分で完了し、今後すべてのアナログセンサーでコピーする形です。

:::tip[完成した回路を開く]
以下はすべて配線済みで、すぐに実行できます：
[CO2センサー（ライブスライダー）](https://velxio.dev/example/co2-sensor-live-slider)。
同じチップは新規チップダイアログのテンプレートにも含まれているので、自分のプロジェクトにドロップすることもできます。
:::

## 構築するもの

```
   [ CO2センサーチップ ]                 [ Arduino Uno ]
        VCC  o------------------------o 5V
        GND  o------------------------o GND
        OUT  o------------------------o A0

   スライダー 400..5000 ppm   ->   OUT 0..5 V   ->   analogRead(A0)
```

## ステップ1：チップを作成する

エディタのファイルエクスプローラーからカスタムチップを追加します。ダイアログには組み込みテンプレートと**Start from blank**が表示されます。チュートリアルに沿って進めるには、空白のものを選択してください。どちらの場合も、マニフェスト（`chip.json`）とソース（`chip.c`）の2つのファイルが作成されます。

## ステップ2：マニフェスト

3つのピン、1つの属性、1つのコントロール。コントロールの`id`と属性の`name`は一致している必要があります。それがそれらを結び付けます。

```json title="chip.json"
{
  "schema": "velxio-chip/v1",
  "name": "CO2 Sensor",
  "description": "Analog CO2 sensor with a live ppm slider. OUT maps 400-5000 ppm to 0-5 V.",
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

## ステップ3：ソース

繰り返しタイマーがppmをボルトに変換してピンを駆動します。`vx_attr_read`が**コールバック内**にあることに注目してください。これにより、毎回のティックでスライダーの現在位置を確認できます。

```c title="chip.c"
#include "velxio-chip.h"

#define PPM_MIN   400.0
#define PPM_MAX  5000.0
#define VOLTS_MAX   5.0

typedef struct {
  vx_pin   out;
  vx_attr  ppm;
  vx_timer timer;
} chip_state_t;

static chip_state_t S;

static void on_tick(void *user_data) {
  (void)user_data;
  double ppm = vx_attr_read(S.ppm);          /* ライブスライダー値 */
  if (ppm < PPM_MIN) ppm = PPM_MIN;
  if (ppm > PPM_MAX) ppm = PPM_MAX;
  double volts = (ppm - PPM_MIN) / (PPM_MAX - PPM_MIN) * VOLTS_MAX;
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out   = vx_pin_register("OUT", VX_ANALOG);
  S.ppm   = vx_attr_register("ppm", 1000);
  S.timer = vx_timer_create(on_tick, 0);
  vx_timer_start(S.timer, 50000000ULL, true);  /* 50 ms、ナノ秒単位 */
  on_tick(0);                                  /* 初期レベルを駆動 */
  vx_log("co2 sensor ready");
}
```

重要な3つの詳細：

- ピン上の`VX_ANALOG`。デジタルピンは中間電圧を伝送できず、`vx_pin_dac_write`を実行しても意図した動作になりません。
- `vx_timer_start`は**ナノ秒**を受け取ります。`50000000ULL`は50 msです。これは最初のチップで最も一般的なタイプミスです。
- 戻る前の裸の`on_tick(0)`。これがないと、最初のタイマーが発火するまでピンは0 Vのままで、高速なスケッチはそれを誤った400 ppmとして読み取ります。

**Compile**を押します。

## ステップ4：配線する

Arduino Unoの隣のキャンバスにチップをドロップし、`VCC`を`5V`に、`GND`を`GND`に、`OUT`を`A0`に接続します。

![Arduino Unoに配線されたCO2センサーチップ：VCCから5V、GNDからGND、OUTからA0](../../../../../assets/docs/custom-chips/sensor-circuit.png)

## ステップ5：スケッチ

```cpp title="sketch.ino"
void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(A0);
  float volts = raw * (5.0f / 1023.0f);
  float ppm = 400.0f + volts / 5.0f * 4600.0f;
  Serial.print("raw="); Serial.print(raw);
  Serial.print("  ppm="); Serial.println(ppm, 0);
  delay(500);
}
```

## ステップ6：実行してドラッグする

**Run**を押し、**チップをクリック**します。スライダーパネルが開きます：

![シミュレーション実行中のチップのライブパネル：ppm単位のCO2スライダー](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

ドラッグすると、シリアル出力が1つの`delay(500)`以内で追従します：

![スライダーを追跡するシリアルモニター：ppm読み取り値が1000から3000にジャンプ](../../../../../assets/docs/custom-chips/sensor-serial-tracking.png)

これが全体のループです：スライダーが属性を書き込み、タイマーが毎秒20回それを読み取り、ピン電圧が変化し、`analogRead`がそれを確認します。

## うまくいかない場合

| 表示される内容 | ほぼ確実な原因 |
| --- | --- |
| チップをクリックしても何も開かない | シミュレーションが停止している：パネルは実行中のみ開きます |
| スライダーは表示されるが読み取り値が動かない | `vx_attr_read`が`chip_setup()`内で呼び出されてキャッシュされ、`on_tick`内で呼び出されていない |
| `analogRead`が0または1023のみを返す | ピンが`VX_ANALOG`ではなくデジタルモードとして登録されている |
| 値が一度更新されてフリーズする | `vx_timer_start`が`repeat` falseで呼び出されたか、間隔がミリ秒で記述されたため次のティックが50000秒後になっている |
| シリアルが最初の瞬間に400 ppmを表示する | 初期の`on_tick(0)`呼び出しが欠落している |

## 次へ

- デジタルプロトコルの背後にある同じアイデア：
  [I2C経由の温度と湿度](/docs/ja/custom-chips/programmable-sensors/i2c-env/)。
- `controls`に入れられるすべてのフィールド：
  [リファレンス](/docs/ja/custom-chips/programmable-sensors/reference/)。
- 他のプロジェクト用に保存：[My Chips](/docs/ja/custom-chips/my-chips/)。
