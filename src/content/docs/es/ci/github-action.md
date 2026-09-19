---
title: GitHub Actions
description: La velxio-ci-action - cada entrada y salida, con sus valores predeterminados - y los flujos de trabajo que la usan.
sidebar:
  order: 5
---

`velxio/velxio-ci-action` instala la CLI en el runner y ejecuta un
proyecto. Es una acción compuesta: sin contenedor, sin descarga de Docker, y
el binario se almacena en caché entre trabajos.

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

Compila en un paso anterior, con la cadena de herramientas que ya uses. La
acción solo ejecuta lo que resultó de ese paso.

## Un flujo de trabajo completo

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

El trabajo necesita un secreto, porque un runner no tiene navegador para aprobar
un inicio de sesión. Genéralo con

```bash
velxio-cli login --ci --name "my-firmware"
```

que imprime el token una sola vez, y luego guárdalo como secreto del repositorio
(**Settings, Secrets and variables, Actions**). La página de la cuenta
([velxio.dev/account/ci](https://velxio.dev/account/ci)) también genera uno, y
es donde revocas cualquiera de los dos.

## Entradas

| input               | default              | meaning                                                                    |
| ------------------- | -------------------- | -------------------------------------------------------------------------- |
| `token`             | required             | tu token de Velxio CI                                                      |
| `path`              | `.`                  | el directorio del proyecto: `velxio.toml` (o `wokwi.toml`) más `diagram.json` |
| `timeout`           | `10000`              | presupuesto de tiempo simulado, en milisegundos                            |
| `expect_text`       |                      | la ejecución pasa en cuanto esto aparece en el serial                      |
| `fail_text`         |                      | la ejecución falla en cuanto esto aparece en el serial                     |
| `scenario`          |                      | YAML de escenario, relativo a `path`                                       |
| `serial_log_file`   |                      | escribe cada byte del serial de la ejecución aquí, relativo a `path`       |
| `diagram_file`      | `diagram.json`       | el archivo del circuito, relativo a `path`                                 |
| `elf`               |                      | firmware ELF, que anula el archivo de configuración                        |
| `firmware`          |                      | `.hex`, `.bin`, `.uf2` o una imagen ESP32 combinada, que anula el archivo de configuración |
| `screenshot_part`   |                      | id de la pieza a capturar                                                  |
| `screenshot_time`   |                      | tiempo simulado de la captura, en milisegundos                             |
| `screenshot_file`   | `screenshot.png`     | dónde escribirla                                                           |
| `timeout_exit_code` | `42`                 | el código de salida del paso cuando se alcanza el presupuesto              |
| `server`            | `https://velxio.dev` | el servidor de Velxio                                                      |
| `cli_version`       | `latest`             | la versión de `velxio-cli` a instalar, por ejemplo `v0.1.1`                |

Cada entrada se corresponde uno a uno con un flag de `velxio-cli`. Todo lo que la
acción no expone - `--project-file`, `--interactive`, `--json`,
`--screenshot-tolerance`, `--allow-unsupported` - es motivo para llamar a la
CLI directamente en un paso `run:` en su lugar.

## Salidas

| output        | value                                                         |
| ------------- | ------------------------------------------------------------- |
| `run_id`      | el id de la ejecución del lado del servidor                   |
| `run_url`     | la ejecución en la página de tu cuenta                        |
| `status`      | `passed`, `failed`, `timeout`, `error`, `cancelled` o `lost`  |
| `sim_time_ms` | milisegundos simulados que duró la ejecución                  |

Se publican incluso cuando la ejecución falló, así que un paso posterior puede enlazarla:

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

Sin `continue-on-error`, una salida distinta de cero de la CLI hace fallar el paso y
el trabajo. Normalmente eso es lo que quieres: consulta
[Códigos de salida](/docs/es/ci/exit-codes/) para saber qué significa cada uno.

## Varias placas a la vez

Un proyecto por paso, o una matriz - pero ten en cuenta la concurrencia de tu plan:
Maker ejecuta 1 trabajo a la vez y Pro ejecuta 2. Una tercera ejecución concurrente
se rechaza con salida 4 y no cuesta nada, así que limita la matriz tú mismo:

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

Se admiten runners de Linux, macOS y Windows, en x64 y en ARM64
(Windows solo en x64). La acción resuelve la etiqueta de la versión, verifica el
binario contra el `SHA256SUMS` de la versión, y lo almacena en caché bajo
`actions/cache` con clave por versión y plataforma - así que solo el primer trabajo de una
nueva versión de la CLI descarga algo.

## Subir lo que produjo la ejecución

Los registros de serial y las capturas son archivos normales en el directorio del proyecto:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: velxio-run
    path: |
      firmware/blink/serial.log
      firmware/blink/*.png
```

con `serial_log_file: serial.log` en el paso de ejecución.

## Otros sistemas de CI

No hay ninguna acción que instalar en ningún otro sitio - instala la CLI y llámala:

```yaml
script:
  - curl -fsSL https://velxio.dev/ci/install.sh | sh
  - ~/.velxio/bin/velxio-cli run --expect-text 'READY' --timeout 10000 .
```

con `VELXIO_CLI_TOKEN` en el entorno de secretos del trabajo. El código de salida es
todo el contrato, y es el mismo en todas partes.
