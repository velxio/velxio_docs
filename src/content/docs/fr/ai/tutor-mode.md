---
title: Tutor mode — learn electronics
description: "Un enseignant qui travaille sur votre circuit en direct — exercices, vérifications et théorie."
sidebar:
  order: 4
---

Le mode **Tutor** transforme l'assistant en professeur d'électronique qui
enseigne _sur votre circuit_ — pas à partir d'un manuel abstrait :

![Le panneau IA en mode Tutor](../../../../assets/docs/ai/mode-tutor.png)

À quoi ressemble le tutorat :

- Dites-lui où vous en êtes — _"Je suis débutant, apprenez-moi comment fonctionnent les LED et les résistances"_ ou _"Je connais Arduino, initiez-moi à l'I2C"_.
- Il propose un **petit exercice** sur le canevas, vous le réalisez, et il
  **vérifie votre circuit et votre code réels** — en pointant du doigt le fil que vous avez croisé ou la résistance de tirage que vous avez oubliée.
- La théorie arrive lorsqu'il explique _pourquoi_ — la loi d'Ohm quand votre LED est faible, l'anti-rebond quand votre compteur saute.

Parce que le simulateur est réel ([firmware réellement exécuté](/docs/fr/getting-started/faq/)),
tout ce que le tuteur enseigne est vérifiable sur-le-champ : mesurez-le avec
l'[oscilloscope](/docs/fr/instruments/oscilloscope/), lisez-le dans le
[moniteur série](/docs/fr/programming/serial-monitor/).

Le mode Tutor partage le même quota de **cycles** que les autres modes — voir
[plans](/docs/fr/getting-started/plans/).
