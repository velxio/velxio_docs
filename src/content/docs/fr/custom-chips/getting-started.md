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
2. La galerie d'exemples s'ouvre — choisissez un point de départ (ou commencez à vide).
3. Vous arrivez dans l'éditeur de code habituel : la puce possède sa propre section dans
   l'explorateur de fichiers avec deux fichiers ordinaires —
   - **`chip.c`** — le comportement ;
   - **`chip.json`** — le manifeste : nom, broches, attributs (validés
     avec des suggestions de saisie au fur et à mesure).
   Voici l'exemple intégré **Inverter** (inverseur) :

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

4. Connectez `IN` à un bouton et `OUT` à une LED, puis appuyez sur **Run** (Exécuter) — la
   puce se compile automatiquement chaque fois que son code source a changé (le bouton marteau
   dans la section de l'explorateur de fichiers de la puce la compile indépendamment,
   avec les erreurs dans la console de sortie comme n'importe quel compilateur C).
5. Basculez. Cliquez sur la puce pendant que la simulation est arrêtée pour revenir
   à son `chip.c` ; modifiez et relancez **Run** (Exécuter).

## Donner un visage à la puce

Par défaut, une puce est dessinée comme un corps sombre avec son nom sur une bande de
sérigraphie et ses étiquettes de broches autour du bord. Vous pouvez remplacer ce visage par
votre propre illustration — une photo du vrai module de développement, un dessin de
fiche technique, une icône :

Cliquez sur le bouton **image** dans la section de l'explorateur de fichiers de la puce (à côté de
Compile) et choisissez un **PNG, JPEG ou SVG** jusqu'à 256 Ko. Il rejoint `chip.c`
et `chip.json` comme un autre fichier dans la section de cette puce — `chip.png`,
`chip.jpg` ou `chip.svg` — il voyage donc avec le projet, est exporté dans
un `.vlx`, et vous accompagne lorsque vous enregistrez la puce dans
[My Chips](/docs/fr/custom-chips/my-chips/).

L'image est mise à l'échelle pour s'adapter au corps de la puce, jamais recadrée ni étirée.
**Les broches ne bougent pas** : leurs positions proviennent toujours de `chip.json`, donc
ajouter une illustration à une puce câblée laisse chaque fil exactement là où il était.
Les étiquettes de broches restent au-dessus de l'image, dessinées en blanc avec un contour sombre pour
être lisibles sur les illustrations claires et sombres, et le nom imprimé cède
la place à l'illustration (il reste dans l'infobulle au survol).

Pour la retirer, utilisez le bouton à côté de celui de l'image, ou supprimez le fichier
d'image de la section de la puce.

:::tip
Un SVG donne le visage de puce le plus net à n'importe quel zoom, et vous pouvez coller du
balisage `<svg>` brut directement dans un fichier `chip.svg` au lieu de le téléverser.
:::

## Comment les puces s'exécutent

L'hôte appelle votre `chip_setup()` une fois par instance de puce. Ensuite, la
puce est **réactive** : votre code ne s'exécute que dans des callbacks — une broche surveillée a
changé, un octet I2C est arrivé, une minuterie a déclenché. Il n'y a pas de boucle principale à
bloquer, ce qui maintient les puces personnalisées suffisamment légères pour être disséminées dans un
circuit.

## Exemples de puces intégrés

L'éditeur de puces fournit des sources fonctionnelles que vous pouvez charger et modifier : portes
logiques (inverseur, XOR), registres à décalage (74HC595, CD4094), pièces I2C
(PCF8574, DS3231 RTC, EEPROM 24Cxx), un ADC SPI (MCP3008), un transformateur UART
ROT13, un compteur d'impulsions — et une **collection de CPU rétro**
(Intel 4004 et ses amis) pour les plus aventureux.

Ensuite : la [référence de l'API des puces](/docs/fr/custom-chips/api/).
