---
title: Codici di uscita
description: Cosa restituisce velxio-cli al tuo job, cosa significa ogni codice e quanto costa in minuti.
sidebar:
  order: 6
---

Il codice di uscita è il contratto tra Velxio CI e il tuo job. È stabile;
gli script possono farci affidamento.

| code  | significato                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`   | **Passed.** `--expect-text` ha trovato corrispondenza, lo scenario è terminato, oppure l'unica cosa richiesta era uno screenshot ed è stato acquisito.                                                  |
| `1`   | **Failed.** È comparso `--fail-text`, un `expect-pin` non ha trovato corrispondenza, uno step è fallito o il guest è andato in crash.                                                                     |
| `2`   | **Config.** Un errore di utilizzo o di lint, oppure il server ha rifiutato l'esecuzione prima che iniziasse. Nulla è stato addebitato.                                                                     |
| `3`   | **Auth.** Il token è mancante, malformato, sconosciuto, revocato o scaduto; oppure il piano non ha diritto a CI.                                                                  |
| `4`   | **Quota.** Non restano minuti CI per questo mese, oppure ci sono più job contemporanei di quanti ne esegua il tuo piano. Nulla è stato addebitato.                                                                     |
| `5`   | **Server o runner.** Rate limit, CI disabilitata, nessun runner libero in tempo, il runner è stato perso, il motore si è bloccato, un limite di wall-clock, un crash del renderer, una connessione caduta. |
| `42`  | **Il budget è esaurito.** Il budget di tempo simulato è stato raggiunto prima che l'aspettativa fosse soddisfatta. Cambialo con `--timeout-exit-code`.                                         |
| `130` | **Ctrl-C.** La CLI annulla l'esecuzione, attende fino a 5 s il report finale ed esce.                                                                                        |

`--timeout-exit-code 0` trasforma il budget in una normale conclusione, che è
il modo per dire "esegui per N secondi simulati e dammi la seriale":

```bash
velxio-cli run --timeout 5000 --timeout-exit-code 0 --serial-log-file serial.log .
```

## Status e reason

L'ultima riga di un'esecuzione li nomina entrambi:

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

`screenshot_mismatch` è riservato: il confronto degli screenshot non è ancora
implementato, quindi un `compare-with` oggi non fa mai fallire un'esecuzione. Vedi
[Scenari](/docs/it/ci/scenarios/).

Con `--json` ogni riga è un oggetto e l'ultima li contiene tutti:

```json
{
  "t": "end",
  "status": "failed",
  "reason": "expect_pin_mismatch",
  "exit_code": 1
}
```

In GitHub Actions gli stessi valori arrivano come output `status` e `sim_time_ms`
della [action](/docs/it/ci/github-action/).

## Perché un'esecuzione è stata rifiutata (exit 2)

Questi ritornano prima che qualsiasi cosa venga addebitata, ciascuno con il nome
colpevole nel messaggio:

| code                                                                          | cosa correggere                                                                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `unknown_board_type`                                                          | la board non è un tipo Velxio o un tipo di board che CI conosce. `velxio-cli boards`.                                              |
| `board_not_supported_in_ci`                                                   | Velxio non ha ancora una simulazione CI per quella board; il messaggio nomina la fase. Vedi la [tabella delle board](/docs/it/ci/velxio-toml/). |
| `board_not_launched`                                                          | la board esiste ma non è disponibile per l'esecuzione.                                                                              |
| `unsupported_part`                                                            | un componente nel diagramma non può essere simulato; gli id sono elencati.                                                             |
| `firmware_format_mismatch`                                                    | l'immagine non è per quel chip - un'immagine ESP32-C3 su una board `esp32-s3`, per esempio.                                            |
| `firmware_too_large`, `bundle_too_large`, `blob_missing`, `blob_sha_mismatch` | oltre un limite di dimensione, oppure un upload che non è arrivato integro.                                                                  |
| `scenario_invalid`                                                            | uno step è sconosciuto o un campo è mancante o non analizzabile.                                                                    |
| `scenario_part_missing`                                                       | uno step nomina un `part-id` che il circuito non ha.                                                                        |
| `feature_unsupported`                                                         | qualcosa non ancora implementato: `language = "micropython"`, un `[[chip]]`, uno step touch.                                           |
| `no_sim_clock`                                                                | quella board non ha un clock simulato leggibile, quindi nulla poteva essere addebitato in base al tempo simulato.                                  |
| `too_many_parts`, `bad_request`                                               | oltre i limiti del circuito, oppure una richiesta malformata.                                                                           |

Exit 4 è `quota_exhausted` (il messaggio riporta la data di reset) oppure
`concurrency`. Exit 5 è `rate_limited`, `ci_disabled` o `server_error`.

Esegui prima `velxio-cli lint .`: intercetta localmente la maggior parte delle cause di exit 2, senza
token e senza rete.

## Quanto costa ogni conclusione

I minuti sono tempo **simulato**, arrotondato per eccesso ai secondi interi, e mai superiore
al budget che l'esecuzione ha riservato.

- **Rifiutata prima di iniziare** (exit 2, 3, 4) - nulla. L'esecuzione non ha mai
  raggiunto un runner.
- **Nessun runner era libero** in tempo, oppure la connessione è caduta prima che il
  firmware iniziasse - nulla.
- **Passed, failed o timed out** - i secondi simulati trascorsi.
- **Un errore di server o runner a metà esecuzione** (exit 5) - solo i secondi simulati
  trascorsi, non il tempo wall-clock che il tentativo ha impiegato.
- **Ctrl-C** - i secondi simulati fino all'annullamento.

Il tuo saldo e, per ogni esecuzione, status, tempo simulato, secondi addebitati e codice di uscita
sono su [velxio.dev/account/ci](https://velxio.dev/account/ci).
