---
title: Códigos de salida
description: Qué devuelve velxio-cli a tu job, qué significa cada código y cuánto cuesta en minutos.
sidebar:
  order: 6
---

El código de salida es el contrato entre Velxio CI y tu job. Es estable;
los scripts pueden confiar en él.

| código | significado                                                                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`    | **Passed.** `--expect-text` coincidió, el escenario terminó, o lo único que se pidió fue una captura de pantalla y se tomó.                                                     |
| `1`    | **Failed.** Apareció `--fail-text`, un `expect-pin` no coincidió, un paso falló o el guest se bloqueó.                                                                          |
| `2`    | **Config.** Un error de uso o de lint, o el servidor rechazó la ejecución antes de que empezara. No se facturó nada.                                                            |
| `3`    | **Auth.** El token falta, está mal formado, es desconocido, fue revocado o expiró; o el plan no tiene derecho a CI.                                                             |
| `4`    | **Quota.** No quedan minutos de CI este mes, o hay más jobs a la vez de los que ejecuta tu plan. No se facturó nada.                                                            |
| `5`    | **Server or runner.** Rate limited, CI deshabilitado, ningún runner libre a tiempo, se perdió el runner, el motor se estancó, un límite de reloj de pared, un crash del renderer, una conexión caída. |
| `42`   | **The budget ran out.** Se alcanzó el presupuesto de tiempo simulado antes de cumplir la expectativa. Cámbialo con `--timeout-exit-code`.                                      |
| `130`  | **Ctrl-C.** El CLI cancela la ejecución, espera hasta 5 s el informe final y sale.                                                                                              |

`--timeout-exit-code 0` convierte el presupuesto en un final normal, que es
como dices "ejecuta durante N segundos simulados y dame el serial":

```bash
velxio-cli run --timeout 5000 --timeout-exit-code 0 --serial-log-file serial.log .
```

## Status and reason

La última línea de una ejecución nombra ambos:

```
FAIL (expect_pin_mismatch) in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 1
```

| status      | reasons                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `passed`    | `plan_complete`, `expect_text`, `screenshots_done`                                                                                             |
| `failed`    | `fail_text`, `expect_pin_mismatch`, `pin_not_connected`, `pin_unknown`, `control_unknown`, `step_failed`, `screenshot_mismatch`, `guest_crash` |
| `timeout`   | `budget_reached`                                                                                                                               |
| `error`     | `engine_stalled`, `wall_cap`, `renderer_crash`, `page_load_failed`, `runner_lost`, `no_runner`, `server_error`, `load_failed`                  |
| `cancelled` | `user`, `client_disconnected`                                                                                                                  |
| `lost`      | `heartbeat`, `api_restart`                                                                                                                     |

`screenshot_mismatch` está reservado: la comparación de capturas de pantalla
aún no está implementada, así que un `compare-with` nunca hace fallar una
ejecución hoy. Consulta
[Scenarios](/docs/es/ci/scenarios/).

Con `--json` cada línea es un objeto y la última lo lleva todo:

```json
{
  "t": "end",
  "status": "failed",
  "reason": "expect_pin_mismatch",
  "exit_code": 1
}
```

En GitHub Actions los mismos valores llegan como las salidas `status` y
`sim_time_ms` de la [action](/docs/es/ci/github-action/).

## Por qué se rechazó una ejecución (exit 2)

Estos vuelven antes de que se facture nada, cada uno con el nombre infractor
en el mensaje:

| código                                                                        | qué corregir                                                                                                                |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `unknown_board_type`                                                          | la placa no es un tipo de Velxio ni un tipo de placa que CI conozca. `velxio-cli boards`.                                   |
| `board_not_supported_in_ci`                                                   | Velxio aún no tiene simulación de CI para esa placa; el mensaje nombra la fase. Consulta la [tabla de placas](/docs/es/ci/velxio-toml/). |
| `board_not_launched`                                                          | la placa existe pero no está disponible para ejecutarse.                                                                    |
| `unsupported_part`                                                            | una parte del diagrama no se puede simular; se listan los ids.                                                              |
| `firmware_format_mismatch`                                                    | la imagen no es para ese chip - una imagen de ESP32-C3 en una placa `esp32-s3`, por ejemplo.                                |
| `firmware_too_large`, `bundle_too_large`, `blob_missing`, `blob_sha_mismatch` | supera un límite de tamaño, o una subida que no llegó intacta.                                                              |
| `scenario_invalid`                                                            | un paso es desconocido o falta un campo o no se puede parsear.                                                              |
| `scenario_part_missing`                                                       | un paso nombra un `part-id` que el circuito no tiene.                                                                       |
| `feature_unsupported`                                                         | algo que aún no está construido: `language = "micropython"`, un `[[chip]]`, un paso táctil.                                 |
| `no_sim_clock`                                                                | esa placa no tiene un reloj simulado legible, así que nada podría facturarse por tiempo simulado.                           |
| `too_many_parts`, `bad_request`                                               | supera los límites del circuito, o una petición mal formada.                                                                |

Exit 4 es `quota_exhausted` (el mensaje lleva la fecha de reinicio) o
`concurrency`. Exit 5 es `rate_limited`, `ci_disabled` o `server_error`.

Ejecuta `velxio-cli lint .` primero: detecta la mayoría de las causas de
exit 2 localmente, sin token y sin red.

## Qué cuesta cada final

Los minutos son tiempo **simulado**, redondeado hacia arriba a segundos
enteros, y nunca más que el presupuesto que reservó la ejecución.

- **Rechazada antes de empezar** (exit 2, 3, 4) - nada. La ejecución nunca
  llegó a un runner.
- **Ningún runner estaba libre** a tiempo, o la conexión se cayó antes de
  que arrancara el firmware - nada.
- **Passed, failed o timeout** - los segundos simulados transcurridos.
- **Un error de servidor o runner a mitad de ejecución** (exit 5) - solo los
  segundos simulados transcurridos, no el tiempo de reloj de pared que duró
  el intento.
- **Ctrl-C** - los segundos simulados hasta la cancelación.

Tu saldo y el status, tiempo simulado, segundos facturados y código de
salida de cada ejecución están en [velxio.dev/account/ci](https://velxio.dev/account/ci).
