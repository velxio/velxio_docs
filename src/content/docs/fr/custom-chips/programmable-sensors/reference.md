---
title: "référence des contrôles"
description: "Chaque champ de la section des contrôles dans chip.json, le repli automatique du curseur, comment les valeurs sont stockées, et quoi vérifier lorsqu'un contrôle ne fait rien."
sidebar:
  order: 6
---

Le tableau `controls` dans `chip.json` décrit ce que le panneau affiche pendant
l'exécution de la simulation. Chaque entrée pilote l'attribut dont le `name`
correspond à l'`id` de l'entrée.

## Champs des entrées

| Champ | S'applique à | Signification |
| --- | --- | --- |
| `id` | tous | **Obligatoire.** L'attribut que ce contrôle pilote. Une entrée sans `id` est ignorée |
| `type` | tous | `"range"` pour un curseur, `"button"` pour un déclencheur momentané. Toute autre valeur est ignorée et l'entrée ne produit rien |
| `label` | tous | Texte à côté du contrôle. Repli sur le `label` de l'attribut, puis sur `id` |
| `min` | curseur | Borne inférieure. Repli sur le `min` de l'attribut, puis `0` |
| `max` | curseur | Borne supérieure. Repli sur le `max` de l'attribut, puis `100` |
| `step` | curseur | Incrément. Repli sur le `step` de l'attribut, puis sur `1` lorsque l'étendue est plus large que 20, sinon `0.01` |
| `unit` | curseur | Affiché après la valeur, par exemple `ppm` ou `%`. Vide par défaut |
| `scale` | curseur | `"log"` donne un curseur logarithmique. Ignoré lorsque `min` est négatif, car la courbe n'y est pas définie |

La **position initiale** d'un curseur ne provient pas du contrôle. Elle
provient du `default` de l'attribut, avec repli sur `min`. Gardez le
`default` de l'attribut dans la plage du contrôle, sinon le panneau s'ouvre
avec la poignée épinglée à une extrémité.

## Le titre du panneau

Provient du `name` de la puce. Une puce sans `name` affiche « Custom Chip ».

## Le repli automatique

Vous n'avez pas du tout besoin d'écrire `controls`.

**Tout attribut qui déclare à la fois `min` et `max`, et qu'aucun contrôle
explicite ne revendique déjà, reçoit un curseur.** Son label provient du
`label` de l'attribut, son `step` du `step` de l'attribut, ou est déduit :
`1` pour `type: "int"`, sinon `1` lorsque l'étendue est plus large que 20 et
`0.01` lorsqu'elle ne l'est pas. Il n'a pas d'unité.

Donc `controls` n'est nécessaire que pour renommer un curseur, ajouter une
unité, le rendre logarithmique, ou déclarer un bouton. Deux conséquences
pratiques :

- Les puces écrites avant l'existence des contrôles en direct sont souvent
  déjà réglables, sans aucune modification.
- Une puce dont les attributs n'ont ni `min`/`max` ni section `controls`
  n'affiche **aucun panneau du tout**. C'est la raison habituelle pour
  laquelle cliquer sur une puce semble ne rien faire.

## Boutons

Une entrée `"button"` rend un déclencheur momentané pour les lignes de
réinitialisation, les événements de type « simuler un mouvement », et tout
ce qui est un front plutôt qu'un niveau :

![Un contrôle bouton et un curseur de durée sur le panneau du capteur de mouvement](../../../../../assets/docs/custom-chips/motion-button-panel.png) Le presser pilote l'attribut à `1` puis de retour à `0` environ
150 ms plus tard, donc votre puce doit traiter une lecture non nulle comme
« l'événement s'est produit » plutôt que d'essayer de capturer un instant précis.

## Où les valeurs sont stockées

Les positions des curseurs sont reflétées dans les propriétés enregistrées
du composant (sous `attrs`) environ 250 ms après que vous arrêtez de les
déplacer, avec les valeurs en attente fusionnées. C'est pourquoi faire
glisser un curseur n'écrit pas dans le projet à chaque pixel, et pourquoi
la position survit à une sauvegarde et un rechargement.

Le miroir est une *copie*. La valeur que la puce en cours d'exécution lit
est la valeur en direct, appliquée au moment où le contrôle bouge.

## Moteurs

| Moteur | Comment la valeur arrive |
| --- | --- |
| AVR, RP2040, ESP32 dans le navigateur | Écrite directement dans le magasin d'attributs que WebAssembly lit à chaque `vx_attr_read` |
| ESP32 sur le backend QEMU | Transférée au worker et appliquée au magasin d'attributs du runtime de la puce là-bas |

Les deux sont en direct : pas de recompilation, pas de redémarrage, pas de
bouton « Appliquer ». La seule latence est la fréquence à laquelle votre
propre code appelle `vx_attr_read`.

## Forfaits

Les contrôles en direct sont **gratuits**, sur tous les forfaits, ainsi que
l'écriture, la compilation et l'exécution de la puce qui les déclare. Deux
fonctionnalités voisines sont payantes : faire rédiger une puce ou un
capteur par l'IA (Maker et supérieur), et la bibliothèque
[My Chips](/docs/fr/custom-chips/my-chips/) qui conserve une puce sur le
serveur pour la réutiliser entre projets (Pro).

## Quand un contrôle ne fait rien

| Symptôme | Cause |
| --- | --- |
| Cliquer sur la puce n'ouvre aucun panneau | Aucune entrée `controls` et aucun attribut avec à la fois `min` et `max`, ou la simulation est arrêtée |
| Une entrée spécifique manque dans le panneau | Son `type` n'est ni `range` ni `button`, ou elle n'a pas d'`id` |
| Le curseur bouge mais rien ne change | La puce a mis en cache `vx_attr_read` au lieu de l'appeler là où la valeur est utilisée |
| Le curseur démarre à la mauvaise extrémité | Le `default` de l'attribut est en dehors du `min`/`max` du contrôle |
| La valeur saute en nombres entiers | `step` a été déduit comme `1` parce que l'étendue est plus large que 20 ; définissez `step` explicitement |
| Un curseur logarithmique est linéaire | `scale: "log"` est ignoré lorsque `min` est négatif |

## Voir aussi

- [Tutoriel : un capteur CO2 analogique](/docs/fr/custom-chips/programmable-sensors/co2-analog/)
- [Tutoriel : température et humidité sur I2C](/docs/fr/custom-chips/programmable-sensors/i2c-env/)
- [Référence de l'API des puces personnalisées](/docs/fr/custom-chips/api/)
- Exemples d'exécution de chaque champ ici : le
  [bouton](https://velxio.dev/example/motion-sensor-sim-button), le
  [curseur logarithmique](https://velxio.dev/example/night-light-log-slider), un
  capteur [SPI](https://velxio.dev/example/spi-thermometer-live-slider) et un
  capteur [UART](https://velxio.dev/example/uart-air-sensor-live-slider)
