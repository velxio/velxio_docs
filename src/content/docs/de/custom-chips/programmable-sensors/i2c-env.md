---
title: "Tutorial: Temperatur und Luftfeuchtigkeit über I2C"
description: Bauen Sie einen I2C-Sensor mit einer Registerkarte und zwei Live-Schiebereglern auf und lernen Sie, wo Sie Attribute abtasten, wenn der Wert über ein Protokoll und nicht über einen Pin geliefert wird.
sidebar:
  order: 5
---

Eine Spannung an einem Pin ist der einfache Fall. Echte Sensoren sprechen normalerweise ein
Protokoll, und das ändert eine Sache: **wo** Sie das Attribut lesen.
Dieses Tutorial baut einen Temperatur- und Luftfeuchtigkeitssensor an der I2C-Adresse
`0x44` mit einem Schieberegler für jeden Wert auf.

:::tip[Geöffnete Schaltung ansehen]
[I2C-Umgebungssensor (Live-Schieberegler)](https://velxio.dev/example/i2c-env-sensor-live-sliders),
verbunden mit einem Uno und dem untenstehenden Sketch. Der Chip ist auch eine Vorlage im
Dialog für neue Chips.
:::

## Die eine Idee, die anders ist

Beim [analogen Sensor](/docs/de/custom-chips/programmable-sensors/co2-analog/)
hat ein Timer das Attribut 20 Mal pro Sekunde neu gelesen. Hier gibt es keinen Timer.
Der Master entscheidet, wann eine Messung stattfindet, also tasten Sie die Attribute
**in dem Moment ab, in dem der Master eine Lese-Transaktion startet**. Alles andere
verbrennt entweder CPU-Zeit für nichts oder gibt einen veralteten Wert aus.

Dafür ist `on_connect` da.

## Die Registerkarte

Halten Sie es einfach. Zwei 16-Bit-Little-Endian-Register in 0,1-Einheiten-Schritten,
mit einem automatisch inkrementierenden Zeiger:

| Register | Inhalt |
| --- | --- |
| `0x00` | Temperatur, vorzeichenbehaftetes int16, Einheiten von 0,1 °C |
| `0x02` | Luftfeuchtigkeit, vorzeichenloses int16, Einheiten von 0,1 %rF |

Ein Master schreibt ein Byte, um den Zeiger zu setzen, und liest dann; der Zeiger
erhöht sich, sodass vier Bytes in Folge Ihnen beide Werte geben.

## Das Manifest

Zwei Attribute, zwei Bedienelemente. Beachten Sie `type: "float"` und die `unit` an jedem
Bedienelement, die nach der Zahl im Panel ausgegeben wird.

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

## Der Quellcode

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

Punkte, die es wert sind, übernommen zu werden:

- **`memset` für die Konfiguration.** Es ist eine einfache Struktur; ein veralteter Zeiger in einem
  Callback-Slot, den Sie nicht gesetzt haben, wird aufgerufen.
- **Geben Sie `true` von `on_connect` zurück**, sonst bestätigt der Chip seine eigene Adresse nicht
  und der Master sieht nichts auf dem Bus.
- **Zwischenspeichern beim Lesen, nicht bei jedem Byte.** Das Abtasten innerhalb von `on_read` würde
  es ermöglichen, dass sich die Temperatur mitten in einem 16-Bit-Wert ändert und der Master
  einen zerrissenen Wert erhält.

## Der Sketch

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

Verbinden Sie `SDA` und `SCL` mit den I2C-Pins des Boards (`A4` und `A5` bei einem Uno),
plus `VCC` und `GND`. Drücken Sie **Run** (Ausführen), klicken Sie auf den Chip und ziehen Sie einen der
Schieberegler: Die nächste Transaktion überträgt den neuen Wert.

![Zwei Live-Schieberegler am I2C-Sensor: Temperatur in °C und Luftfeuchtigkeit in Prozent](../../../../../assets/docs/custom-chips/i2c-two-sliders.png)

## Wenn es nicht funktioniert

| Was Sie sehen | Fast immer |
| --- | --- |
| `requestFrom` gibt nichts zurück | `on_connect` hat `false` zurückgegeben, oder die Adresse im Sketch stimmt nicht mit `cfg.address` überein |
| Der Messwert bleibt beim Standardwert | `latch_registers` wird von `chip_setup` statt von `on_connect` aufgerufen |
| Die Temperatur wird als riesige positive Zahl gelesen | Das int16 wurde als vorzeichenlos erweitert; behalten Sie den `int16_t`-Cast vor dem Dividieren bei |
| Werte springen zwischen zwei Messungen | Die Abtastung wurde in `on_read` verschoben, sodass die beiden Hälften eines 16-Bit-Werts von verschiedenen Schiebereglerpositionen stammen |
| Gar nichts auf dem Bus | `SDA` und `SCL` sind vertauscht oder mit einem anderen Modus als `VX_INPUT` registriert |

## Weiter

- Jedes Feld, plus den automatischen Fallback:
  [die `controls`-Referenz](/docs/de/custom-chips/programmable-sensors/reference/).
- Die vollständige C-API, einschließlich SPI- und UART-Slaves:
  [API-Referenz](/docs/de/custom-chips/api/).
