---
title: GitHub Actions
description: The velxio-ci-action - every input and output, with defaults - and the workflows that use it.
sidebar:
  order: 5
---

`velxio/velxio-ci-action` installs the CLI on the runner and runs one
project. It is a composite action: no container, no Docker pull, and the
binary is cached between jobs.

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

Compile in an earlier step, with whatever toolchain you already use. The
action only runs what came out of it.

## A whole workflow

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

Store the token as a repository secret (**Settings, Secrets and variables,
Actions**). Mint it at
[velxio.dev/account/ci](https://velxio.dev/account/ci); it is shown once.

## Inputs

| input               | default              | meaning                                                                    |
| ------------------- | -------------------- | -------------------------------------------------------------------------- |
| `token`             | required             | your Velxio CI token                                                       |
| `path`              | `.`                  | the project directory: `velxio.toml` (or `wokwi.toml`) plus `diagram.json` |
| `timeout`           | `10000`              | simulated-time budget, in milliseconds                                     |
| `expect_text`       |                      | the run passes as soon as this appears on serial                           |
| `fail_text`         |                      | the run fails as soon as this appears on serial                            |
| `scenario`          |                      | scenario YAML, relative to `path`                                          |
| `serial_log_file`   |                      | write every serial byte of the run here, relative to `path`                |
| `diagram_file`      | `diagram.json`       | the circuit file, relative to `path`                                       |
| `elf`               |                      | ELF firmware, overriding the config file                                   |
| `firmware`          |                      | `.hex`, `.bin`, `.uf2` or a merged ESP32 image, overriding the config file |
| `screenshot_part`   |                      | part id to screenshot                                                      |
| `screenshot_time`   |                      | simulated time of the screenshot, in milliseconds                          |
| `screenshot_file`   | `screenshot.png`     | where to write it                                                          |
| `timeout_exit_code` | `42`                 | the step's exit code when the budget is reached                            |
| `server`            | `https://velxio.dev` | the Velxio server                                                          |
| `cli_version`       | `latest`             | the `velxio-cli` release to install, for example `v0.1.1`                  |

Every input maps one-to-one onto a `velxio-cli` flag. Anything the action
does not expose - `--project-file`, `--interactive`, `--json`,
`--screenshot-tolerance`, `--allow-unsupported` - is a reason to call the
CLI directly in a `run:` step instead.

## Outputs

| output        | value                                                         |
| ------------- | ------------------------------------------------------------- |
| `run_id`      | the server-side run id                                        |
| `run_url`     | the run on your account page                                  |
| `status`      | `passed`, `failed`, `timeout`, `error`, `cancelled` or `lost` |
| `sim_time_ms` | simulated milliseconds the run lasted                         |

They are published even when the run failed, so a later step can link to it:

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

Without `continue-on-error`, a non-zero exit from the CLI fails the step and
the job. That is usually what you want: see
[Exit codes](/docs/ci/exit-codes/) for what each one means.

## Several boards at once

One project per step, or a matrix - but mind your plan's concurrency:
Maker runs 1 job at a time and Pro runs 2. A third concurrent run is
rejected with exit 4 and costs nothing, so cap the matrix yourself:

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

Linux, macOS and Windows runners are supported, on x64 and on ARM64
(Windows on x64 only). The action resolves the release tag, verifies the
binary against the release's `SHA256SUMS`, and caches it under
`actions/cache` keyed by version and platform - so only the first job of a
new CLI version downloads anything.

## Uploading what the run produced

Serial logs and screenshots are ordinary files in the project directory:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: velxio-run
    path: |
      firmware/blink/serial.log
      firmware/blink/*.png
```

with `serial_log_file: serial.log` on the run step.

## Other CI systems

There is no action to install anywhere else - install the CLI and call it:

```yaml
script:
  - curl -fsSL https://velxio.dev/ci/install.sh | sh
  - ~/.velxio/bin/velxio-cli run --expect-text 'READY' --timeout 10000 .
```

with `VELXIO_CLI_TOKEN` in the job's secret environment. The exit code is
the whole contract, and it is the same everywhere.
