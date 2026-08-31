---
title: "Tutorial: temperature and humidity over I2C"
description: Build an I2C sensor with a register map and two live sliders, and learn where to sample attributes when the value is delivered by a protocol rather than a pin.
sidebar:
  order: 5
---

A voltage on a pin is the easy case. Real sensors usually speak a
protocol, and that changes one thing: **where** you read the attribute.
This tutorial builds a temperature and humidity sensor at I2C address
`0x44` with a slider for each.

:::tip[Open the finished circuit]
[I2C Env Sensor (live sliders)](https://velxio.dev/example/i2c-env-sensor-live-sliders),
wired to an Uno with the sketch below. The chip is also a template in the
new-chip dialog.
:::

## The one idea that is different

In the [analog sensor](/docs/custom-chips/programmable-sensors/co2-analog/)
a timer re-read the attribute 20 times a second. Here there is no timer.
The master decides when a reading happens, so you sample the attributes
**at the moment the master starts a read transaction**. Anything else
either burns CPU for nothing or hands out a stale value.

That is what `on_connect` is for.

## The register map

Keep it boring. Two 16-bit little-endian registers in 0.1-unit steps,
with an auto-incrementing pointer:

| Register | Contents |
| --- | --- |
| `0x00` | Temperature, signed int16, units of 0.1 C |
| `0x02` | Humidity, unsigned int16, units of 0.1 %RH |

A master writes one byte to set the pointer, then reads; the pointer
advances so four bytes in a row give you both values.

## The manifest

Two attributes, two controls. Note `type: "float"` and the `unit` on each
control, which is what gets printed after the number in the panel.

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

## The source

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

Points worth copying:

- **`memset` the config.** It is a plain struct; a stale pointer in a
  callback slot you did not set will be called.
- **Return `true` from `on_connect`** or the chip NACKs its own address
  and the master sees nothing on the bus.
- **Latch on read, not on every byte.** Sampling inside `on_read` would
  let temperature change halfway through a 16-bit value and hand the
  master a torn reading.

## The sketch

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

Wire `SDA` and `SCL` to the board's I2C pins (`A4` and `A5` on an Uno),
plus `VCC` and `GND`. Press **Run**, click the chip, and drag either
slider: the next transaction carries the new value.

## When it does not work

| What you see | Almost always |
| --- | --- |
| `requestFrom` returns nothing | `on_connect` returned `false`, or the address in the sketch does not match `cfg.address` |
| The reading is stuck at the default | `latch_registers` is being called from `chip_setup` instead of `on_connect` |
| Temperature reads as a huge positive number | The int16 was widened as unsigned; keep the `int16_t` cast before dividing |
| Values jump between two readings | Sampling moved into `on_read`, so the two halves of a 16-bit value come from different slider positions |
| Nothing at all on the bus | `SDA` and `SCL` are swapped, or registered with a mode other than `VX_INPUT` |

## Next

- Every field, plus the automatic fallback:
  [the `controls` reference](/docs/custom-chips/programmable-sensors/reference/).
- The full C API, including SPI and UART slaves:
  [API reference](/docs/custom-chips/api/).
