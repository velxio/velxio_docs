---
title: "Tutorial: temperatura e umidità tramite I2C"
description: Costruisci un sensore I2C con una mappa di registri e due slider dal vivo, e impara dove campionare gli attributi quando il valore viene consegnato da un protocollo anziché da un pin.
sidebar:
  order: 5
---

Una tensione su un pin è il caso semplice. I sensori reali di solito parlano un
protocollo, e questo cambia una cosa: **dove** leggi l'attributo.
Questo tutorial costruisce un sensore di temperatura e umidità all'indirizzo I2C
`0x44` con uno slider per ciascuno.

:::tip[Apri il circuito finito]
[Sensore ambientale I2C (slider dal vivo)](https://velxio.dev/example/i2c-env-sensor-live-sliders),
collegato a un Uno con lo sketch qui sotto. Il chip è anche un modello nella
finestra di dialogo per i nuovi chip.
:::

## L'unica idea che è diversa

Nel [sensore analogico](/docs/it/custom-chips/programmable-sensors/co2-analog/)
un timer rileggeva l'attributo 20 volte al secondo. Qui non c'è alcun timer.
Il master decide quando avviene una lettura, quindi campioni gli attributi
**nel momento in cui il master avvia una transazione di lettura**. Qualsiasi altra
cosa o brucia CPU inutilmente o fornisce un valore obsoleto.

È a questo che serve `on_connect`.

## La mappa dei registri

Tienila semplice. Due registri little-endian a 16 bit con passi di 0,1 unità,
con un puntatore ad auto-incremento:

| Registro | Contenuto |
| --- | --- |
| `0x00` | Temperatura, int16 con segno, unità di 0,1 °C |
| `0x02` | Umidità, uint16 senza segno, unità di 0,1 %UR |

Un master scrive un byte per impostare il puntatore, poi legge; il puntatore
avanza così quattro byte di fila danno entrambi i valori.

## Il manifest

Due attributi, due controlli. Nota `type: "float"` e l'`unit` su ciascun
controllo, che è ciò che viene stampato dopo il numero nel pannello.

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

## Il sorgente

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

Punti che vale la pena copiare:

- **`memset` sulla configurazione.** È una struct semplice; un puntatore obsoleto in uno
  slot di callback che non hai impostato verrà chiamato.
- **Restituisci `true` da `on_connect`** altrimenti il chip NACKa il proprio indirizzo
  e il master non vede nulla sul bus.
- **Latch in lettura, non a ogni byte.** Campionare dentro `on_read` potrebbe
  far cambiare la temperatura a metà di un valore a 16 bit e consegnare al
  master una lettura spezzata.

## Lo sketch

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

Collega `SDA` e `SCL` ai pin I2C della scheda (`A4` e `A5` su un Uno),
più `VCC` e `GND`. Premi **Run** (Esegui), fai clic sul chip e trascina uno
slider: la transazione successiva trasporterà il nuovo valore.

![Due slider dal vivo sul sensore I2C: temperatura in °C e umidità in percentuale](../../../../../assets/docs/custom-chips/i2c-two-sliders.png)

## Quando non funziona

| Cosa vedi | Quasi sempre |
| --- | --- |
| `requestFrom` non restituisce nulla | `on_connect` ha restituito `false`, oppure l'indirizzo nello sketch non corrisponde a `cfg.address` |
| La lettura è bloccata sul valore predefinito | `latch_registers` viene chiamato da `chip_setup` invece che da `on_connect` |
| La temperatura viene letta come un numero positivo enorme | L'int16 è stato allargato come unsigned; mantieni il cast a `int16_t` prima di dividere |
| I valori saltano tra due letture | Il campionamento è stato spostato in `on_read`, quindi le due metà di un valore a 16 bit provengono da posizioni diverse dello slider |
| Niente di niente sul bus | `SDA` e `SCL` sono invertiti, oppure registrati con una modalità diversa da `VX_INPUT` |

## Passi successivi

- Ogni campo, più il fallback automatico:
  [il riferimento a `controls`](/docs/it/custom-chips/programmable-sensors/reference/).
- L'API C completa, inclusi gli slave SPI e UART:
  [riferimento API](/docs/it/custom-chips/api/).
