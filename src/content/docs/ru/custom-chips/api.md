---
title: Справочник по API чипов
description: API velxio-chip.h — контакты, атрибуты, I2C, SPI, UART, таймеры, фреймбуфер, ПЗУ.
sidebar:
  order: 3
---

Все возможности чипа объявляются в **`velxio-chip.h`**. Хост
вызывает вашу экспортируемую функцию `chip_setup()` один раз на экземпляр;
в ней вы регистрируете контакты и периферию и подключаете обработчики
событий. Все дальнейшее выполнение происходит в этих обработчиках.

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
уровня сигнала (без помех между регистрацией и первой записью).

Отслеживание фронтов:

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

с `VX_EDGE_RISING`, `VX_EDGE_FALLING` или `VX_EDGE_BOTH`.

## Атрибуты

Параметры, редактируемые пользователем, которые отображаются на панели
свойств компонента:

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);
```

Объявите их также в `chip.json`, чтобы редактор мог их отображать.

## I2C (ведомый)

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

Конфигурация содержит 7-битный `address`, контакты `scl`/`sda` и четыре
обработчика: `on_connect(addr, is_read)`, `on_read()` (возвращает
следующий байт), `on_write(byte)` (подтверждение/отказ), `on_stop()`.
Этого достаточно для реализации любого I2C-устройства с регистрами —
см. примеры PCF8574 и DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` срабатывает на каждый принятый байт; `on_tx_done` — когда
ваш буфер отправлен.

## SPI (ведомый)

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Обмен буферами происходит, пока активен выбор чипа — пример MCP3008
показывает полный цикл запроса/ответа.

## Время и таймеры

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Таймеры работают в **времени симуляции**, поэтому ваш чип остается
такт-синхронизированным с платами вокруг него.

## Фреймбуфер

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
```

Для чипов, которые _являются_ дисплеями: записывайте RGBA-пиксели,
и компонент отображает их на холсте.

## ПЗУ и журналирование

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // появляется в консоли браузера
```

ПЗУ позволяет чипу нести внешние данные (знакогенераторы, микрокод),
внедряемые хостом до вызова `chip_setup()`.

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

`pins` определяет физический порядок выводов; имена должны совпадать
с тем, что регистрирует исходный код на C.

```

```
