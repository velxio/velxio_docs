---
title: "Aperçu des puces personnalisées"
description: "Créez vos propres composants avec l'API des puces personnalisées Velxio."
sidebar:
  order: 1
---

Lorsque le composant dont vous avez besoin n'est pas dans le catalogue, vous pouvez le créer vous-même. Une
**puce personnalisée** est un petit programme (compilé en WebAssembly) qui définit
les broches et le comportement de votre composant : elle peut piloter et lire des GPIO, communiquer en I2C,
SPI ou UART, exposer des attributs au panneau de propriétés, et même dessiner dans un
framebuffer.

Dans cette section :

- **Getting started** (Premiers pas) — créez votre première puce personnalisée depuis l'éditeur.
- **Programmable sensors** (Capteurs programmables) — des curseurs en direct qui pilotent votre puce pendant que la
  simulation s'exécute (`controls` dans chip.json).
- **My Chips** (Mes puces) — enregistrez une puce une fois, réutilisez-la dans n'importe quel projet (Pro).
- **API reference** (Référence API) — toutes les fonctions de `velxio-chip.h` : GPIO, I2C, SPI,
  UART, temps, attributs et framebuffer.
