---
title: "Учебник: температура и влажность по I2C"
description: Создайте I2C-датчик с картой регистров и двумя интерактивными ползунками, а также узнайте, где считывать атрибуты, когда значение передается по протоколу, а не через вывод.
sidebar:
  order: 5
---

Напряжение на выводе — это простой случай. Настоящие датчики обычно общаются по
протоколу, и это меняет одну вещь: **где** вы считываете атрибут.
В этом учебнике мы создадим датчик температуры и влажности по адресу I2C
`0x44` с ползунком для каждого значения.

:::tip[Открыть готовую схему]
[I2C датчик окружающей среды (интерактивные ползунки)](https://velxio.dev/example/i2c-env-sensor-live-sliders),
подключенный к Uno со скетчем ниже. Чип также доступен как шаблон в
диалоге создания нового чипа.
:::

## Единственная ключевая идея

В [аналоговом датчике](/docs/ru/custom-chips/programmable-sensors/co2-analog/)
таймер перечитывал атрибут 20 раз в секунду. Здесь таймера нет.
Ведущее устройство решает, когда происходит чтение, поэтому вы считываете атрибуты
**в момент, когда ведущее устройство начинает транзакцию чтения**. Всё остальное
либо впустую расходует ресурсы процессора, либо выдает устаревшее значение.

Именно для этого нужен `on_connect`.

## Карта регистров

Держите её простой. Два 16-битных регистра в little-endian с шагом 0.1 единицы,
с автоматически инкрементируемым указателем:

| Регистр | Содержимое |
| --- | --- |
| `0x00` | Температура, знаковое int16, единицы 0.1 °C |
| `0x02` | Влажность, беззнаковое int16, единицы 0.1 %RH |

Ведущее устройство записывает один байт для установки указателя, затем читает; указатель
автоматически увеличивается, так что четыре байта подряд дают оба значения.

## Манифест

Два атрибута, два элемента управления. Обратите внимание на `type: "float"` и `unit` на каждом
элементе управления, который выводится после числа на панели.

```json title="chip.json"
{
  "schema": "velxio-chip/v1",
  "name": "I2C Env Sensor",
  "description": "Temperature + humidity over I2C (0x44) with live sliders.",
  "pins": ["VCC", "GND", "SDA", "SCL"],
  "attributes": [
    { "name": "temperature", "label": "Temperature", "type": "float",
      "default": 25, "min": -40, "max": 85, "step": 0.5 },
    { "name": "humidity", "label": "Humidity", "type": "float",
      "default": 50, "min": 0, "max": 100, "step": 1 }
  ],
  "controls": [
    { "id": "temperature", "label": "Temperature", "type": "range",
      "min": -40, "max": 85, "step": 0.5, "unit": "C" },
    { "id": "humidity", "label": "Humidity", "type": "range",
      "min": 0, "max": 100, "step": 1, "unit": "%" }
  ]
}
```

## Исходный код

```c title="chip.c"
#include "velxio-chip.h"
#include <string.h>

#define I2C_ADDR 0x44

typedef struct {
  vx_attr temp;      /* degrees C */
  vx_attr humidity;  /* %RH */
  uint8_t reg;       /* register pointer */
  uint8_t regs[4];   /* latched at the start of a read */
} chip_state_t;

static chip_state_t S;

static void latch_registers(void) {
  /* Re-read the attributes NOW: the sliders may have moved. */
  int16_t  t = (int16_t)(vx_attr_read(S.temp) * 10.0);
  uint16_t h = (uint16_t)(vx_attr_read(S.humidity) * 10.0);
  S.regs[0] = (uint8_t)(t & 0xFF);
  S.regs[1] = (uint8_t)((t >> 8) & 0xFF);
  S.regs[2] = (uint8_t)(h & 0xFF);
  S.regs[3] = (uint8_t)((h >> 8) & 0xFF);
}

static bool on_connect(void *ud, uint8_t addr, bool is_read) {
  (void)ud; (void)addr;
  if (is_read) latch_registers();   /* sample here, not on a timer */
  return true;                      /* ACK the address */
}

static uint8_t on_read(void *ud) {
  (void)ud;
  uint8_t v = S.reg < sizeof(S.regs) ? S.regs[S.reg] : 0xFF;
  S.reg++;                          /* auto-increment */
  return v;
}

static bool on_write(void *ud, uint8_t byte) {
  (void)ud;
  S.reg = byte;                     /* a write sets the pointer */
  return true;                      /* ACK the byte */
}

static void on_stop(void *ud) { (void)ud; }

void chip_setup(void) {
  S.temp     = vx_attr_register("temperature", 25);
  S.humidity = vx_attr_register("humidity", 50);

  vx_i2c_config cfg;
  memset(&cfg, 0, sizeof(cfg));   /* zero it: unset callbacks must be NULL */
  cfg.address    = I2C_ADDR;
  cfg.scl        = vx_pin_register("SCL", VX_INPUT);
  cfg.sda        = vx_pin_register("SDA", VX_INPUT);
  cfg.on_connect = on_connect;
  cfg.on_read    = on_read;
  cfg.on_write   = on_write;
  cfg.on_stop    = on_stop;
  vx_i2c_attach(&cfg);
  vx_log("i2c env sensor at 0x44");
}
```

Полезные моменты:

- **Обнулите конфигурацию через `memset`.** Это обычная структура; устаревший указатель в
  слоте обратного вызова, который вы не задали, будет вызван.
- **Возвращайте `true` из `on_connect`**, иначе чип не подтвердит свой собственный адрес
  и ведущее устройство ничего не увидит на шине.
- **Фиксируйте данные при чтении, а не при каждом байте.** Считывание внутри `on_read`
  позволило бы температуре измениться на середине 16-битного значения и передать
  ведущему устройству разорванное чтение.

## Скетч

```cpp title="sketch.ino"
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin();
}

void loop() {
  Wire.beginTransmission(0x44);
  Wire.write(0x00);                 // point at temperature
  Wire.endTransmission();

  Wire.requestFrom(0x44, 4);        // t_lo t_hi h_lo h_hi
  if (Wire.available() >= 4) {
    int16_t t  = Wire.read() | (Wire.read() << 8);
    uint16_t h = Wire.read() | (Wire.read() << 8);
    Serial.print("T="); Serial.print(t / 10.0, 1);
    Serial.print("C  RH="); Serial.print(h / 10.0, 1);
    Serial.println("%");
  }
  delay(500);
}
```

Подключите `SDA` и `SCL` к выводам I2C платы (`A4` и `A5` на Uno),
а также `VCC` и `GND`. Нажмите **Run** (Запуск), щелкните по чипу и перетащите любой
ползунок: следующая транзакция передаст новое значение.

![Два интерактивных ползунка на I2C-датчике: температура в °C и влажность в процентах](../../../../../assets/docs/custom-chips/i2c-two-sliders.png)

## Когда это не работает

| Что вы видите | Почти всегда |
| --- | --- |
| `requestFrom` ничего не возвращает | `on_connect` вернул `false`, или адрес в скетче не совпадает с `cfg.address` |
| Показания застряли на значении по умолчанию | `latch_registers` вызывается из `chip_setup` вместо `on_connect` |
| Температура читается как огромное положительное число | int16 был расширен как беззнаковый; сохраните приведение к `int16_t` перед делением |
| Значения прыгают между двумя показаниями | Считывание перенесено в `on_read`, поэтому две половины 16-битного значения берутся из разных положений ползунка |
| На шине вообще ничего нет | `SDA` и `SCL` перепутаны или зарегистрированы с режимом, отличным от `VX_INPUT` |

## Далее

- Все поля, а также автоматический резервный вариант:
  [справочник по `controls`](/docs/ru/custom-chips/programmable-sensors/reference/).
- Полный C API, включая подчиненные устройства SPI и UART:
  [справочник по API](/docs/ru/custom-chips/api/).
