---
title: Capteurs programmables avec curseurs en direct
description: Créez un capteur dont vous modifiez la valeur avec un curseur pendant que la simulation s'exécute, en utilisant la section controls de chip.json.
sidebar:
  order: 3
---

Une puce personnalisée peut être un **capteur programmable** : un composant dont vous pilotez la sortie depuis un curseur *pendant que la simulation s'exécute*. Pensez à un capteur de CO2 dont vous faites varier le ppm pour tester des seuils, une sonde température/humidité derrière I2C, un capteur de lumière, un potentiomètre avec sa propre volonté — tout ce qui répond à la question « et si la valeur changeait ? ».

## La recette

Trois ingrédients, tous dans la puce que vous savez déjà écrire :

1. **Un attribut** — la valeur ajustable : `vx_attr_register("ppm", 1000)`.
2. **Une section `controls`** dans `chip.json` — c'est ce qui affiche le curseur à l'écran pendant la simulation :

```json
{
  "name": "CO2 Sensor",
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

3. **Relisez l'attribut dans un callback ou une minuterie** — ne le mettez jamais en cache, le curseur le modifie en cours d'exécution :

```c
#include "velxio-chip.h"

typedef struct { vx_pin out; vx_attr ppm; vx_timer t; } chip_state_t;
static chip_state_t S;

static void on_tick(void *ud) {
  double ppm = vx_attr_read(S.ppm);              /* live slider value */
  double volts = (ppm - 400.0) / 4600.0 * 5.0;   /* 400..5000 -> 0..5 V */
  vx_pin_dac_write(S.out, volts);
}

void chip_setup(void) {
  S.out = vx_pin_register("OUT", VX_ANALOG);
  S.ppm = vx_attr_register("ppm", 1000);
  S.t = vx_timer_create(on_tick, 0);
  vx_timer_start(S.t, 50000000ULL, true);        /* 50 ms, nanoseconds */
  on_tick(0);
}
```

Connectez `OUT` à une broche analogique de la carte (par exemple Arduino `A0`), appuyez sur **Run** (Exécuter), puis cliquez sur la puce : le panneau de curseurs s'ouvre. Faites glisser le curseur et `analogRead(A0)` suit en temps réel.

## Comment les pièces se connectent

- Chaque entrée `controls` pilote **l'attribut avec le même id** — `vx_attr_read` renvoie la nouvelle valeur dès que le curseur bouge.
- `type: "range"` est un curseur ; `type: "button"` envoie une impulsion momentanée `1 → 0` (environ 150 ms), pour les entrées de déclenchement/réinitialisation.
- Pas de section `controls` ? Tout attribut qui déclare à la fois `min` et `max` reçoit automatiquement un curseur en direct — la plupart des puces existantes sont ajustables sans toucher à leur manifeste.
- `unit` (affiché après la valeur) et `scale: "log"` sont des options supplémentaires pour les curseurs.
- Les valeurs par défaut de conception se trouvent dans l'inspecteur de composants (clic droit sur la puce à l'arrêt).

## Modèles prêts à l'emploi

La galerie d'exemples fournit deux capteurs construits exactement de cette façon :

- **CO2 Sensor (live slider)** — la recette analogique ci-dessus, textuellement.
- **I2C Env Sensor (live sliders)** — température + humidité derrière une carte de registres I2C à `0x44`, tous deux pilotés par des curseurs ; le modèle pour tout capteur à protocole numérique.

Enregistrez votre propre variante dans [My Chips](/docs/fr/custom-chips/my-chips/) et elle est à un clic dans chaque projet.
