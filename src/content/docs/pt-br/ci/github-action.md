---
title: GitHub Actions
description: A velxio-ci-action - todas as entradas e saídas, com os padrões - e os workflows que a utilizam.
sidebar:
  order: 5
---

`velxio/velxio-ci-action` instala a CLI no runner e executa um
projeto. É uma action composta: sem container, sem pull do Docker, e o
binário é armazenado em cache entre os jobs.

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

Compile em uma etapa anterior, com qualquer toolchain que você já use. A
action só executa o que resultou disso.

## Um workflow completo

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

O job precisa de um secret, porque um runner não tem navegador para aprovar um
login. Gere-o com

```bash
velxio-cli login --ci --name "my-firmware"
```

que imprime o token uma vez, depois armazene-o como um secret de repositório
(**Settings, Secrets and variables, Actions**). A página da conta
([velxio.dev/account/ci](https://velxio.dev/account/ci)) também gera um, e
é onde você revoga qualquer um deles.

## Entradas

| input               | default              | meaning                                                                    |
| ------------------- | -------------------- | -------------------------------------------------------------------------- |
| `token`             | required             | seu token de CI do Velxio                                                  |
| `path`              | `.`                  | o diretório do projeto: `velxio.toml` (ou `wokwi.toml`) mais `diagram.json` |
| `timeout`           | `10000`              | orçamento de tempo simulado, em milissegundos                              |
| `expect_text`       |                      | a execução passa assim que isto aparece na serial                          |
| `fail_text`         |                      | a execução falha assim que isto aparece na serial                          |
| `scenario`          |                      | YAML de cenário, relativo a `path`                                         |
| `serial_log_file`   |                      | grava cada byte da serial da execução aqui, relativo a `path`              |
| `diagram_file`      | `diagram.json`       | o arquivo do circuito, relativo a `path`                                   |
| `elf`               |                      | firmware ELF, substituindo o arquivo de configuração                       |
| `firmware`          |                      | `.hex`, `.bin`, `.uf2` ou uma imagem ESP32 mesclada, substituindo o arquivo de configuração |
| `screenshot_part`   |                      | id da peça para capturar a tela                                            |
| `screenshot_time`   |                      | tempo simulado da captura de tela, em milissegundos                        |
| `screenshot_file`   | `screenshot.png`     | onde gravá-la                                                              |
| `timeout_exit_code` | `42`                 | o código de saída da etapa quando o orçamento é atingido                   |
| `server`            | `https://velxio.dev` | o servidor Velxio                                                          |
| `cli_version`       | `latest`             | a release do `velxio-cli` a instalar, por exemplo `v0.1.1`                 |

Cada entrada mapeia um para um em uma flag do `velxio-cli`. Qualquer coisa que a action
não expõe - `--project-file`, `--interactive`, `--json`,
`--screenshot-tolerance`, `--allow-unsupported` - é um motivo para chamar a
CLI diretamente em uma etapa `run:`.

## Saídas

| output        | value                                                         |
| ------------- | ------------------------------------------------------------- |
| `run_id`      | o id da execução no lado do servidor                          |
| `run_url`     | a execução na página da sua conta                             |
| `status`      | `passed`, `failed`, `timeout`, `error`, `cancelled` ou `lost` |
| `sim_time_ms` | milissegundos simulados que a execução durou                  |

Elas são publicadas mesmo quando a execução falhou, para que uma etapa posterior possa linkar para ela:

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

Sem `continue-on-error`, uma saída diferente de zero da CLI falha a etapa e
o job. Isso geralmente é o que você quer: veja
[Códigos de saída](/docs/pt-br/ci/exit-codes/) para o que cada um significa.

## Várias placas ao mesmo tempo

Um projeto por etapa, ou uma matriz - mas atenção à concorrência do seu plano:
o Maker executa 1 job por vez e o Pro executa 2. Uma terceira execução concorrente é
rejeitada com saída 4 e não custa nada, então limite a matriz você mesmo:

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

Runners Linux, macOS e Windows são suportados, em x64 e em ARM64
(Windows apenas em x64). A action resolve a tag da release, verifica o
binário contra o `SHA256SUMS` da release, e o armazena em cache sob
`actions/cache` com chave por versão e plataforma - então apenas o primeiro job de uma
nova versão da CLI baixa algo.

## Enviando o que a execução produziu

Logs de serial e capturas de tela são arquivos comuns no diretório do projeto:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: velxio-run
    path: |
      firmware/blink/serial.log
      firmware/blink/*.png
```

com `serial_log_file: serial.log` na etapa de execução.

## Outros sistemas de CI

Não há action para instalar em nenhum outro lugar - instale a CLI e chame-a:

```yaml
script:
  - curl -fsSL https://velxio.dev/ci/install.sh | sh
  - ~/.velxio/bin/velxio-cli run --expect-text 'READY' --timeout 10000 .
```

com `VELXIO_CLI_TOKEN` no ambiente de secret do job. O código de saída é
todo o contrato, e é o mesmo em todos os lugares.
