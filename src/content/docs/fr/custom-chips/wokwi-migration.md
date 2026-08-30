---
title: "Apporter les puces Wokwi à Velxio"
description: "Les puces écrites pour l'API C des puces personnalisées Wokwi se compilent sur Velxio sans modification, et les projets Wokwi zippés s'importent avec leurs puces."
sidebar:
  order: 5
---

Si vous avez écrit des puces personnalisées pour Wokwi, elles vous suivent : Velxio est
**compatible au niveau source** avec l'API C documentée des puces personnalisées Wokwi.

## Même C, inchangé

`#include "wokwi-api.h"` est résolu vers un en-tête de compatibilité réécrit
qui adapte chaque symbole documenté à l'API native `vx_*` de Velxio au
moment de la compilation :

- `chip_init()` est le point d'entrée, exactement comme sur Wokwi.
- `pin_init`, `pin_read`, `pin_write`, `pin_mode`, `pin_watch` (avec sa
  `pin_watch_config_t`), `pin_adc_read`, `pin_dac_write` — tout y est.
- `i2c_init`, `uart_init`, `spi_init` prennent leurs structures de configuration ; les champs
  (`connect`/`read`/`write`/`disconnect`, `rx_data`/`write_done`,
  `done`) sont traduits un pour un.
- `attr_init` / `attr_read` (et les variantes `_float` et chaîne),
  `timer_init` / `timer_start` (microsecondes, converties pour vous) /
  `timer_start_ns` / `timer_stop`, `get_sim_nanos`,
  `framebuffer_init` / `buffer_write` / `buffer_read`.
- `INPUT`/`OUTPUT`/`INPUT_PULLUP`/`INPUT_PULLDOWN`/`ANALOG`,
  `OUTPUT_LOW`/`OUTPUT_HIGH`, `LOW`/`HIGH`, `RISING`/`FALLING`/`BOTH`,
  `NO_PIN` — valeurs identiques.

Compilez-le comme n'importe quelle puce Velxio : collez le C dans le
`chip.c` d'une puce personnalisée et appuyez sur **Run** (Exécuter).

## Compatibilité chip.json

`name`, le tableau positionnel `pins` (avec les sauts de slot `""`),
`attributes`, `controls` (curseurs en direct) et `display` fonctionnent tous comme sur
Wokwi. `symbol` et les illustrations SVG personnalisées sont ignorés — Velxio dessine son
propre corps de puce générique dimensionné selon votre nombre de broches.

## Projets zippés

**File → Open project** (Fichier → Ouvrir le projet) accepte un projet Wokwi zippé. Une
partie `chip-<name>` dans `diagram.json` devient une puce personnalisée avec ses sources chargées
depuis les fichiers voisins `<name>.chip.c` / `<name>.chip.json`, les fils étant intacts.
Les exports réécrivent la même disposition.

## Ce qui n'est pas repris

- **Binaires `.wasm` précompilés** — l'espace de noms d'importation de Velxio diffère ;
  recompilez à partir de la source (cela prend quelques secondes, et l'import du zip le fait
  au premier **Run**).
- L'API d'introspection expérimentale `_mcu_*`.

## Préférez l'API native pour les nouvelles puces

La couche de compatibilité existe pour que votre travail existant fonctionne. Pour les nouvelles
puces, l'[API native `velxio-chip.h`](/docs/fr/custom-chips/api/) est le
même ensemble d'idées avec des types plus clairs (tensions en `double`, minuteries
en nanosecondes) — et c'est ce que les exemples, l'agent IA et
[My Chips](/docs/fr/custom-chips/my-chips/) parlent nativement.
