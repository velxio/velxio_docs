---
title: GitHub Actions
description: Die velxio-ci-action - jeder Input und Output mit Standardwerten - und die Workflows, die sie verwenden.
sidebar:
  order: 5
---

`velxio/velxio-ci-action` installiert die CLI auf dem Runner und führt ein
Projekt aus. Sie ist eine Composite Action: kein Container, kein Docker-Pull,
und die Binary wird zwischen Jobs gecacht.

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

Kompiliere in einem früheren Schritt, mit welcher Toolchain du auch immer
bereits verwendest. Die Action führt nur aus, was dabei herausgekommen ist.

## Ein kompletter Workflow

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

Der Job benötigt ein Secret, weil ein Runner keinen Browser hat, um eine
Anmeldung zu bestätigen. Erzeuge es mit

```bash
velxio-cli login --ci --name "my-firmware"
```

was das Token einmal ausgibt; speichere es dann als Repository-Secret
(**Settings, Secrets and variables, Actions**). Die Kontoseite
([velxio.dev/account/ci](https://velxio.dev/account/ci)) erzeugt ebenfalls
eines und ist auch der Ort, an dem du beide widerrufen kannst.

## Inputs

| input               | default              | meaning                                                                    |
| ------------------- | -------------------- | -------------------------------------------------------------------------- |
| `token`             | required             | dein Velxio CI-Token                                                       |
| `path`              | `.`                  | das Projektverzeichnis: `velxio.toml` (oder `wokwi.toml`) plus `diagram.json` |
| `timeout`           | `10000`              | Budget in simulierter Zeit, in Millisekunden                               |
| `expect_text`       |                      | der Lauf gilt als bestanden, sobald dies auf der seriellen Schnittstelle erscheint |
| `fail_text`         |                      | der Lauf schlägt fehl, sobald dies auf der seriellen Schnittstelle erscheint |
| `scenario`          |                      | Szenario-YAML, relativ zu `path`                                           |
| `serial_log_file`   |                      | schreibe jedes serielle Byte des Laufs hierhin, relativ zu `path`          |
| `diagram_file`      | `diagram.json`       | die Schaltungsdatei, relativ zu `path`                                     |
| `elf`               |                      | ELF-Firmware, überschreibt die Konfigurationsdatei                         |
| `firmware`          |                      | `.hex`, `.bin`, `.uf2` oder ein zusammengeführtes ESP32-Image, überschreibt die Konfigurationsdatei |
| `screenshot_part`   |                      | Part-ID für den Screenshot                                                 |
| `screenshot_time`   |                      | simulierter Zeitpunkt des Screenshots, in Millisekunden                    |
| `screenshot_file`   | `screenshot.png`     | wohin er geschrieben werden soll                                           |
| `timeout_exit_code` | `42`                 | der Exit-Code des Schritts, wenn das Budget erreicht ist                   |
| `server`            | `https://velxio.dev` | der Velxio-Server                                                          |
| `cli_version`       | `latest`             | das zu installierende `velxio-cli`-Release, zum Beispiel `v0.1.1`          |

Jeder Input entspricht eins zu eins einem `velxio-cli`-Flag. Alles, was die
Action nicht bereitstellt - `--project-file`, `--interactive`, `--json`,
`--screenshot-tolerance`, `--allow-unsupported` - ist ein Grund, die CLI
stattdessen direkt in einem `run:`-Schritt aufzurufen.

## Outputs

| output        | value                                                         |
| ------------- | ------------------------------------------------------------- |
| `run_id`      | die serverseitige Run-ID                                      |
| `run_url`     | der Lauf auf deiner Kontoseite                                |
| `status`      | `passed`, `failed`, `timeout`, `error`, `cancelled` oder `lost` |
| `sim_time_ms` | simulierte Millisekunden, die der Lauf gedauert hat           |

Sie werden auch dann veröffentlicht, wenn der Lauf fehlgeschlagen ist, sodass
ein späterer Schritt darauf verlinken kann:

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

Ohne `continue-on-error` lässt ein Exit-Code ungleich null von der CLI den
Schritt und den Job fehlschlagen. Das ist normalerweise, was du willst:
siehe [Exit codes](/docs/de/ci/exit-codes/) für die Bedeutung der einzelnen
Codes.

## Mehrere Boards gleichzeitig

Ein Projekt pro Schritt oder eine Matrix - aber beachte die Nebenläufigkeit
deines Plans: Maker führt 1 Job gleichzeitig aus und Pro 2. Ein dritter
gleichzeitiger Lauf wird mit Exit 4 abgelehnt und kostet nichts, also
begrenze die Matrix selbst:

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

## Runner

Linux-, macOS- und Windows-Runner werden unterstützt, auf x64 und auf ARM64
(Windows nur auf x64). Die Action ermittelt das Release-Tag, verifiziert die
Binary gegen die `SHA256SUMS` des Releases und cached sie unter
`actions/cache`, verschlüsselt nach Version und Plattform - sodass nur der
erste Job einer neuen CLI-Version etwas herunterlädt.

## Hochladen, was der Lauf erzeugt hat

Serielle Logs und Screenshots sind gewöhnliche Dateien im Projektverzeichnis:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: velxio-run
    path: |
      firmware/blink/serial.log
      firmware/blink/*.png
```

mit `serial_log_file: serial.log` im Run-Schritt.

## Andere CI-Systeme

Es gibt keine Action, die man anderswo installieren könnte - installiere die
CLI und rufe sie auf:

```yaml
script:
  - curl -fsSL https://velxio.dev/ci/install.sh | sh
  - ~/.velxio/bin/velxio-cli run --expect-text 'READY' --timeout 10000 .
```

mit `VELXIO_CLI_TOKEN` in der Secret-Umgebung des Jobs. Der Exit-Code ist
der ganze Vertrag, und er ist überall derselbe.
