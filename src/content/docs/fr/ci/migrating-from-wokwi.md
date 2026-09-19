---
title: Venir de Wokwi CI
description: Ce qui change lorsqu'une tâche wokwi-cli passe à Velxio CI - la ligne uses, le nom du secret - et ce qui ne change pas.
sidebar:
  order: 7
---

Velxio CI lit les fichiers qu'un projet Wokwi CI possède déjà : `wokwi.toml`,
`diagram.json` et le YAML de scénario de Wokwi. Aucun code de Wokwi n'est
impliqué ; nos propres analyseurs lisent ces formats. En pratique, la migration
se fait en deux lignes.

```diff
-      - uses: wokwi/wokwi-ci-action@v1
+      - uses: velxio/velxio-ci-action@v1
         with:
-          token: ${{ secrets.WOKWI_CLI_TOKEN }}
+          token: ${{ secrets.VELXIO_CLI_TOKEN }}
           path: /
           timeout: 10000
           expect_text: 'Hello, World!'
           fail_text: 'Error'
           scenario: 'test.scenario.yaml'
```

Les entrées de l'action conservent volontairement leurs noms : `path`, `timeout`,
`expect_text`, `fail_text`, `scenario`, `serial_log_file`, `diagram_file`,
`elf`. Obtenez le secret avec `velxio-cli login --ci --name "<repo>"` (il
s'approuve dans le navigateur et affiche le jeton une seule fois) et stockez-le
comme secret de dépôt. Liste complète dans [GitHub Actions](/docs/fr/ci/github-action/).

## En ligne de commande

Les options de `wokwi-cli` existent sous les mêmes noms : `--elf`,
`--diagram-file`, `--scenario`, `--expect-text`, `--fail-text`,
`--timeout`, `--timeout-exit-code`, `--interactive`, `--serial-log-file`,
`--screenshot-part`, `--screenshot-time`, `--screenshot-file`, `--quiet`.
`--timeout` correspond à des millisecondes simulées dans les deux cas.

`WOKWI_CLI_TOKEN` n'est jamais lu. Définissez `VELXIO_CLI_TOKEN` (ou
`VELXIO_CI_TOKEN`), ou exécutez `velxio-cli login` une fois.

## wokwi.toml

Lu tel quel - vous n'avez pas à le renommer en `velxio.toml` :

```toml
[wokwi]
version = 1
firmware = "build/firmware.bin"   # used
elf = "build/firmware.elf"        # used when firmware is absent (AVR, RP2040)
gdbServerPort = 3333              # warning: not supported
rfc2217ServerPort = 4000          # warning: not supported
vcdFile = "trace.vcd"             # warning: not supported

[[net.forward]]                   # warning: CI runs have no network
from = "localhost:8080"
to = "target:80"

[[chip]]                          # refused: custom chips do not run in CI yet
name = "inverter"
binary = "chips/inverter.chip.wasm"
```

Les clés non prises en charge sont signalées par leur nom. Ce sont des
avertissements, pas des omissions silencieuses - sauf `[[chip]]`, qui arrête
l'exécution pour que vous n'obteniez jamais un succès à partir d'un circuit
auquel manque la puce testée. Il n'y a aujourd'hui ni serveur GDB, ni port
RFC2217, ni export VCD, ni redirection réseau dans Velxio CI.

Les clés ajoutées par Velxio - `board`, `diagram`, `project`, `scenario`,
`flasher_args` - se trouvent sous `[velxio]`. Voir
[velxio.toml](/docs/fr/ci/velxio-toml/).

## Cartes

Les types de composants Wokwi correspondent aux kinds Velxio. Ceux-ci
fonctionnent aujourd'hui :

| Type `diagram.json` Wokwi | Kind Velxio |
| ------------------------- | ----------- |
| `wokwi-arduino-uno` | `arduino-uno` |
| `wokwi-arduino-nano` | `arduino-nano` |
| `wokwi-arduino-mega` | `arduino-mega` |
| `wokwi-attiny85` | `attiny85` |
| `wokwi-pi-pico`, `board-pi-pico`, `wokwi-raspberry-pi-pico` | `raspberry-pi-pico` |
| `board-pi-pico-w` | `pi-pico-w` (no network in CI: warning) |
| `wokwi-esp32-devkit-v1`, `board-esp32-devkit-v1` | `esp32` |
| `board-esp32-s3-devkitc-1` | `esp32-s3` |
| `board-esp32-c3-devkitm-1` | `esp32-c3` |
| `board-esp32-c6-devkitc-1` | `esp32-c6` |
| `board-esp32-devkit-c-v4` | `esp32-devkit-c-v4` |
| `board-esp32-cam` | `esp32-cam` |
| `board-wemos-lolin32-lite` | `wemos-lolin32-lite` |
| `board-xiao-esp32-s3` | `xiao-esp32-s3` |
| `board-arduino-nano-esp32` | `arduino-nano-esp32` |
| `board-xiao-esp32-c3` | `xiao-esp32-c3` |
| `board-aitewinrobot-esp32c3-supermini` | `aitewinrobot-esp32c3-supermini` |
| `board-xiao-esp32-c6` | `xiao-esp32c6` |
| `board-esp32-p4-function-ev` | `esp32-p4` |
| `board-velxio-<kind>` | any board CI runs, written the Velxio way |

Velxio exécute trente-six cartes en CI, et la plupart sont des cartes pour
lesquelles Wokwi n'a pas de type — la famille RP2350, les cartes XIAO ARM, les
kits M5Stack et Seeed. Écrivez celles-ci sous la forme `board-velxio-<kind>` ;
la liste complète se trouve dans le
[tableau des cartes](/docs/fr/ci/velxio-toml/).

Toute autre carte Wokwi échoue avant le début de l'exécution, avec
`board_not_supported_in_ci` ou `unknown_board_type`, le type nommé, et la
phase où elle est prévue. Cela inclut `board-pi-pico-2` et `-2w`, les cartes
STM32, les Nucleos, les cartes ESP32-S2/H2/C61, le kit de développement
ESP32-P4 preview et les kits d'affichage. Une carte Velxio proche n'est
suggérée que lorsqu'elle fonctionne aujourd'hui, et elle n'est jamais
substituée à votre place. Rien n'est facturé pour un refus.

`velxio-cli boards` affiche la liste à jour avec le statut de chaque carte.

## Scénarios

Le YAML de scénario de Wokwi s'exécute sans modification : `delay`, `wait-serial`,
`write-serial`, `expect-pin`, `set-control`, `take-screenshot`, avec les
mêmes noms de champs (`part-id`, `save-to`, `compare-with`, `value`). Toute la
temporalité est du temps simulé, comme sur Wokwi. Deux différences :

- **Les étapes tactiles** (`touch-press`, `touch-move`, `touch-release`) ne sont pas
  implémentées ; la CLI les refuse au moment du lint.
- **`compare-with` est capturé mais pas comparé** pour l'instant : vous obtenez le PNG et un
  avertissement, et l'exécution n'échoue pas pour autant.

Détails dans [Scénarios](/docs/fr/ci/scenarios/).

## Firmware

La CLI transforme ce que votre chaîne d'outils a produit en ce que le moteur de la carte
charge :

- Les dossiers « Export compiled binary » d'Arduino ESP32 fonctionnent : `<sketch>.ino.bin`
  est fusionné avec `<sketch>.ino.bootloader.bin` et
  `<sketch>.ino.partitions.bin` (plus `boot_app0.bin` lorsqu'il est présent).
- Les `firmware.bin` + `bootloader.bin` + `partitions.bin` de PlatformIO fusionnent
  de la même manière. Les projets ESP-IDF peuvent pointer `flasher_args` vers
  `build/flasher_args.json` à la place.
- Un `app.bin` ESP32 seul, sans fichiers frères, est refusé, avec
  l'indication `esptool.py merge_bin`.
- Les `.uf2` et `.elf` Pico sont aplatis en une image flash ; un `.elf` AVR
  devient de l'Intel HEX.
- L'identifiant de puce du bootloader doit correspondre à la carte : une image ESP32-C3 sur une
  carte `esp32-s3` donne `firmware_format_mismatch`, code de sortie 2.

MicroPython n'est pas pris en charge : la CI exécute du firmware compilé, et
`language = "micropython"` est refusé plutôt qu'exécuté comme autre chose.

## Facturation

Les minutes correspondent au temps simulé, arrondi à la seconde supérieure, par mois
calendaire (UTC) : 200 par mois en Maker, 2 000 en Pro. Une exécution refusée avant son
démarrage ne coûte rien, et un moteur bloqué ou un plafond de temps réel ne coûte que
les secondes simulées qui s'étaient écoulées. Voir
[Codes de sortie](/docs/fr/ci/exit-codes/) pour le tableau complet.

## Essayez-le sur un projet que vous avez déjà

```bash
velxio-cli lint .        # no token, no network: does Velxio understand this project?
export VELXIO_CLI_TOKEN=vlxci_...
velxio-cli run --scenario test.scenario.yaml --timeout 10000 .
```

Si `lint` ne signale rien, l'exécution atteindra une carte.
