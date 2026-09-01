---
title: Capteurs programmables
description: Construisez un capteur dont la lecture est modifiée par un curseur pendant que la simulation s'exécute, et comprenez exactement comment le curseur atteint votre puce en cours d'exécution.
sidebar:
  order: 3
---

Un **capteur programmable** est une puce personnalisée ordinaire dont les lectures sont pilotées par un curseur *pendant que la simulation s'exécute*. Un capteur de CO2 dont vous faites varier le ppm pour tester un seuil d'alarme. Une sonde de température que vous poussez au-delà de 85 °C pour voir ce que fait le firmware. Un capteur de lumière que vous atténuez à la main.

Rien ne change dans la puce : c'est le même composant WebAssembly décrit dans [Premiers pas](/docs/fr/custom-chips/getting-started/). Ce que cette page ajoute, c'est le fil qui transporte une valeur de curseur vers une puce déjà en cours d'exécution, sans recompiler ni redémarrer quoi que ce soit.

## Le contrat, en trois parties

Chaque capteur programmable est constitué de ces trois éléments, et rien d'autre.

**1. Un attribut** contient la valeur ajustable.

```c
S.ppm = vx_attr_register("ppm", 1000);
```

**2. Une entrée `controls`** dans `chip.json` place un curseur à l'écran. Elle adresse l'attribut **par le même identifiant** :

```json
"controls": [
  { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
    "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
]
```

**3. Votre code relit l'attribut** à chaque fois qu'il a besoin de la valeur :

```c
double ppm = vx_attr_read(S.ppm);   /* la valeur du curseur à l'instant présent */
```

Appuyez sur **Run** (Exécuter), cliquez sur la puce, et cela s'ouvre :

![Le panneau de contrôle en direct d'une puce capteur de CO2 en cours d'exécution : un curseur de 400 à 5000 ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Ce troisième point est celui qui piège les gens. Lisez l'attribut une seule fois dans `chip_setup()` et mettez-le en cache dans une variable, et le curseur apparaîtra, bougera, et ne fera absolument rien. `vx_attr_read` est peu coûteux ; appelez-le dans votre callback de temporisation, dans votre gestionnaire de lecture I2C, partout où la valeur est réellement nécessaire.

:::tip[Vous avez peut-être déjà des curseurs]
Si vous omettez entièrement la section `controls`, **tout attribut qui déclare à la fois `min` et `max` reçoit quand même un curseur**. Les puces que vous avez écrites avant cette fonctionnalité sont souvent déjà ajustables. `controls` sert à renommer un curseur, lui donner une unité, le rendre logarithmique, ou le transformer en bouton.
:::

## Comment la valeur atteint votre puce

Il est utile de le comprendre, car les deux moteurs de simulation empruntent des chemins différents et les modes de défaillance diffèrent.

| Étape | Ce qui se passe |
| --- | --- |
| Vous faites glisser le curseur | Le panneau écrit dans le registre de mise à jour des capteurs, indexé par cette instance de puce |
| Moteur navigateur (AVR, RP2040, ESP32 dans le navigateur) | La valeur est écrite directement dans la table d'attributs que le WebAssembly en cours d'exécution lit à chaque `vx_attr_read`. Pas de passage de messages, pas de redémarrage |
| ESP32 sous QEMU | La puce vit dans un worker, donc la valeur lui est transmise comme une mise à jour d'attribut et appliquée là-bas |
| Toutes les 250 ms de silence | Les dernières valeurs sont reflétées dans les propriétés enregistrées du composant, de sorte que la position du curseur survit à une sauvegarde et à un rechargement |

Deux conséquences à connaître :

- **Il n'y a pas d'étape « appliquer ».** Le prochain `vx_attr_read` renvoie la nouvelle valeur. Si votre puce ne lit l'attribut qu'une fois par seconde, c'est le temps que mettra le curseur pour avoir un effet visible.
- **Le panneau est par instance.** Deux copies de la même puce sur un même canevas ont des curseurs indépendants, car les contrôles sont synthétisés à partir du manifeste de chaque instance.

## Valeurs par défaut à la conception versus valeurs en direct

Ce sont des surfaces différentes et les gens les confondent :

- **Arrêté** : cliquez avec le bouton droit sur la puce pour ouvrir l'inspecteur de composant. Ce que vous y définissez est la valeur par défaut enregistrée de l'attribut, la valeur avec laquelle la puce démarre.
- **En cours d'exécution** : cliquez sur la puce. Le panneau de curseurs s'ouvre. Ce que vous y définissez est la valeur en direct, appliquée immédiatement.

## Essayez-en un d'abord

Chaque modèle a un circuit exécutable dans la galerie. Appuyez sur **Run** (Exécuter), puis cliquez sur la puce :

| Exemple | Ce qu'il enseigne |
| --- | --- |
| [Capteur CO2 (curseur en direct)](https://velxio.dev/example/co2-sensor-live-slider) | La recette analogique : curseur vers tension vers `analogRead` |
| [Capteur d'environnement I2C (curseurs en direct)](https://velxio.dev/example/i2c-env-sensor-live-sliders) | Deux curseurs derrière une table de registres à `0x44` |
| [Capteur de mouvement (bouton de simulation)](https://velxio.dev/example/motion-sensor-sim-button) | Le contrôle `button` : déclenchement momentané plus curseur de maintien |
| [Veilleuse (curseur lux logarithmique)](https://velxio.dev/example/night-light-log-slider) | `scale: "log"` : cinq décades de lux sur un seul curseur, la lampe se déclenche sous 50 lx |
| [Thermomètre SPI (curseur en direct)](https://velxio.dev/example/spi-thermometer-live-slider) | Synchronisation esclave SPI : verrouillage sur le front descendant de CS |
| [Capteur d'air UART (curseur en direct)](https://velxio.dev/example/uart-air-sensor-live-slider) | Capteur série de type push dans SoftwareSerial |

## Où aller ensuite

- [Tutoriel : un capteur CO2 analogique](/docs/fr/custom-chips/programmable-sensors/co2-analog/)
  — l'exemple complet le plus court, de la puce vide au suivi d'un curseur par `analogRead`.
- [Tutoriel : température et humidité sur I2C](/docs/fr/custom-chips/programmable-sensors/i2c-env/)
  — le modèle pour tout capteur à protocole numérique, avec deux curseurs et une table de registres.
- [Référence `controls`](/docs/fr/custom-chips/programmable-sensors/reference/)
  — tous les champs, les règles de repli automatiques, et quoi vérifier quand un curseur ne fait rien.

:::note[Gratuit]
Tout sur cette page est gratuit, quel que soit le plan : écrire une puce, la compiler, l'exécuter et faire glisser ses curseurs. Ce qui est payant, c'est de faire écrire une puce par l'IA (plans Maker et supérieurs) et la bibliothèque côté serveur [My Chips](/docs/fr/custom-chips/my-chips/) (plan Pro).
:::
