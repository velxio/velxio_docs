---
title: Dépannage
description: "Les vérifications qui résolvent la plupart des problèmes, dans l'ordre."
sidebar:
  order: 4
---

## La simulation ne démarre pas

1. Vérifiez la **console de sortie** — si la compilation a échoué, l'erreur
   s'y trouve, avec le fichier et la ligne. Voir
   [lecture des erreurs de compilation](/docs/fr/programming/compile-and-run/).
2. Un avertissement du **vérificateur de circuit** (par exemple, une LED sans
   résistance en série en mode électrique) bloque l'exécution volontairement —
   corrigez le câblage signalé.
3. La première exécution d'une session compile à froid et peut prendre du temps
   sur les grandes chaînes d'outils (ESP-IDF) ; les exécutions suivantes sont
   beaucoup plus rapides. Laissez du temps à la première avant de supposer
   qu'elle a planté.

## Ça s'exécute, mais rien ne se passe

- La **bonne carte** est-elle sélectionnée dans le sélecteur de carte de la barre d'outils ?
- Ouvrez le **moniteur série** — un firmware qui a planté ou qui attend une
  entrée vous le dira là.
- Cliquez avec le bouton droit sur les composants pour confirmer leurs **propriétés**
  (une bande NeoPixel réglée sur 0 LED n'affiche exactement rien).

## La page elle-même se comporte mal

- Velxio nécessite un **Chromium ou Firefox de bureau**, raisonnablement récent.
- Rechargez en forçant (Ctrl+Shift+R) après les mises à jour — un bundle en cache
  obsolète peut mal s'associer avec un backend récent.
- Les extensions de navigateur qui touchent à WebAssembly, canvas ou WebSockets
  (bloqueurs de confidentialité agressifs) peuvent casser les émulateurs —
  essayez une fenêtre de navigation privée.

## Le flash Web ne voit pas ma carte

- Utilisez **Chrome ou Edge** — Firefox/Safari ne fournissent pas l'API série
  du navigateur.
- Fermez tous les autres programmes utilisant le port (moniteurs série, IDE).
- Essayez un autre câble — les câbles USB de charge uniquement sont le piège classique.

## Les exemples WiFi ne peuvent pas se connecter

- Le SSID est exactement **`Velxio-GUEST`**, ouvert, sans mot de passe.
- Surveillez le moniteur série pour les lignes de progression de la pile WiFi
  (`wifi:connected`, `got ip`) afin de voir quelle étape échoue.

## Toujours bloqué ?

Demandez à l'[assistant IA](/docs/fr/ai/overview/) avec votre projet ouvert — il
lit les mêmes erreurs que vous. Pour les bugs, contactez l'équipe via le menu
**Help**, Discord, ou GitHub.
