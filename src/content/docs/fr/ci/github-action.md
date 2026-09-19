---
title: GitHub Actions
description: La velxio-ci-action - chaque entrée et sortie, avec les valeurs par défaut - et les workflows qui l'utilisent.
sidebar:
  order: 5
---

`velxio/velxio-ci-action` installe la CLI sur le runner et exécute un
projet. C'est une action composite : pas de conteneur, pas de pull Docker, et
le binaire est mis en cache entre les jobs.

```yaml
- name: Test with Velxio
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    path: firmware/blink
    timeout: 10000
    expect_text: "Hello, world!"
    fail_text: "Guru Meditation"
```

Compilez dans une étape précédente, avec la chaîne d'outils que vous utilisez
déjà. L'action n'exécute que ce qui en est issu.

## Un workflow complet

```yaml
name: firmware
on: [push, pull_request]

jobs:
  simulate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: |
          arduino-cli core install arduino:avr
          arduino-cli compile -b arduino:avr:uno --output-dir build sketch

      - name: Run it on a simulated Uno
        uses: velxio/velxio-ci-action@v1
        with:
          token: ${{ secrets.VELXIO_CLI_TOKEN }}
          path: .
          scenario: scenario.yaml
          timeout: 10000
```

Le job a besoin d'un secret, car un runner n'a pas de navigateur pour
approuver une connexion. Générez-le avec

```bash
velxio-cli login --ci --name "my-firmware"
```

qui affiche le token une seule fois, puis stockez-le comme secret de dépôt
(**Settings, Secrets and variables, Actions**). La page du compte
([velxio.dev/account/ci](https://velxio.dev/account/ci)) en génère un aussi, et
c'est là que vous révoquez l'un ou l'autre.

## Entrées

| input               | default              | meaning                                                                    |
| ------------------- | -------------------- | -------------------------------------------------------------------------- |
| `token`             | required             | votre token Velxio CI                                                      |
| `path`              | `.`                  | le répertoire du projet : `velxio.toml` (ou `wokwi.toml`) plus `diagram.json` |
| `timeout`           | `10000`              | budget de temps simulé, en millisecondes                                   |
| `expect_text`       |                      | l'exécution réussit dès que ce texte apparaît sur le port série            |
| `fail_text`         |                      | l'exécution échoue dès que ce texte apparaît sur le port série             |
| `scenario`          |                      | YAML de scénario, relatif à `path`                                         |
| `serial_log_file`   |                      | écrire chaque octet série de l'exécution ici, relatif à `path`             |
| `diagram_file`      | `diagram.json`       | le fichier de circuit, relatif à `path`                                    |
| `elf`               |                      | firmware ELF, remplaçant le fichier de configuration                       |
| `firmware`          |                      | `.hex`, `.bin`, `.uf2` ou une image ESP32 fusionnée, remplaçant le fichier de configuration |
| `screenshot_part`   |                      | id de la pièce à capturer                                                  |
| `screenshot_time`   |                      | temps simulé de la capture d'écran, en millisecondes                       |
| `screenshot_file`   | `screenshot.png`     | où l'écrire                                                                 |
| `timeout_exit_code` | `42`                 | le code de sortie de l'étape lorsque le budget est atteint                 |
| `server`            | `https://velxio.dev` | le serveur Velxio                                                          |
| `cli_version`       | `latest`             | la version de `velxio-cli` à installer, par exemple `v0.1.1`               |

Chaque entrée correspond un à un à un flag de `velxio-cli`. Tout ce que
l'action n'expose pas - `--project-file`, `--interactive`, `--json`,
`--screenshot-tolerance`, `--allow-unsupported` - est une raison d'appeler la
CLI directement dans une étape `run:` à la place.

## Sorties

| output        | value                                                         |
| ------------- | ------------------------------------------------------------- |
| `run_id`      | l'id d'exécution côté serveur                                 |
| `run_url`     | l'exécution sur la page de votre compte                       |
| `status`      | `passed`, `failed`, `timeout`, `error`, `cancelled` ou `lost` |
| `sim_time_ms` | millisecondes simulées qu'a duré l'exécution                  |

Elles sont publiées même lorsque l'exécution a échoué, afin qu'une étape
ultérieure puisse y renvoyer :

```yaml
- name: Run it
  id: sim
  continue-on-error: true
  uses: velxio/velxio-ci-action@v1
  with:
    token: ${{ secrets.VELXIO_CLI_TOKEN }}
    expect_text: "READY"

- name: Report
  run: |
    echo "status=${{ steps.sim.outputs.status }}"
    echo "run: ${{ steps.sim.outputs.run_url }}"
    echo "simulated: ${{ steps.sim.outputs.sim_time_ms }} ms"
```

Sans `continue-on-error`, une sortie non nulle de la CLI fait échouer l'étape
et le job. C'est généralement ce que vous voulez : voir
[Exit codes](/docs/fr/ci/exit-codes/) pour la signification de chaque code.

## Plusieurs cartes à la fois

Un projet par étape, ou une matrice - mais attention à la concurrence de
votre offre : Maker exécute 1 job à la fois et Pro en exécute 2. Une troisième
exécution concurrente est rejetée avec le code de sortie 4 et ne coûte rien,
donc limitez vous-même la matrice :

```yaml
jobs:
  simulate:
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 2
      matrix:
        project: [uno-ready, esp32s3-boot]
    steps:
      - uses: actions/checkout@v4
      - uses: velxio/velxio-ci-action@v1
        with:
          token: ${{ secrets.VELXIO_CLI_TOKEN }}
          path: test/ci/projects/${{ matrix.project }}
          expect_text: "READY"
```

## Runners

Les runners Linux, macOS et Windows sont pris en charge, en x64 et en ARM64
(Windows en x64 uniquement). L'action résout le tag de release, vérifie le
binaire par rapport au `SHA256SUMS` de la release, et le met en cache sous
`actions/cache` avec une clé basée sur la version et la plateforme - ainsi
seul le premier job d'une nouvelle version de la CLI télécharge quoi que ce
soit.

## Téléverser ce que l'exécution a produit

Les journaux série et les captures d'écran sont des fichiers ordinaires dans
le répertoire du projet :

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: velxio-run
    path: |
      firmware/blink/serial.log
      firmware/blink/*.png
```

avec `serial_log_file: serial.log` sur l'étape d'exécution.

## Autres systèmes de CI

Il n'y a aucune action à installer ailleurs - installez la CLI et appelez-la :

```yaml
script:
  - curl -fsSL https://velxio.dev/ci/install.sh | sh
  - ~/.velxio/bin/velxio-cli run --expect-text 'READY' --timeout 10000 .
```

avec `VELXIO_CLI_TOKEN` dans l'environnement de secrets du job. Le code de
sortie est tout le contrat, et il est identique partout.
