---
title: "Mes circuits : enregistrez et réutilisez vos circuits"
description: Enregistrez un circuit personnalisé une fois et déposez-le dans n'importe quel projet depuis votre sélecteur de composants, marqué CUSTOM. Plan Pro.
sidebar:
  order: 4
---

Vous avez créé un circuit qui vaut la peine d'être conservé ? Enregistrez-le dans **Mes circuits** et il fera partie de *votre* sélecteur de composants — dans chaque projet, prêt à fonctionner, marqué d'un badge violet **CUSTOM**. Vous seul voyez votre bibliothèque.

:::note[Pro]
L'enregistrement de circuits fait partie du plan Pro (le même droit qui alimente
« Créer avec l'IA »). La modification et la compilation de circuits dans un projet fonctionnent sur tous les plans.
:::

## Enregistrer un circuit

Dans l'explorateur de fichiers, chaque circuit personnalisé a sa propre section. Cliquez sur le bouton **save** (enregistrer) dans son en-tête (à côté de Compile), donnez-lui un nom et une description facultative, et il est dans votre bibliothèque — compilé et prêt. L'enregistrement d'un circuit sous un nom déjà utilisé propose de mettre à jour l'entrée existante, afin qu'un circuit puisse évoluer entre les projets.

L'agent IA peut aussi le faire : demandez-lui de *« enregistrer ce circuit dans mes circuits »* (`save_custom_chip`), listez ce que vous avez (`list_my_chips`), ou placez un circuit enregistré (`use_my_chip`) — et les agents externes connectés via le [pont MCP](/docs/fr/ai/connect-external-agent/) disposent des trois mêmes outils.

## Utiliser un circuit enregistré

Ouvrez le sélecteur de composants et vos circuits y sont, avec le badge CUSTOM sur la carte. En déposer un le **copie** dans le projet — source, manifeste et binaire compilé — afin que les projets restent entièrement autonomes : la modification de la copie ne touche jamais à votre bibliothèque, et le partage du projet partage un circuit fonctionnel, pas une référence que vous seul pouvez résoudre.

Les circuits déposés arrivent directement dans l'éditeur avec leurs `chip.c` et `chip.json` comme fichiers ordinaires, comme tout circuit personnalisé.

## Limites

- Jusqu'à **100 circuits** par compte.
- Source jusqu'à 64 Ko, circuit compilé jusqu'à ~512 Ko.
- La suppression d'un projet ne supprime jamais les circuits de la bibliothèque, et la suppression d'un circuit de la bibliothèque ne touche jamais aux projets qui l'ont copié.
