---
title: Velxio CI
description: Exécutez votre firmware sur une carte simulée depuis un terminal ou une tâche CI, et faites échouer la compilation lorsque le firmware se comporte mal.
sidebar:
  order: 1
  badge:
    text: Paid
    variant: tip
---

Velxio CI exécute l'un de vos projets sur notre simulateur depuis l'extérieur du navigateur :
votre terminal, une tâche GitHub Actions, n'importe quel CI capable de lancer un binaire. La carte
démarre votre firmware réellement compilé, la sortie série est renvoyée en flux, et la
commande se termine avec un code non nul lorsque quelque chose que vous avez demandé ne s'est pas produit.

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
velxio-cli login                           # approve in the browser, once
cd firmware/blink
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

```
velxio-cli 0.1.0 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 4 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## À quoi cela sert

- **Détecter une régression du firmware avant le matériel.** Un test qui démarre le
  binaire et attend une ligne de série tient en une commande ; un test qui appuie sur un
  bouton, définit un capteur et vérifie une broche tient dans un court fichier YAML.
- **Tester ce que vous ne pouvez pas garder sur un bureau.** Chaque carte que Velxio simule est
  disponible pour chaque tâche, en parallèle, sans laboratoire et sans flashage.
- **Conserver la chaîne d'outils que vous avez.** Compilez avec arduino-cli, ESP-IDF,
  PlatformIO ou cargo dans une étape précédente ; Velxio n'exécute que ce qui en est sorti.

## Combien cela coûte

Le CI est facturé en **minutes simulées** — le temps que le firmware invité croit
écoulé, et non le temps qu'ont pris nos serveurs. Un test de 10 secondes coûte 10 secondes
sur chaque carte, que l'émulateur l'ait exécuté plus vite ou plus lentement que le temps réel.

| Formule | Minutes CI par mois | Tâches simultanées | Durée maximale |
| ------- | ------------------- | ------------------ | -------------- |
| Free    | —                   | —                  | —              |
| Maker   | 200                 | 1                  | 5 min          |
| Pro     | 2 000               | 2                  | 10 min         |

Une exécution qui ne démarre jamais (une carte inconnue, un firmware qui ne correspond pas à la
carte, un scénario rejeté) ne coûte rien. Les minutes sont réinitialisées le premier du
mois, UTC. Votre solde, votre historique d'exécutions et vos jetons se trouvent à
[/account/ci](https://velxio.dev/account/ci) :

![La page du compte CI : minutes utilisées ce mois-ci, les jetons existants avec la date de leur dernière utilisation, et un tableau des exécutions récentes avec leur statut, les secondes simulées et facturées et le code de sortie](../../../../assets/docs/ci/account.png)

## Comment un projet se décrit

Deux fichiers dans le répertoire vers lequel vous pointez le CLI :

- `velxio.toml` — la carte et le firmware. Un `wokwi.toml` de Wokwi fonctionne aussi.
- `diagram.json` — le circuit. Le format de Wokwi, donc un diagramme existant s'exécute
  sans modification.

Ajoutez `scenario.yaml` lorsqu'une vérification série ne suffit pas : il peut attendre un texte,
envoyer un texte, attendre sur l'horloge simulée, vérifier une broche et définir un contrôle sur une
pièce. Voir [Scénarios](/docs/fr/ci/scenarios/).

## Ensuite

- [Démarrage rapide](/docs/fr/ci/quickstart/) — une première exécution réussie en cinq minutes.
- [velxio.toml](/docs/fr/ci/velxio-toml/) — chaque clé, et comment les chemins sont résolus.
- [Scénarios](/docs/fr/ci/scenarios/) — les étapes et ce qu'elles signifient.
- [GitHub Actions](/docs/fr/ci/github-action/) — l'action et ses entrées.
- [Codes de sortie](/docs/fr/ci/exit-codes/) — ce que chacun signifie pour votre tâche.
- [Venir de Wokwi CI](/docs/fr/ci/migrating-from-wokwi/) — ce qui change.
