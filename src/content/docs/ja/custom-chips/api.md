---
title: Chips API リファレンス
description: velxio-chip.h API — ピン、属性、I2C、SPI、UART、タイマー、フレームバッファ、ROM。
sidebar:
  order: 6
---

チップができることのすべては **`velxio-chip.h`** で宣言されています。ホストは
エクスポートされた `chip_setup()` をインスタンスごとに一度呼び出します。
そこでピンとペリフェラルを登録し、コールバックをフックします。以降の実行は
すべてそれらのコールバック内で行われます。

## ピン

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

モード: `VX_INPUT`、`VX_OUTPUT`、`VX_INPUT_PULLUP`、`VX_INPUT_PULLDOWN`、
`VX_ANALOG`、さらに `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH` を使うと、登録時点から
既知のレベルを駆動した状態で立ち上がります（登録と最初の書き込みの間に
グリッチが発生しません）。

エッジを監視するには:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

`VX_EDGE_RISING`、`VX_EDGE_FALLING`、`VX_EDGE_BOTH` のいずれかを指定します。

## 属性

ユーザーが編集可能なパラメータです。デフォルト値はパーツインスペクタに
保存されます。`chip.json` に `controls` セクションを宣言すると、それぞれに
**シミュレーション実行中にライブスライダー**が付きます（
[プログラマブルセンサー](/docs/ja/custom-chips/programmable-sensors/) を参照）:

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

エディタがレンダリングできるよう、これらも `chip.json` に宣言してください。

## I2C スレーブ

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

設定には 7 ビットの `address`、`scl`/`sda` ピン、そして 4 つの
コールバックが含まれます: `on_connect(addr, is_read)`、`on_read()`（次の
バイトを返す）、`on_write(byte)`（ack/nack）、`on_stop()`。これだけで任意の
レジスタ型 I2C デバイスを実装できます — PCF8574 と DS3231 の例を参照して
ください。

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` は受信バイトごとに発火し、`on_tx_done` はバッファが送出された
ときに発火します。

## SPI スレーブ

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

チップセレクトがアサートされている間にバッファを交換します — MCP3008 の例で
リクエスト/レスポンスの一連の流れ全体を示しています。

## 時間とタイマー

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

タイマーは**シミュレーション時間**で動作するため、チップは周囲のボードと
サイクル整合性を保ちます。

## フレームバッファ

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

ディスプレイそのものであるチップ向けです: RGBA ピクセルを書き込むと、パーツが
それをキャンバス上にレンダリングします。

サイズは `chip.json` の `display: { width, height }` で宣言されたものです
— それが `vx_framebuffer_init` の戻り値となり、それを超える書き込みは破棄
されます。`display` を宣言していないチップには 128x64 のバッファが与えられ
ます。**Wokwi から移植したチップにはこのキーを追加する必要があります**:
Wokwi の `chip.json` にはディスプレイサイズがないため、それを欠いた
480x320 の ILI9488 移植版は 128x64 のバッファに描画し、ほとんど何も表示
されません。

チップがどこで動作するかはここでは関係ありません。ブラウザ内（AVR、Pico、
ブラウザ内 ESP32 エンジン）では、パーツがバッファを直接キャンバスに描画
します。QEMU ESP32 の経路では、チップはゲストの隣で動作し、ワーカーが
触れた行をパーツへ最大毎秒 20 フレームでストリーム転送します。どちらの
場合も、チップが `vx_buffer_write` をどれだけ頻繁に呼んでも、アニメーション
フレームごとに最大 1 回だけ描画します。

## ROM ブロブとログ

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

ROM を使うと、チップは外部データ（キャラクタ ROM、マイクロコード）を
`chip_setup()` の前にホストから注入して持ち運べます。

## チップの外観

本体は `chip.json` から描画されます: ピンリストがパッドとそのラベルを配置し、
任意の `display: { width, height }` がフレームバッファ領域を確保します。
チップはさらに**画像** — PNG、JPEG、SVG をファイルセクションに
`chip.png` / `chip.jpg` / `chip.svg` として追加したもの — を持てます。
これはピンを動かすことなく本体を覆います。
[チップに外観を与える](/docs/ja/custom-chips/getting-started/#giving-the-chip-a-face)
を参照してください。

## マニフェスト (`chip.json`)

```json
{
  "schema": "velxio-chip/v1",
  "name": "My Chip",
  "author": "you",
  "description": "What it does",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

`pins` は物理的なフットプリントの順序を定義します。名前は C ソースが登録
するものと一致している必要があります。任意のセクション: `attributes`
（調整可能な値）、`controls`（シミュレーション中のライブスライダー/
ボタン）、`display`（フレームバッファチップ用の `{"width", "height"}`）、
`programTargets`（ユーザープログラムを実行するレトロ CPU チップ）。
