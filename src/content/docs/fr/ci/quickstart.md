---
title: Démarrage rapide de la CI
description: De rien à une exécution réussie en cinq minutes. Installez la CLI, écrivez deux fichiers, lancez-la.
sidebar:
  order: 2
---

Vous avez besoin d'un compte Velxio sur un plan payant et d'un fichier de firmware compilé. Le simulateur ne compile jamais rien ici : apportez le `.hex`, `.bin`, `.uf2` ou `.elf` produit par votre propre chaîne d'outils.

## 1. Installer la CLI

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
```

Elle dépose un binaire unique dans `~/.velxio/bin` et vous indique comment l'ajouter à votre `PATH`. Windows : `iwr https://velxio.dev/ci/install.ps1 -useb | iex`. Les binaires se trouvent sur la [page des releases](https://github.com/velxio/velxio-cli/releases) si vous préférez en récupérer un vous-même.

## 2. Se connecter

```bash
velxio-cli login
```

Elle affiche un code court, ouvre votre navigateur et attend. Approuvez la demande et la CLI stocke ce qui lui est fourni, ainsi vous ne manipulez jamais de jeton sur votre propre machine.

```
code     7XJ6-33M5
approve  https://velxio.dev/account/ci/device?code=7XJ6-33M5
waiting for approval of 7XJ6-33M5 (the code expires in 10 min)
signed in as velxio-cli on laptop
```

La page montre ce qui fait la demande, depuis quelle machine et pour quoi, avant que vous n'approuviez quoi que ce soit :

![La page du navigateur qui approuve une connexion CLI : elle nomme l'outil, la machine sur laquelle il s'exécute et ce qu'il demande, avec les boutons Approve et Deny](../../../../assets/docs/ci/device-approve.png)

Une tâche de CI n'a pas de navigateur, elle porte donc un secret à la place. Le même flux le génère, nommé d'après le dépôt qui le contiendra :

```bash
velxio-cli login --ci --name "my-firmware"
```

Celui-ci affiche le jeton une seule fois. Stockez-le comme secret de dépôt (dans GitHub : Settings, Secrets and variables, Actions) et jamais dans le dépôt lui-même. Les deux types apparaissent sur [velxio.dev/account/ci](https://velxio.dev/account/ci), où vous pouvez révoquer l'un ou l'autre.

## 3. Décrire le projet

Deux fichiers à côté de votre firmware. `velxio-cli init` écrit une paire de départ, ou écrivez-les à la main :

```toml
# velxio.toml
[velxio]
version = 1
board = "esp32-s3"
firmware = "build/blink.bin"
```

```json
{
  "version": 1,
  "parts": [
    { "type": "board-esp32-s3-devkitc-1", "id": "esp", "top": 0, "left": 0 },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 0,
      "left": 120,
      "attrs": { "color": "red" }
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": 60,
      "left": 60,
      "attrs": { "value": "220" }
    }
  ],
  "connections": [
    ["esp:2", "r1:1", "green", []],
    ["r1:2", "led1:A", "green", []],
    ["led1:C", "esp:GND.1", "black", []]
  ]
}
```

C'est le format `diagram.json` de Wokwi, donc un diagramme existant fonctionne tel quel.

## 4. Le lancer

```bash
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

Le firmware démarre, la sortie série apparaît au fur et à mesure, et la commande se termine avec le code 0 dès que le texte apparaît, ou 42 lorsque les dix secondes simulées s'écoulent sans lui.

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 3 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## 5. L'intégrer à la CI

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
```

Compilez lors d'une étape précédente ; celle-ci ne fait qu'exécuter ce que vous avez construit.

## Quand cela ne fonctionne pas

- **`exit 2` avant que quoi que ce soit ne s'exécute.** Un problème de configuration : la carte n'est pas une carte que Velxio exécute, le firmware ne correspond pas à la carte, ou le scénario comporte une étape nommant un composant absent de votre diagramme. Rien n'a été facturé. `velxio-cli lint .` détecte la plupart de ces cas sans jeton et sans réseau.
- **`exit 3`.** Le jeton est manquant, révoqué ou appartient à un plan sans CI.
- **`exit 4`.** Plus de minutes disponibles ce mois-ci, ou plus de tâches simultanées que ce que votre plan exécute.
- **Le texte n'arrive jamais.** Augmentez `--timeout`, puis exécutez sans aucune attente (`velxio-cli run --timeout 5000 .`) pour lire ce que le firmware affiche réellement.
