---
title: Códigos de saída
description: O que o velxio-cli retorna para o seu job, o que cada código significa e quanto custa em minutos.
sidebar:
  order: 6
---

O código de saída é o contrato entre o Velxio CI e o seu job. Ele é estável;
scripts podem depender dele.

| código | significado                                                                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`    | **Passou.** O `--expect-text` correspondeu, o cenário terminou, ou a única coisa solicitada era uma captura de tela e ela foi tirada.                                            |
| `1`    | **Falhou.** O `--fail-text` apareceu, um `expect-pin` não correspondeu, um passo falhou ou o guest travou.                                                                       |
| `2`    | **Config.** Um erro de uso ou de lint, ou o servidor recusou a execução antes de ela começar. Nada foi cobrado.                                                                  |
| `3`    | **Auth.** O token está ausente, malformado, desconhecido, revogado ou expirado; ou o plano não tem direito a CI.                                                                 |
| `4`    | **Quota.** Não há mais minutos de CI neste mês, ou há mais jobs ao mesmo tempo do que o seu plano executa. Nada foi cobrado.                                                     |
| `5`    | **Servidor ou runner.** Rate limit, CI desabilitado, nenhum runner livre a tempo, o runner foi perdido, o engine travou, um limite de wall-clock, um crash do renderer, uma conexão perdida. |
| `42`   | **O orçamento acabou.** O orçamento de tempo simulado foi atingido antes de a expectativa ser satisfeita. Altere-o com `--timeout-exit-code`.                                    |
| `130`  | **Ctrl-C.** O CLI cancela a execução, espera até 5 s pelo relatório final e sai.                                                                                                 |

`--timeout-exit-code 0` transforma o orçamento em um término normal, que é como
você diz "execute por N segundos simulados e me dê o serial":

```bash
velxio-cli run --timeout 5000 --timeout-exit-code 0 --serial-log-file serial.log .
```

## Status e motivo

A última linha de uma execução nomeia ambos:

```
FAIL (expect_pin_mismatch) in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 1
```

| status      | motivos                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `passed`    | `plan_complete`, `expect_text`, `screenshots_done`                                                                                             |
| `failed`    | `fail_text`, `expect_pin_mismatch`, `pin_not_connected`, `pin_unknown`, `control_unknown`, `step_failed`, `screenshot_mismatch`, `guest_crash` |
| `timeout`   | `budget_reached`                                                                                                                               |
| `error`     | `engine_stalled`, `wall_cap`, `renderer_crash`, `page_load_failed`, `runner_lost`, `no_runner`, `server_error`, `load_failed`                  |
| `cancelled` | `user`, `client_disconnected`                                                                                                                  |
| `lost`      | `heartbeat`, `api_restart`                                                                                                                     |

`screenshot_mismatch` é reservado: a comparação de capturas de tela ainda não
está implementada, então um `compare-with` nunca faz uma execução falhar hoje. Veja
[Cenários](/docs/pt-br/ci/scenarios/).

Com `--json` cada linha é um objeto e a última carrega tudo:

```json
{
  "t": "end",
  "status": "failed",
  "reason": "expect_pin_mismatch",
  "exit_code": 1
}
```

No GitHub Actions os mesmos valores chegam como as saídas `status` e `sim_time_ms`
da [action](/docs/pt-br/ci/github-action/).

## Por que uma execução foi recusada (exit 2)

Estes retornam antes de qualquer cobrança, cada um com o nome ofensor na
mensagem:

| código                                                                        | o que corrigir                                                                                                              |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `unknown_board_type`                                                          | a placa não é um tipo Velxio nem um tipo de placa que o CI conhece. `velxio-cli boards`.                                    |
| `board_not_supported_in_ci`                                                   | o Velxio ainda não tem simulação de CI para essa placa; a mensagem nomeia a fase. Veja a [tabela de placas](/docs/pt-br/ci/velxio-toml/). |
| `board_not_launched`                                                          | a placa existe mas não está disponível para execução.                                                                       |
| `unsupported_part`                                                            | um componente no diagrama não pode ser simulado; os ids são listados.                                                       |
| `firmware_format_mismatch`                                                    | a imagem não é para esse chip - uma imagem ESP32-C3 em uma placa `esp32-s3`, por exemplo.                                   |
| `firmware_too_large`, `bundle_too_large`, `blob_missing`, `blob_sha_mismatch` | acima de um limite de tamanho, ou um upload que não chegou intacto.                                                          |
| `scenario_invalid`                                                            | um passo é desconhecido ou um campo está ausente ou não pode ser analisado.                                                 |
| `scenario_part_missing`                                                       | um passo nomeia um `part-id` que o circuito não possui.                                                                     |
| `feature_unsupported`                                                         | algo ainda não construído: `language = "micropython"`, um `[[chip]]`, um passo de toque.                                    |
| `no_sim_clock`                                                                | essa placa não tem um relógio simulado legível, então nada pôde ser cobrado por tempo simulado.                             |
| `too_many_parts`, `bad_request`                                               | acima dos limites do circuito, ou uma requisição malformada.                                                                |

Exit 4 é `quota_exhausted` (a mensagem carrega a data de reset) ou
`concurrency`. Exit 5 é `rate_limited`, `ci_disabled` ou `server_error`.

Execute `velxio-cli lint .` primeiro: ele captura a maioria das causas de exit 2 localmente, com
nenhum token e nenhuma rede.

## Quanto custa cada término

Os minutos são tempo **simulado**, arredondado para segundos inteiros, e nunca mais
do que o orçamento que a execução reservou.

- **Recusado antes de começar** (exit 2, 3, 4) - nada. A execução nunca
  chegou a um runner.
- **Nenhum runner estava livre** a tempo, ou a conexão caiu antes de o
  firmware iniciar - nada.
- **Passou, falhou ou expirou** - os segundos simulados que decorreram.
- **Um erro de servidor ou runner no meio da execução** (exit 5) - apenas os segundos simulados
  que haviam decorrido, não o tempo de wall-clock que a tentativa levou.
- **Ctrl-C** - os segundos simulados até o cancelamento.

Seu saldo e o status de cada execução, tempo simulado, segundos cobrados e código
de saída estão em [velxio.dev/account/ci](https://velxio.dev/account/ci).
