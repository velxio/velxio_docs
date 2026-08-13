---
title: "Flashing du matériel réel depuis le navigateur"
description: "Écrivez votre projet compilé sur une carte physique via USB — aucun outillage installé."
sidebar:
  order: 4
---

Lorsque votre projet fonctionne dans le simulateur, vous pouvez le placer sur une **carte
réelle** sans rien installer : Velxio flashe le firmware compilé
via USB, directement depuis le navigateur.

## Prérequis

- Un navigateur basé sur Chromium (Chrome ou Edge) — le flasheur utilise
  l'API du port série du navigateur, que Firefox et Safari ne fournissent pas.
- Un câble USB compatible données vers votre carte.
- Fermez d'abord tout autre programme utilisant le port (moniteurs série, IDE) — le
  navigateur nécessite un accès exclusif.

## Flashing

1. Ouvrez la boîte de dialogue **Flash** depuis l'éditeur.
2. Sélectionnez le port série USB — la boîte de dialogue détecte automatiquement les candidats, et le
   navigateur vous demande de confirmer le port à accorder.
3. Velxio utilise le firmware qu'il a déjà compilé pour votre carte — le même
   binaire que celui exécuté par le simulateur.
4. Surveillez la progression ; une fois terminé, la carte redémarre dans votre
   projet.

Les cartes RP2040/RP2350 flashent leur `.uf2`, les cartes ESP32 leur `.bin` — la
boîte de dialogue choisit le bon protocole pour la cible.

## Simulez d'abord, flashez ensuite

Cela boucle la boucle qui rend Velxio utile pour un travail réel : itérez
rapidement dans le simulateur (pas de câble, pas d'usure sur le matériel, réinitialisations
instantanées), puis flashez le même artefact de compilation lorsqu'il se comporte correctement.
