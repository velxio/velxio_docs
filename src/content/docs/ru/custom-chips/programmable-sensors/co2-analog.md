---
title: "Учебник: аналоговый датчик CO2"
description: Создайте пользовательский чип, который выводит напряжение с живого ползунка ppm, подключите его к аналоговому выводу Arduino и наблюдайте, как analogRead отслеживает ползунок в реальном времени.
sidebar:
  order: 4
---

Самый короткий полный программируемый датчик: ползунок от 400 до 5000 ppm,
напряжение на выводе и Arduino, считывающее его. Десять минут от начала
до конца, и эта форма, которую вы будете копировать для каждого аналогового датчика после этого.

:::tip[Откройте готовую схему]
Всё ниже уже подключено и готово к запуску:
[Датчик CO2 (живой ползунок)](https://velxio.dev/example/co2-sensor-live-slider).
Этот же чип также доступен как шаблон в диалоге создания нового чипа, если вы
предпочитаете добавить его в свой собственный проект.
:::

## Что вы создаёте

```
   [ Чип датчика CO2 ]                 [ Arduino Uno ]
        VCC  o------------------------o 5V
        GND  o------------------------o GND
        OUT  o------------------------o A0

   ползунок 400..5000 ppm   ->   OUT 0..5 В   ->   analogRead(A0)
```

## Шаг 1: создайте чип

Добавьте пользовательский чип из файлового проводника редактора. Диалог предлагает
встроенные шаблоны плюс **Start from blank** (Начать с пустого); выберите пустой, чтобы
следовать инструкциям. В любом случае вы получите два файла: манифест
(`chip.json`) и исходный код (`chip.c`).

## Шаг 2: манифест

Три вывода, один атрибут, один элемент управления. `id` элемента управления и
`name` атрибута должны совпадать; именно это связывает их.

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

## Шаг 3: исходный код

Повторяющийся таймер преобразует ppm в вольты и управляет выводом. Обратите внимание,
где находится `vx_attr_read`: **внутри** обратного вызова, поэтому каждый тик видит
текущее положение ползунка.

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
  double ppm = vx_attr_read(S.ppm);          /* live slider value */
  if (ppm < PPM_MIN) ppm = PPM_MIN;
  if (ppm > PPM_MAX) ppm = PPM_MAX;
  double volts = (ppm - PPM_MIN) / (PPM_MAX - PPM_MIN) * VOLTS_MAX;
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out   = vx_pin_register("OUT", VX_ANALOG);
  S.ppm   = vx_attr_register("ppm", 1000);
  S.timer = vx_timer_create(on_tick, 0);
  vx_timer_start(S.timer, 50000000ULL, true);  /* 50 ms, in nanoseconds */
  on_tick(0);                                  /* drive the initial level */
  vx_log("co2 sensor ready");
}
```

Три важных детали:

- `VX_ANALOG` на выводе. Цифровой вывод не может передавать промежуточное
  напряжение, и `vx_pin_dac_write` на нём не сделает то, что вы хотите.
- `vx_timer_start` принимает **наносекунды**. `50000000ULL` — это 50 мс. Это
  самая распространённая опечатка в первом чипе.
- Голый вызов `on_tick(0)` перед возвратом. Без него вывод остаётся на 0 В
  до первого срабатывания таймера, и быстрый скетч прочитает это как ложные
  400 ppm.

Нажмите **Compile** (Компилировать).

## Шаг 4: подключение

Поместите чип на холст рядом с Arduino Uno и подключите `VCC` к
`5V`, `GND` к `GND` и `OUT` к `A0`.

![Чип датчика CO2, подключённый к Arduino Uno: VCC к 5V, GND к GND, OUT к A0](../../../../../assets/docs/custom-chips/sensor-circuit.png)

## Шаг 5: скетч

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

## Шаг 6: запустите и перетаскивайте

Нажмите **Run** (Запустить), затем **щелкните по чипу**. Откроется панель ползунка:

![Живая панель чипа во время симуляции: ползунок CO2 в ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Перетащите его, и последовательный вывод обновится в течение одного `delay(500)`:

![Монитор последовательного порта отслеживает ползунок: показания ppm прыгают с 1000 до 3000](../../../../../assets/docs/custom-chips/sensor-serial-tracking.png)

Это весь цикл: ползунок записывает атрибут, таймер читает его
20 раз в секунду, напряжение на выводе меняется, и `analogRead` видит это.

## Когда это не работает

| Что вы видите | Почти всегда |
| --- | --- |
| Щелчок по чипу ничего не открывает | Симуляция остановлена: панель открывается только во время её работы |
| Ползунок появляется, но показания не меняются | `vx_attr_read` вызывается в `chip_setup()` и кэшируется, вместо вызова внутри `on_tick` |
| `analogRead` возвращает только 0 или 1023 | Вывод зарегистрирован в цифровом режиме, а не как `VX_ANALOG` |
| Значение обновляется один раз и замирает | `vx_timer_start` вызван с `repeat` false, или интервал записан в миллисекундах, поэтому следующий тик наступит через 50000 секунд |
| Последовательный порт показывает 400 ppm в первый момент | Отсутствует начальный вызов `on_tick(0)` |

## Далее

- Та же идея для цифрового протокола:
  [температура и влажность по I2C](/docs/ru/custom-chips/programmable-sensors/i2c-env/).
- Каждое поле, которое можно указать в `controls`:
  [справочник](/docs/ru/custom-chips/programmable-sensors/reference/).
- Сохраните его для других проектов: [Мои чипы](/docs/ru/custom-chips/my-chips/).

----- END PAGE -----
