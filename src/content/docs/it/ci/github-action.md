---
title: GitHub Actions
description: La velxio-ci-action - ogni input e output, con i valori predefiniti - e i workflow che la utilizzano.
sidebar:
  order: 5
---

`velxio/velxio-ci-action` installa la CLI sul runner ed esegue un
progetto. È una composite action: nessun container, nessun pull Docker, e il
binario viene messo in cache tra i job.

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

Compila in uno step precedente, con qualunque toolchain tu già utilizzi. La
action esegue solo ciò che ne è risultato.

## Un workflow completo

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

Il job necessita di un secret, perché un runner non ha un browser per approvare un
accesso. Generane uno con

```bash
velxio-cli login --ci --name "my-firmware"
```

che stampa il token una sola volta, poi salvalo come secret del repository
(**Settings, Secrets and variables, Actions**). Anche la pagina dell'account
([velxio.dev/account/ci](https://velxio.dev/account/ci)) ne genera uno, ed
è il luogo dove revocare l'uno o l'altro.

## Input

| input               | default              | significato                                                                |
| ------------------- | -------------------- | -------------------------------------------------------------------------- |
| `token`             | richiesto            | il tuo token Velxio CI                                                     |
| `path`              | `.`                  | la directory del progetto: `velxio.toml` (o `wokwi.toml`) più `diagram.json` |
| `timeout`           | `10000`              | budget di tempo simulato, in millisecondi                                  |
| `expect_text`       |                      | l'esecuzione passa non appena questo appare sulla seriale                  |
| `fail_text`         |                      | l'esecuzione fallisce non appena questo appare sulla seriale               |
| `scenario`          |                      | scenario YAML, relativo a `path`                                           |
| `serial_log_file`   |                      | scrivi qui ogni byte seriale dell'esecuzione, relativo a `path`            |
| `diagram_file`      | `diagram.json`       | il file del circuito, relativo a `path`                                    |
| `elf`               |                      | firmware ELF, che sovrascrive il file di configurazione                     |
| `firmware`          |                      | `.hex`, `.bin`, `.uf2` o un'immagine ESP32 unita, che sovrascrive il file di configurazione |
| `screenshot_part`   |                      | id della parte da catturare                                                |
| `screenshot_time`   |                      | tempo simulato dello screenshot, in millisecondi                           |
| `screenshot_file`   | `screenshot.png`     | dove scriverlo                                                             |
| `timeout_exit_code` | `42`                 | il codice di uscita dello step quando il budget viene raggiunto            |
| `server`            | `https://velxio.dev` | il server Velxio                                                           |
| `cli_version`       | `latest`             | la release di `velxio-cli` da installare, per esempio `v0.1.1`             |

Ogni input corrisponde uno a uno a un flag di `velxio-cli`. Tutto ciò che la action
non espone - `--project-file`, `--interactive`, `--json`,
`--screenshot-tolerance`, `--allow-unsupported` - è un motivo per chiamare la
CLI direttamente in uno step `run:`.

## Output

| output        | valore                                                        |
| ------------- | ------------------------------------------------------------- |
| `run_id`      | l'id dell'esecuzione lato server                              |
| `run_url`     | l'esecuzione sulla pagina del tuo account                     |
| `status`      | `passed`, `failed`, `timeout`, `error`, `cancelled` o `lost`  |
| `sim_time_ms` | millisecondi simulati di durata dell'esecuzione               |

Vengono pubblicati anche quando l'esecuzione è fallita, così uno step successivo può collegarli:

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

Senza `continue-on-error`, un'uscita non zero dalla CLI fa fallire lo step e
il job. Di solito è ciò che vuoi: vedi
[Codici di uscita](/docs/it/ci/exit-codes/) per il significato di ciascuno.

## Più schede contemporaneamente

Un progetto per step, oppure una matrice - ma attenzione alla concorrenza del tuo piano:
Maker esegue 1 job alla volta e Pro ne esegue 2. Una terza esecuzione concorrente viene
rifiutata con exit 4 e non costa nulla, quindi limita tu stesso la matrice:

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

I runner Linux, macOS e Windows sono supportati, su x64 e su ARM64
(Windows solo su x64). La action risolve il tag della release, verifica il
binario rispetto al file `SHA256SUMS` della release, e lo mette in cache sotto
`actions/cache` con chiave basata su versione e piattaforma - quindi solo il primo job di una
nuova versione della CLI scarica qualcosa.

## Caricare ciò che l'esecuzione ha prodotto

I log seriali e gli screenshot sono file ordinari nella directory del progetto:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: velxio-run
    path: |
      firmware/blink/serial.log
      firmware/blink/*.png
```

con `serial_log_file: serial.log` sullo step di esecuzione.

## Altri sistemi CI

Non c'è nessuna action da installare altrove - installa la CLI e chiamala:

```yaml
script:
  - curl -fsSL https://velxio.dev/ci/install.sh | sh
  - ~/.velxio/bin/velxio-cli run --expect-text 'READY' --timeout 10000 .
```

con `VELXIO_CLI_TOKEN` nell'ambiente dei secret del job. Il codice di uscita è
l'intero contratto, ed è lo stesso ovunque.
