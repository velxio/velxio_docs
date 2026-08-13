---
title: Créez votre première puce personnalisée
description: Ajoutez une pièce de puce personnalisée, écrivez quelques lignes de C, et Velxio la compile en WebAssembly.
sidebar:
  order: 2
---

Une **puce personnalisée** est un composant que vous programmez vous-même. Vous écrivez du C simple
avec l'API `velxio-chip.h`, Velxio la compile en WebAssembly dans le
cloud, et le résultat se comporte comme n'importe quelle pièce du catalogue : elle a des broches que vous connectez,
des attributs que vous modifiez, et une logique qui s'exécute dans la simulation.

## Quand en créer une

- Le circuit intégré dont vous avez besoin n'est pas dans le catalogue (un registre à décalage obscur, un
  protocole de capteur propriétaire).
- Vous voulez un banc de test — un générateur d'impulsions, un exerciceur de protocole, un
  faux capteur avec des valeurs scriptées.
- Vous enseignez la logique numérique et vous voulez que les étudiants _implémentent_ la
  puce, pas seulement qu'ils l'utilisent.

## La version en cinq minutes

1. Ouvrez le [sélecteur de composants](/docs/fr/circuit-editor/placing-components/)
   et ajoutez une **Custom Chip** (puce personnalisée) au canevas.
2. Ouvrez l'éditeur de la puce (clic droit sur la puce). Vous obtenez deux fichiers :
   - **C source** — le comportement ;
   - **`chip.json`** — le manifeste : nom, broches, attributs.
3. Commencez par l'exemple intégré **Inverter** (inverseur) :

```c
#include "velxio-chip.h"
#include <stdlib.h>

typedef struct { vx_pin in, out; } chip_state_t;

static void on_in_change(void* ud, vx_pin pin, int value) {
  chip_state_t* s = ud;
  vx_pin_write(s->out, value ? VX_LOW : VX_HIGH);
}

void chip_setup(void) {
  chip_state_t* s = malloc(sizeof *s);
  s->in  = vx_pin_register("IN",  VX_INPUT);
  s->out = vx_pin_register("OUT", VX_OUTPUT);
  vx_pin_write(s->out, vx_pin_read(s->in) ? VX_LOW : VX_HIGH);
  vx_pin_watch(s->in, VX_EDGE_BOTH, on_in_change, s);
  vx_log("inverter ready");
}
```

avec son manifeste :

```json
{
  "schema": "velxio-chip/v1",
  "name": "Inverter",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

4. **Compile** (compilez) dans la boîte de dialogue — les erreurs reviennent comme avec n'importe quel compilateur C.
5. Connectez `IN` à un bouton et `OUT` à une LED, appuyez sur **Run** (exécuter), et basculez
   à volonté.

## Comment les puces s'exécutent

L'hôte appelle votre `chip_setup()` une fois par instance de puce. Ensuite, la
puce est **réactive** : votre code ne s'exécute que dans les callbacks — une broche surveillée a
changé, un octet I2C est arrivé, une minuterie a déclenché. Il n'y a pas de boucle principale pour
bloquer, ce qui rend les puces personnalisées assez économiques pour en parsemer un
circuit.

## Exemples de puces intégrés

L'éditeur de puces fournit des sources fonctionnelles que vous pouvez charger et modifier : portes
logiques (inverseur, XOR), registres à décalage (74HC595, CD4094), pièces I2C
(PCF8574, DS3231 RTC, EEPROM 24Cxx), un ADC SPI (MCP3008), un transformateur UART
ROT13, un compteur d'impulsions — et une **collection de CPU rétro**
(Intel 4004 et amis) pour les plus aventureux.

Ensuite : la [référence de l'API des puces](/docs/fr/custom-chips/api/).
