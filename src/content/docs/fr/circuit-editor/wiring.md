---
title: Câblage
description: Connectez les broches avec des fils, acheminez-les et codez-les par couleur comme un vrai kit de jumpers.
sidebar:
  order: 3
---

## Établir une connexion

Cliquez sur une **broche** sur n'importe quel composant — un fil suit votre curseur. Cliquez
sur la broche de destination pour terminer le fil. Les fils sont acheminés orthogonalement (coudes
à angle droit), de la manière la plus lisible pour les schémas et les photos de breadboard.

- Appuyez sur **Escape** pour annuler un fil commencé.
- Cliquez sur un fil pour le sélectionner ; **Delete** le supprime.
- Vous pouvez également commencer le câblage depuis l'[inspecteur de composant](/docs/fr/circuit-editor/part-inspector/) :
  faites un clic droit sur un composant et « touchez une broche pour câbler ».

## Couleurs des fils

Pendant qu'un fil est en cours (ou avec un fil sélectionné), appuyez sur une touche pour définir
sa couleur — la même convention de palette que les utilisateurs de Wokwi connaissent :

| Touche | Couleur | Touche                       | Couleur                                 |
| ------ | ------- | ---------------------------- | --------------------------------------- |
| `0`    | Noir    | `6`                          | Bleu                                    |
| `1`    | Marron  | `7`                          | Violet                                  |
| `2`    | Rouge   | `8`                          | Gris                                    |
| `3`    | Orange  | `9`                          | Blanc                                   |
| `4`    | Or      | `c` / `l` / `m` / `p` / `y`  | Cyan / Citron vert / Magenta / Violet / Jaune |
| `5`    | Vert    |                              |                                         |

Les nouveaux fils reçoivent automatiquement une coloration de kit de jumpers : les fils voisins
prennent des couleurs visiblement différentes, le rouge et le noir étant réservés aux rails d'alimentation.

## Breadboards

Lorsque les broches d'un composant sont insérées dans les trous du breadboard, des **points verts** apparaissent sur les
broches enfichées — « branché et connecté » est visible d'un coup d'œil, sans
survoler. Les rails internes du breadboard (rangées et bandes d'alimentation) conduisent
exactement comme le vrai composant.

## Réalité électrique

Les fils ne sont pas de simples dessins : le moteur analogique résout le circuit que vous avez
réellement câblé. Une résistance série manquante, un court-circuit, une entrée flottante — tout
se comporte (et se comporte mal) comme sur l'établi. Si une connexion devait griller un
composant en mode électrique, le vérificateur de circuit vous avertit avant **Run**.
