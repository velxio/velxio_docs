---
title: Construire une scène
description: Ajoutez des robots, des pistes, des rampes et des obstacles à la souris, connectez-les à vos moteurs et capteurs, et lisez le format de scène.
sidebar:
  order: 2
---

Un World créé avec le kit de scène de Velxio (tous les Worlds que **Create a world for
this circuit** génère, ainsi que l'[arène Devastator](/docs/fr/worlds/example-devastator-tank/))
peut être modifié à la souris. Les modifications sont enregistrées dans `world.html`, elles suivent donc
le projet où qu'il aille.

![L'éditeur de scène sur l'arène Devastator](../../../../assets/docs/worlds/editor.png)

## Mode édition

Appuyez sur **Edit** (le crayon) dans la barre d'outils du World.

- **Add** place un nouvel objet sur le tapis :

  | Groupe    | Objets                                                                        |
  | --------- | ----------------------------------------------------------------------------- |
  | Robots    | Robot 2WD, Robot 4WD, Robot tank (Devastator), Bras robotique                 |
  | Pistes    | Boucle, ovale, en huit, ligne droite (ruban noir sur le tapis)                |
  | Obstacles | Boîte, mur, cylindre                                                          |
  | Terrain   | Rampe, pont, colline                                                          |

- **Cliquez** sur un objet pour le sélectionner et ouvrir ses propriétés.
- **Faites glisser** pour le déplacer sur le tapis. **Q** et **E** le font pivoter, **Shift** fait pivoter
  par pas de 15 degrés, **Delete** le supprime.
- **Ctrl+Z** et **Ctrl+Y** annulent et rétablissent.
- **Mat settings** définit la taille, la couleur et la grille du tapis.

Cela fonctionne de la même manière en vue 3D et en vue 2D. Appuyez à nouveau sur Edit pour revenir au
mode jeu.

## Connecter un robot au circuit

Un robot ne se déplace qu'avec les moteurs que vous lui donnez, et ne reçoit que les capteurs que vous
lui donnez. Sélectionnez le robot et choisissez, parmi les composants de votre canevas :

| Champ                     | Ce qu'il faut choisir                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Motors: Left / Right**  | Un ou deux moteurs par côté. La vitesse d'un côté suit la moyenne d'entraînement de ses moteurs.                   |
| **Reverse left / right**  | Cochez un côté dont la marche "avant" correspond à un entraînement négatif (son moteur est câblé ou monté dans l'autre sens). |
| **Line**                  | Capteurs de ligne, de gauche à droite sur l'avant (jusqu'à cinq, espacés de 18 mm).                                |
| **Sonar**                 | Un capteur de distance sur le pare-chocs avant (URM09, URM37 ou HC-SR04).                                          |
| **Sonar servo**           | Un servo qui oriente le sonar : 0 degré regarde à droite, 90 devant, 180 à gauche.                                 |
| **IMU**                   | Un MPU6050 sur le châssis.                                                                                         |

Un bras robotique prend quatre servos : base, épaule, coude et pince.

## Robots

| Préréglage | Corps          | Vitesse pleine puissance | Franchit | Semblable à                            |
| ---------- | -------------- | ------------------------ | -------- | -------------------------------------- |
| 2WD        | 15 x 10,5 cm   | 0,55 m/s                 | 1 cm     | la voiture à deux roues classique en kit |
| 4WD        | 20 x 11,5 cm   | 0,61 m/s                 | 1,5 cm   | une voiture à quatre roues à direction différentielle |
| Tank       | 22,5 x 22 cm   | 0,36 m/s                 | 3 cm     | le DFRobot Devastator, à chenilles     |

Les robots s'arrêtent contre les boîtes, les murs, les cylindres et le bord du tapis, et
franchissent tout ce qui n'est pas plus haut que leur hauteur de franchissement. Sur une rampe, ils montent
la pente et s'inclinent avec elle, un peu plus lentement en montée.

## Le format de scène

Derrière l'éditeur, la scène est un bloc JSON dans `world.html` :

```html
<!doctype html>
<html><body>
<script type="application/json" id="velxio-scene">
{ "version": 1, "view": "3d", "floor": { "w": 2.4, "h": 1.6, "grid": true },
  "objects": [
    { "id": "track1", "type": "track", "shape": "loop", "x": 0, "y": 0, "w": 2.1, "h": 0.9, "tape": 0.022 },
    { "id": "robot1", "type": "robot", "preset": "diff2", "x": -0.3, "y": -0.45, "rot": 0,
      "bind": { "left": ["motorL"], "right": ["motorR"], "line": ["lineL", "lineC", "lineR"] } },
    { "id": "box1", "type": "box", "x": 0.7, "y": 0.05, "w": 0.15, "d": 0.15, "h": 0.15, "color": "#c0392b" }
  ] }
</script>
<script>velxio.kit.start();</script>
</body></html>
```

- Les unités sont les mètres et les degrés. Le tapis (`floor`, `w` par `h`) est centré sur
  l'origine : x vers la droite, y en s'éloignant de vous, `rot` dans le sens antihoraire depuis +x.
- Chaque objet a un `id` unique, une position `x`, `y`, et éventuellement `rot`,
  `color` et `label`.
- `robot` : `preset` vaut `diff2`, `diff4` ou `tank`. `bind` contient `left`,
  `right` (listes d'ids de moteurs), `invertLeft`, `invertRight`, `line` (ids de capteurs,
  de gauche à droite), `sonar`, `sonarServo` et `imu`.
- `track` : `shape` vaut `loop`, `oval`, `figure8` ou `line`, avec `w`, `h` et
  `tape` (la largeur du ruban, de 0,019 à 0,025 m). Pour démarrer un suiveur de ligne sur le
  ruban d'une boucle centrée à l'origine, placez-le sur le segment droit du bas en direction
  +x : `x: -0.3, y: -h/2, rot: 0`.
- `box` et `wall` : `w`, `d`, `h`. `cylinder` : `r`, `h`.
- `ramp` : `profile` vaut `wedge` (monte vers +x, puis une face verticale),
  `bridge` (montée, plat, descente) ou `hill` (une bosse lisse, franchissable de tous les côtés),
  avec `w`, `d`, `h`. Le sonar voit les faces verticales de 3 cm ou plus, jamais
  les pentes.
- `arm` : `bind` contient les ids des servos `base`, `shoulder`, `elbow` et `gripper`.

Les ids dans `bind` que le circuit ne possède pas sont ignorés, ainsi une scène ne
casse jamais le projet. La [page Devastator](/docs/fr/worlds/example-devastator-tank/)
montre une arène complète.
