---
title: "Tutoriel : température et humidité via I2C"
description: Construisez un capteur I2C avec une table de registres et deux curseurs en direct, et apprenez où échantillonner les attributs lorsque la valeur est délivrée par un protocole plutôt que par une broche.
sidebar:
  order: 5
---

Une tension sur une broche est le cas simple. Les vrais capteurs parlent généralement un protocole, et cela change une chose : **où** vous lisez l'attribut. Ce tutoriel construit un capteur de température et d'humidité à l'adresse I2C `0x44` avec un curseur pour chacun.

:::tip[Ouvrir le circuit terminé]
[Capteur d'environnement I2C (curseurs en direct)](https://velxio.dev/example/i2c-env-sensor-live-sliders),
câblé à un Uno avec le sketch ci-dessous. La puce est également un modèle dans la boîte de dialogue de nouvelle puce.
:::

## L'idée clé qui change tout

Dans le [capteur analogique](/docs/fr/custom-chips/programmable-sensors/co2-analog/), une minuterie relisait l'attribut 20 fois par seconde. Ici, il n'y a pas de minuterie. Le maître décide quand une lecture se produit, donc vous échantillonnez les attributs **au moment où le maître démarre une transaction de lecture**. Toute autre approche soit gaspille du CPU pour rien, soit fournit une valeur obsolète.

C'est à cela que sert `on_connect`.

## La table de registres

Restez simple. Deux registres 16 bits en little-endian avec des pas de 0,1 unité, et un pointeur à incrémentation automatique :

| Registre | Contenu |
| --- | --- |
| `0x00` | Température, int16 signé, unités de 0,1 °C |
| `0x02` | Humidité, uint16 non signé, unités de 0,1 %HR |

Un maître écrit un octet pour définir le pointeur, puis lit ; le pointeur avance, donc quatre octets consécutifs donnent les deux valeurs.

## Le manifeste

Deux attributs, deux contrôles. Notez `type: "float"` et le `unit` sur chaque contrôle, qui est ce qui est affiché après le nombre dans le panneau.

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

## Le code source

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

Points à retenir :

- **`memset` la configuration.** C'est une simple structure ; un pointeur obsolète dans un emplacement de rappel que vous n'avez pas défini sera appelé.
- **Retournez `true` depuis `on_connect`** sinon la puce NACK sa propre adresse et le maître ne voit rien sur le bus.
- **Verrouillez à la lecture, pas à chaque octet.** Échantillonner dans `on_read` permettrait à la température de changer au milieu d'une valeur 16 bits et de fournir au maître une lecture déchirée.

## Le sketch

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

Connectez `SDA` et `SCL` aux broches I2C de la carte (`A4` et `A5` sur un Uno), plus `VCC` et `GND`. Appuyez sur **Run** (Exécuter), cliquez sur la puce, et faites glisser l'un des curseurs : la transaction suivante transporte la nouvelle valeur.

![Deux curseurs en direct sur le capteur I2C : température en °C et humidité en pourcentage](../../../../../assets/docs/custom-chips/i2c-two-sliders.png)

## Quand cela ne fonctionne pas

| Ce que vous voyez | Presque toujours |
| --- | --- |
| `requestFrom` ne retourne rien | `on_connect` a retourné `false`, ou l'adresse dans le sketch ne correspond pas à `cfg.address` |
| La lecture est bloquée à la valeur par défaut | `latch_registers` est appelé depuis `chip_setup` au lieu de `on_connect` |
| La température se lit comme un énorme nombre positif | L'int16 a été élargi en non signé ; conservez le cast `int16_t` avant de diviser |
| Les valeurs sautent entre deux lectures | L'échantillonnage a été déplacé dans `on_read`, donc les deux moitiés d'une valeur 16 bits proviennent de positions de curseur différentes |
| Rien du tout sur le bus | `SDA` et `SCL` sont inversés, ou enregistrés avec un mode autre que `VX_INPUT` |

## Suite

- Chaque champ, plus le repli automatique :
  [la référence `controls`](/docs/fr/custom-chips/programmable-sensors/reference/).
- L'API C complète, y compris les esclaves SPI et UART :
  [Référence API](/docs/fr/custom-chips/api/).
