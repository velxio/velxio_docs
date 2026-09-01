---
title: "Mes puces : enregistrez et réutilisez vos puces"
description: Enregistrez une puce personnalisée une fois et déposez-la dans n'importe quel projet depuis votre sélecteur de composants, marquée CUSTOM. Plan Pro.
sidebar:
  order: 4
---

Vous avez créé une puce qui mérite d'être conservée ? Enregistrez-la dans **Mes puces** et elle fera partie de *votre* sélecteur de composants — dans chaque projet, prête à fonctionner, marquée d'un badge violet **CUSTOM**. Vous seul voyez votre bibliothèque.

:::note[Pro]
L'enregistrement de puces dans votre bibliothèque fait partie du plan Pro : c'est la seule pièce de puces personnalisées qui vit sur le serveur plutôt que dans votre navigateur. L'écriture, la compilation et l'exécution de puces, ainsi que la conduite de leurs [curseurs en direct](/docs/fr/custom-chips/programmable-sensors/), sont gratuites sur tous les plans ; « Créer avec l'IA » est disponible à partir du plan Maker.
:::

Une puce enregistrée conserve tout : son code source C, son manifeste, le WASM compilé, et son [image de face](/docs/fr/custom-chips/getting-started/#giving-the-chip-a-face) si elle en a une.

## Enregistrer une puce

Dans l'explorateur de fichiers, chaque puce personnalisée a sa propre section. Cliquez sur le bouton **save** dans son en-tête (à côté de Compile), donnez-lui un nom et une description facultative, et elle est dans votre bibliothèque — compilée et prête. L'enregistrement d'une puce sous un nom déjà utilisé propose de mettre à jour l'entrée existante, afin qu'une puce puisse évoluer entre les projets.

L'agent IA peut aussi le faire : demandez-lui de *« enregistrer cette puce dans mes puces »* (`save_custom_chip`), listez ce que vous avez (`list_my_chips`), ou placez une puce enregistrée (`use_my_chip`) — et les agents externes connectés via le [pont MCP](/docs/fr/ai/connect-external-agent/) disposent des trois mêmes outils.

## Utiliser une puce enregistrée

Ouvrez le sélecteur de composants et vos puces sont là, avec le badge CUSTOM sur la carte. En déposer une la **copie** dans le projet — source, manifeste et binaire compilé — afin que les projets restent entièrement autonomes : la modification de la copie ne touche jamais votre bibliothèque, et le partage du projet partage une puce fonctionnelle, pas une référence que vous seul pouvez résoudre.

Les puces déposées arrivent directement dans l'éditeur avec leurs `chip.c` et `chip.json` comme fichiers ordinaires, comme toute puce personnalisée.

## Limites

- Jusqu'à **100 puces** par compte.
- Source jusqu'à 64 Ko, puce compilée jusqu'à ~512 Ko.
- La suppression d'un projet ne supprime jamais les puces de la bibliothèque, et la suppression d'une puce de la bibliothèque ne touche jamais aux projets qui l'ont copiée.
