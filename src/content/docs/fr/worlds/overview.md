---
title: Mondes 3D
description: Placez votre circuit dans une scène 3D ou 2D. Le firmware de la carte pilote le robot, et les capteurs du robot relisent la scène.
sidebar:
  order: 1
---

Un **Monde** place votre circuit dans une scène physique. Le firmware s'exécute sur la carte émulée exactement comme il le ferait sur la vraie : les moteurs qu'il pilote font bouger un robot, les servos qu'il règle orientent un bras ou un capteur, et les capteurs de ligne, de distance et de mouvement lisent ce qui se trouve sous le robot et devant lui. Le même code s'exécute ensuite sur le matériel réel.

![Le suiveur de ligne Romeo ESP32-S3 dans son Monde, à côté du circuit en cours d'exécution](../../../../assets/docs/worlds/romeo-running.png)

## Ouvrir le Monde

Chaque projet comportant une carte dispose d'un bouton **3D** dans l'en-tête du canevas, à côté du sélecteur de carte :

![Le bouton 3D à côté du sélecteur de carte](../../../../assets/docs/worlds/3d-button.png)

La première fois, il ouvre une introduction proposant trois points d'entrée :

![L'introduction du Monde 3D](../../../../assets/docs/worlds/intro.png)

- **Start from a robot** (Partir d'un robot) : ouvrez un projet de robot complet (carte, moteurs et capteurs câblés, firmware et Monde) et appuyez sur **Run**. Voir le [suiveur de ligne Romeo ESP32-S3](/docs/fr/worlds/example-romeo-line-follower/) et le [char Devastator](/docs/fr/worlds/example-devastator-tank/).
- **Create a world for this circuit** (Créer un monde pour ce circuit) : Velxio construit une scène de départ à partir de ce qui se trouve sur votre canevas. Les moteurs deviennent un robot (deux ou quatre roues), les capteurs de ligne reçoivent une piste adhésive sous eux, un capteur de distance reçoit des obstacles devant lui, et des servos seuls deviennent un bras robotisé sur une petite table.
- **Copy AI prompt** (Copier le prompt IA) : copie un brief contenant vos cartes, composants, câblage et firmware pour ChatGPT, Claude ou Gemini, afin qu'une IA puisse écrire le Monde que vous décrivez. Voir [Écrire votre propre Monde](/docs/fr/worlds/write-your-own/).

Une fois que le projet possède un Monde, le bouton 3D bascule entre le Monde et votre code.

## Appuyer sur Run

Lorsque la simulation démarre, la zone de l'éditeur affiche le Monde et le canevas reste à côté, de sorte que vous pouvez voir les moteurs tourner sur le circuit pendant que le robot se déplace. La boucle se referme environ 125 fois par seconde :

1. Le firmware règle les broches : une direction et un rapport cyclique PWM pour chaque moteur, une impulsion pour chaque servo.
2. Velxio lit la commande de chaque moteur (via le pilote utilisé par le circuit) et l'angle de chaque servo, puis les envoie au Monde.
3. Le Monde déplace le robot et mesure la scène : la bande sous chaque capteur de ligne, l'obstacle le plus proche devant chaque capteur de distance, l'accélération et la vitesse de rotation du robot pour un IMU.
4. Velxio écrit ces relevés dans les composants capteurs, et le firmware les lit lors de son prochain `digitalRead()`, `pulseIn()` ou transfert I2C.

Le Monde fonctionne sur l'**horloge simulée** de la carte, et non sur le temps réel. Si votre ordinateur exécute la simulation à moitié vitesse, le robot se déplace aussi à moitié vitesse, et cela reste cohérent avec le `millis()` du firmware.

## La barre du Monde

| Commande           | Ce qu'elle fait                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **World / HTML**   | Affiche la scène, ou le source `world.html` qui la sous-tend.                                             |
| **Guide**          | Une courte explication du Monde, par-dessus la scène.                                                     |
| **Copy AI prompt** | Copie le brief pour une conversation IA externe (voir [Écrire votre propre Monde](/docs/fr/worlds/write-your-own/)). |
| **Reload**         | Redémarre le Monde à partir de son fichier.                                                               |
| **Full screen**    | Affiche uniquement le Monde. Appuyez sur Échap pour revenir.                                              |

Les Mondes créés avec le kit de scène de Velxio ajoutent leur propre barre d'outils dans la scène : **Edit**, **Add**, **3D / 2D**, **Camera** (orbite, suivre le robot, vue du dessus) et **Reset** (remettre les robots à leur position de départ). Voir [Construire une scène](/docs/fr/worlds/scene-editor/).

## 3D ou 2D

La vue 3D nécessite WebGL. La vue **2D** du dessus dessine la même scène et exécute la même physique sans carte graphique, elle fonctionne donc sur n'importe quel ordinateur scolaire, et c'est la solution de repli lorsque la 3D n'est pas disponible.

![L'arène Devastator en vue 2D du dessus](../../../../assets/docs/worlds/view-2d.png)

## Avec quoi un Monde fonctionne

- **Lit** : les moteurs à courant continu et les motoréducteurs (derrière un L293D, un transistor ou un MOSFET, le pilote intégré d'une carte, ou directement sur une broche) et les servos.
- **Alimente** : le capteur de ligne DFRobot Gravity, les capteurs à ultrasons URM09 et URM37, le HC-SR04 et l'IMU MPU6050.

Tous les autres composants (LED, écrans, buzzers) continuent de fonctionner sur le canevas. Détails et recettes de firmware : [Moteurs et capteurs](/docs/fr/worlds/motors-and-sensors/).

## C'est un fichier

Un Monde est un seul fichier, `world.html`, dans le groupe de fichiers de la carte, à côté du sketch. Il est enregistré, partagé et exporté avec le projet, et il n'est jamais envoyé à la carte : il n'est ni compilé, ni écrit en flash, ni copié sur la carte microSD. Supprimez le fichier et le projet n'a plus de Monde.
