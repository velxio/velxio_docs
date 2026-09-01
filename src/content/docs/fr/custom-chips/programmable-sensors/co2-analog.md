---
title: "Tutoriel : un capteur de CO2 analogique"
description: Construisez une puce personnalisée qui génère une tension à partir d'un curseur ppm en direct, connectez-la à une broche analogique Arduino, et observez analogRead suivre le curseur en temps réel.
sidebar:
  order: 4
---

Le capteur programmable complet le plus court : un curseur de 400 à 5000 ppm,
une tension sur une broche, et un Arduino qui la lit. Dix minutes de bout en
bout, et le modèle que vous copierez pour chaque capteur analogique après celui-ci.

:::tip[Ouvrir le circuit terminé]
Tout ce qui suit, déjà câblé et prêt à fonctionner :
[Capteur CO2 (curseur en direct)](https://velxio.dev/example/co2-sensor-live-slider).
La même puce est également un modèle dans la boîte de dialogue de nouvelle puce, si vous
préférez l'ajouter à votre propre projet.
:::

## Ce que vous construisez

```
   [ Puce Capteur CO2 ]                 [ Arduino Uno ]
        VCC  o------------------------o 5V
        GND  o------------------------o GND
        OUT  o------------------------o A0

   curseur 400..5000 ppm   ->   OUT 0..5 V   ->   analogRead(A0)
```

## Étape 1 : créer la puce

Ajoutez une puce personnalisée depuis l'explorateur de fichiers de l'éditeur. Une boîte de dialogue propose les
modèles intégrés plus **Start from blank** (Démarrer à partir d'un modèle vierge) ; choisissez le modèle vierge pour
suivre ce tutoriel. Dans les deux cas, vous obtenez deux fichiers : le manifeste
(`chip.json`) et le code source (`chip.c`).

## Étape 2 : le manifeste

Trois broches, un attribut, un contrôle. L'`id` du contrôle et le
`name` de l'attribut doivent correspondre ; c'est ce qui les lie.

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

## Étape 3 : le code source

Une minuterie répétitive convertit les ppm en volts et pilote la broche. Notez où
se trouve `vx_attr_read` : **à l'intérieur** du rappel, afin que chaque cycle voie la
position actuelle du curseur.

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

Trois détails importants :

- `VX_ANALOG` sur la broche. Une broche numérique ne peut pas transporter une
  tension intermédiaire, et `vx_pin_dac_write` dessus ne fera pas ce que vous voulez.
- `vx_timer_start` prend des **nanosecondes**. `50000000ULL` correspond à 50 ms. C'est
  l'erreur de frappe la plus courante dans une première puce.
- L'appel nu `on_tick(0)` avant le retour. Sans lui, la broche reste à 0 V
  jusqu'à ce que la première minuterie se déclenche, et un programme rapide lit cela comme un
  400 ppm parasite.

Appuyez sur **Compile** (Compiler).

## Étape 4 : câbler

Déposez la puce sur le canevas à côté d'un Arduino Uno et connectez `VCC` à
`5V`, `GND` à `GND`, et `OUT` à `A0`.

![La puce capteur CO2 câblée à un Arduino Uno : VCC vers 5V, GND vers GND, OUT vers A0](../../../../../assets/docs/custom-chips/sensor-circuit.png)

## Étape 5 : le programme

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

## Étape 6 : exécuter et faire glisser

Appuyez sur **Run** (Exécuter), puis **cliquez sur la puce**. Le panneau du curseur s'ouvre :

![Le panneau en direct de la puce pendant la simulation : un curseur CO2 en ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Faites-le glisser et la sortie série suit dans un délai d'un `delay(500)` :

![Le moniteur série suivant le curseur : les lectures ppm passant de 1000 à 3000](../../../../../assets/docs/custom-chips/sensor-serial-tracking.png)

C'est toute la boucle : le curseur écrit l'attribut, la minuterie le lit
20 fois par seconde, la tension de la broche change, et `analogRead` la voit.

## Quand cela ne fonctionne pas

| Ce que vous voyez | Presque toujours |
| --- | --- |
| Cliquer sur la puce n'ouvre rien | La simulation est arrêtée : le panneau ne s'ouvre que pendant son exécution |
| Le curseur apparaît mais la lecture ne bouge jamais | `vx_attr_read` est appelé dans `chip_setup()` et mis en cache, au lieu d'être à l'intérieur de `on_tick` |
| `analogRead` ne renvoie que 0 ou 1023 | La broche a été enregistrée en mode numérique plutôt qu'en `VX_ANALOG` |
| La valeur se met à jour une fois puis se fige | `vx_timer_start` a été appelé avec `repeat` à false, ou l'intervalle a été écrit en millisecondes, donc le prochain cycle est à 50000 secondes |
| Serial affiche 400 ppm au premier moment | L'appel initial `on_tick(0)` manque |

## Ensuite

- La même idée derrière un protocole numérique :
  [température et humidité via I2C](/docs/fr/custom-chips/programmable-sensors/i2c-env/).
- Chaque champ que vous pouvez mettre dans `controls` :
  [la référence](/docs/fr/custom-chips/programmable-sensors/reference/).
- Gardez-la pour d'autres projets : [Mes puces](/docs/fr/custom-chips/my-chips/).

----- END PAGE -----
