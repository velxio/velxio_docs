---
title: Votre premier projet
description: "Ouvrez l'exemple blink, exécutez-le, regardez la LED clignoter et personnalisez-le — en cinq minutes."
sidebar:
  order: 2
---

Le moyen le plus rapide de comprendre Velxio est d'exécuter quelque chose. Dans ce tutoriel,
vous ouvrirez l'exemple classique _blink_, vous l'exécuterez, vous regarderez un ESP32 simulé
piloter un vrai circuit à LED, puis vous modifierez le code.

![The blink example running](../../../../assets/docs/getting-started/blink.gif)

## 1. Ouvrir l'exemple

Allez sur [velxio.dev/example/esp32-blink-led](https://velxio.dev/example/esp32-blink-led)
(ou trouvez **ESP32 Blink** dans la [galerie d'exemples](/docs/fr/getting-started/examples-gallery/)).

![L'exemple blink chargé dans l'éditeur](../../../../assets/docs/getting-started/first-project-loaded.png)

Vous obtenez un projet complet : le **code** à gauche (un sketch Arduino qui
fait clignoter deux LED), et le **circuit** au milieu — un ESP32 DevKit câblé
via une résistance à une LED externe.

## 2. Appuyer sur Run

Cliquez sur le bouton vert **Run** dans la barre d'outils (ou appuyez sur **Ctrl+B** pour
compiler d'abord). Velxio compile votre sketch avec la véritable chaîne d'outils Arduino/ESP-IDF
dans le cloud — la console **Output** en bas à gauche affiche
la progression du compilateur, exactement comme le ferait l'IDE Arduino.

La première compilation d'une session peut prendre un certain temps ; ensuite, les builds
sont beaucoup plus rapides.

## 3. Regarder l'exécution

Lorsque la compilation est terminée, le firmware démarre sur l'ESP32 émulé :

![L'exemple blink en cours d'exécution : LED allumée, sortie série active](../../../../assets/docs/getting-started/first-project-running.png)

Trois choses se produisent simultanément :

- La **LED sur le canvas clignote** — la simulation pilote le composant
  réel, à travers la résistance réelle.
- Le **moniteur série** affiche le journal de démarrage puis `LED ON` / `LED OFF`,
  directement depuis `Serial.println()` dans le sketch.
- Le **badge SPICE** jaune au-dessus du circuit montre le moteur analogique
  qui résout le chemin du courant de la LED.

## 4. Personnaliser

Modifiez le sketch — par exemple, changez le délai pour le faire clignoter plus vite :

```cpp
delay(100);   // was 500
```

Appuyez à nouveau sur **Run**. C'est toute la boucle : modifier, exécuter, observer.

## 5. Enregistrer

Cliquez sur l'**icône d'enregistrement** au-dessus de l'arborescence des fichiers (ou **Ctrl+S**), donnez
un nom au projet, et il est stocké dans votre compte. Voir
[Enregistrer et ouvrir des projets](/docs/fr/getting-started/projects/).

> **Astuce :** bloqué à un moment donné ? Ouvrez l'assistant IA sur la droite et demandez —
> « pourquoi ma LED ne clignote-t-elle pas ? » est l'un de ses exemples d'invites pour une raison.
> Voir [Assistant IA](/docs/fr/ai/overview/).

## Et ensuite

- [Visite de l'interface](/docs/fr/getting-started/interface-tour/) — ce que fait chaque
  panneau et chaque bouton.
- [Éditeur de circuit](/docs/fr/circuit-editor/overview/) — construisez un circuit à
  partir de zéro au lieu de partir d'un exemple.
- [Cartes prises en charge](/docs/fr/boards/overview/) — remplacez l'ESP32 par un
  Arduino UNO, un Pi Pico, un STM32…
