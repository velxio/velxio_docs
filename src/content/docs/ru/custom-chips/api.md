---
title: Справочник по API чипов
description: API velxio-chip.h — контакты, атрибуты, I2C, SPI, UART, таймеры, фреймбуфер, ПЗУ.
sidebar:
  order: 6
---

Все возможности чипа объявлены в **`velxio-chip.h`**. Хост
вызывает вашу экспортируемую функцию `chip_setup()` один раз для каждого экземпляра; в ней вы
регистрируете контакты и периферию и подключаете обратные вызовы. Все дальнейшее выполнение
происходит в этих обратных вызовах.

## Контакты

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // вольты
void   vx_pin_dac_write(vx_pin p, double voltage); // аналоговый выход
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

Режимы: `VX_INPUT`, `VX_OUTPUT`, `VX_INPUT_PULLUP`, `VX_INPUT_PULLDOWN`,
`VX_ANALOG`, а также `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH` для начального
управления известным уровнем (без помех между регистрацией и первой
записью).

Следите за фронтами:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

с `VX_EDGE_RISING`, `VX_EDGE_FALLING` или `VX_EDGE_BOTH`.

## Атрибуты

Параметры, редактируемые пользователем. Значения по умолчанию находятся в инспекторе компонентов; объявите
секцию `controls` в `chip.json`, и каждый параметр получит **живой слайдер
во время симуляции** (см.
[Программируемые датчики](/docs/ru/custom-chips/programmable-sensors/)):

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // повторное чтение в обратных вызовах — слайдеры меняют его в реальном времени

// Строковые атрибуты (идентификатор устройства, SSID, имя пресета):
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Объявите их также в `chip.json`, чтобы редактор мог их отображать.

## I2C (ведомый)

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

Конфигурация содержит 7-битный `address`, контакты `scl`/`sda` и четыре
обратных вызова: `on_connect(addr, is_read)`, `on_read()` (возвращает следующий
байт), `on_write(byte)` (подтверждение/отказ), `on_stop()`. Этого достаточно для реализации любого
регистрового I2C-устройства — см. примеры PCF8574 и DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` срабатывает для каждого принятого байта; `on_tx_done` — когда ваш буфер
отправлен.

## SPI (ведомый)

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Обмен буферами, пока активен выбор чипа — пример MCP3008
показывает полный цикл запроса/ответа.

## Время и таймеры

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Таймеры работают по **времени симуляции**, поэтому ваш чип остается
цикл-совместимым с платами вокруг него.

## Фреймбуфер

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

Для чипов, которые _являются_ дисплеями: записывайте RGBA-пиксели, и компонент
отображает их на холсте.

## ПЗУ и журналирование

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // появляется в консоли браузера
```

ПЗУ позволяет чипу нести внешние данные (символьные ПЗУ, микрокод), внедряемые
хостом до `chip_setup()`.

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

`pins` определяет физический порядок выводов; имена должны совпадать с тем, что
регистрирует исходный код на C. Необязательные секции: `attributes` (настраиваемые значения),
`controls` (живые слайдеры/кнопки во время симуляции), `display`
(`{"width", "height"}` для чипов с фреймбуфером) и `programTargets`
(ретро-ЦП чипы, выполняющие пользовательскую программу).
