---
title: チップAPIリファレンス
description: velxio-chip.h API — ピン、属性、I2C、SPI、UART、タイマー、フレームバッファ、ROM。
sidebar:
  order: 6
---

チップが実行できるすべての操作は、**`velxio-chip.h`** で宣言されています。ホストはエクスポートされた `chip_setup()` をインスタンスごとに1回呼び出します。そこでピンとペリフェラルを登録し、コールバックをフックします。以降の実行はすべてそれらのコールバック内で行われます。

## ピン

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

モード: `VX_INPUT`、`VX_OUTPUT`、`VX_INPUT_PULLUP`、`VX_INPUT_PULLDOWN`、`VX_ANALOG`、および `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH`（登録時点で既知のレベルを駆動して起動するため、登録から最初の書き込みまでの間にグリッチが発生しません）。

エッジを監視する場合:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

`VX_EDGE_RISING`、`VX_EDGE_FALLING`、または `VX_EDGE_BOTH` を使用します。

## 属性

ユーザーが編集可能なパラメータです。デフォルト値はパーツインスペクタに表示されます。`chip.json` に `controls` セクションを宣言すると、各属性には**シミュレーション実行中のライブスライダー**が表示されます（[プログラム可能なセンサー](/docs/ja/custom-chips/programmable-sensors/) を参照）:

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

エディタがそれらを表示できるように、`chip.json` にも宣言してください。

## I2Cスレーブ

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

設定には、7ビットの `address`、`scl`/`sda` ピン、および4つのコールバック（`on_connect(addr, is_read)`、`on_read()`（次のバイトを返す）、`on_write(byte)`（ACK/NACK）、`on_stop()`）が含まれます。これでレジスタスタイルのI2Cデバイスを実装するのに十分です。PCF8574 および DS3231 の例を参照してください。

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` は受信バイトごとに呼び出され、`on_tx_done` はバッファが送信されたときに呼び出されます。

## SPIスレーブ

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

チップセレクトがアサートされている間、バッファを交換します。MCP3008 の例は、完全なリクエスト/レスポンスのやり取りを示しています。

## 時間とタイマー

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

タイマーは**シミュレーション時間**で動作するため、チップは周囲のボードとサイクル一貫性を保ちます。

## フレームバッファ

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

ディスプレイであるチップの場合: RGBAピクセルを書き込むと、パーツがキャンバス上にそれらをレンダリングします。

## ROMブロブとロギング

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

ROMを使用すると、チップは `chip_setup()` の前にホストによって注入された外部データ（キャラクタROM、マイクロコード）を保持できます。

## チップの外観

本体は `chip.json` から描画されます。ピンリストがパッドとそのラベルを配置し、オプションの `display: { width, height }` がフレームバッファ領域を確保します。チップは**画像**（ファイルセクションに `chip.png` / `chip.jpg` / `chip.svg` として追加されたPNG、JPEG、またはSVG）も保持でき、ピンを移動せずに本体を覆います。[チップに外観を与える](/docs/ja/custom-chips/getting-started/#giving-the-chip-a-face) を参照してください。

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

`pins` は物理的なフットプリントの順序を定義します。名前はCソースが登録するものと一致する必要があります。オプションのセクション: `attributes`（調整可能な値）、`controls`（シミュレーション中のライブスライダー/ボタン）、`display`（フレームバッファチップ用の `{"width", "height"}`）、および `programTargets`（ユーザープログラムを実行するレトロCPUチップ）。

----- END PAGE -----
