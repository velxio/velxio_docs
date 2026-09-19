---
title: Справочник по API чипов
description: API velxio-chip.h — выводы, атрибуты, I2C, SPI, UART, таймеры, фреймбуфер, ROM.
sidebar:
  order: 6
---

Всё, что умеет чип, объявлено в **`velxio-chip.h`**. Хост вызывает вашу
экспортированную `chip_setup()` один раз на экземпляр; там вы
регистрируете выводы и периферию и подключаете колбэки. Всё дальнейшее
выполнение происходит в этих колбэках.

## Выводы

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // drive analog out
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

Режимы: `VX_INPUT`, `VX_OUTPUT`, `VX_INPUT_PULLUP`, `VX_INPUT_PULLDOWN`,
`VX_ANALOG`, а также `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH`, чтобы сразу
выйти на известный уровень (без глитча между регистрацией и первой
записью).

Отслеживание фронтов:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

с `VX_EDGE_RISING`, `VX_EDGE_FALLING` или `VX_EDGE_BOTH`.

## Атрибуты

Параметры, редактируемые пользователем. Значения по умолчанию задаются в
инспекторе компонента; объявите секцию `controls` в `chip.json`, и каждый
из них получит **живой слайдер во время работы симуляции** (см.
[Программируемые датчики](/docs/ru/custom-chips/programmable-sensors/)):

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // re-read in callbacks — sliders move it live

// String attributes (a device id, an SSID, a preset name):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Объявите их также в `chip.json`, чтобы редактор мог их отрисовать.

## I2C-слейв

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

Конфигурация содержит 7-битный `address`, выводы `scl`/`sda` и четыре
колбэка: `on_connect(addr, is_read)`, `on_read()` (вернуть следующий
байт), `on_write(byte)` (ack/nack), `on_stop()`. Этого достаточно для
реализации любого I2C-устройства регистрового типа — см. примеры PCF8574
и DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` срабатывает на каждый принятый байт; `on_tx_done` — когда
ваш буфер отправлен.

## SPI-слейв

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Обмен буферами, пока активен chip-select — пример MCP3008 показывает
полный цикл запроса/ответа.

## Время и таймеры

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Таймеры работают на **времени симуляции**, поэтому ваш чип остаётся
цикл-согласованным с окружающими платами.

## Фреймбуфер

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

Для чипов, которые _являются_ дисплеями: записывайте RGBA-пиксели, и
компонент отрисует их на холсте.

Размер — тот, что объявлен в `chip.json` под `display: { width, height }`
— именно его возвращает `vx_framebuffer_init`, а записи за его
пределами отбрасываются. Чип, не объявивший `display`, получает буфер
128x64. **Чипу, портированному из Wokwi, нужно добавить этот ключ**: в
`chip.json` от Wokwi нет размера дисплея, поэтому порт ILI9488 480x320
без него рисует в буфер 128x64 и почти ничего не показывает.

Где выполняется чип, здесь ничего не решает. В браузере (AVR, Pico,
браузерные движки ESP32) компонент рисует буфер прямо на своём холсте;
на пути QEMU ESP32 чип выполняется рядом с гостем, и воркер передаёт
затронутые строки обратно компоненту — до 20 кадров в секунду. Оба
варианта отрисовывают не чаще одного раза за кадр анимации, как бы
часто чип ни вызывал `vx_buffer_write`.

## ROM-блобы и логирование

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // appears in the browser console
```

ROM позволяет чипу нести внешние данные (знакогенераторы, микрокод),
внедряемые хостом до `chip_setup()`.

## Лицо чипа

Корпус рисуется из `chip.json`: список выводов размещает площадки и их
подписи, а необязательный `display: { width, height }` резервирует
область фреймбуфера. Чип также может нести **изображение** — PNG, JPEG
или SVG, добавленное в его секцию файлов как `chip.png` / `chip.jpg` /
`chip.svg` — которое покрывает корпус, не сдвигая ни одного вывода. См.
[Как дать чипу лицо](/docs/ru/custom-chips/getting-started/#giving-the-chip-a-face).

## Манифест (`chip.json`)

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

`pins` задаёт порядок физического расположения; имена должны совпадать с
тем, что регистрирует исходник на C. Необязательные секции: `attributes`
(настраиваемые значения), `controls` (живые слайдеры/кнопки во время
симуляции), `display` (`{"width", "height"}` для чипов с фреймбуфером) и
`programTargets` (ретро-CPU-чипы, выполняющие пользовательскую
программу).
