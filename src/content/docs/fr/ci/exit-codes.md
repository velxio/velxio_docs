---
title: Codes de sortie
description: Ce que velxio-cli renvoie à votre job, ce que chaque code signifie et ce qu'il coûte en minutes.
sidebar:
  order: 6
---

Le code de sortie est le contrat entre Velxio CI et votre job. Il est stable ;
les scripts peuvent s'y fier.

| code  | signification                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`   | **Passed.** `--expect-text` a correspondu, le scénario s'est terminé, ou la seule chose demandée était une capture d'écran et elle a été prise.                                                  |
| `1`   | **Failed.** `--fail-text` est apparu, un `expect-pin` n'a pas correspondu, une étape a échoué, ou le guest a planté.                                                                     |
| `2`   | **Config.** Une erreur d'utilisation ou de lint, ou le serveur a refusé l'exécution avant qu'elle ne commence. Rien n'a été facturé.                                                                     |
| `3`   | **Auth.** Le token est manquant, malformé, inconnu, révoqué ou expiré ; ou le plan n'a pas droit à la CI.                                                                  |
| `4`   | **Quota.** Plus de minutes CI ce mois-ci, ou plus de jobs simultanés que ce que votre plan exécute. Rien n'a été facturé.                                                                     |
| `5`   | **Server or runner.** Limité en débit, CI désactivée, aucun runner libre à temps, le runner a été perdu, le moteur s'est bloqué, un plafond de temps réel, un crash du renderer, une connexion interrompue. |
| `42`  | **The budget ran out.** Le budget de temps simulé a été atteint avant que l'attente ne soit satisfaite. Modifiez-le avec `--timeout-exit-code`.                                         |
| `130` | **Ctrl-C.** Le CLI annule l'exécution, attend jusqu'à 5 s le rapport final et se termine.                                                                                        |

`--timeout-exit-code 0` transforme le budget en fin normale, ce qui est
la façon de dire « exécute pendant N secondes simulées et donne-moi le serial » :

```bash
velxio-cli run --timeout 5000 --timeout-exit-code 0 --serial-log-file serial.log .
```

## Statut et raison

La dernière ligne d'une exécution nomme les deux :

```
FAIL (expect_pin_mismatch) in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 1
```

| statut      | raisons                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `passed`    | `plan_complete`, `expect_text`, `screenshots_done`                                                                                             |
| `failed`    | `fail_text`, `expect_pin_mismatch`, `pin_not_connected`, `pin_unknown`, `control_unknown`, `step_failed`, `screenshot_mismatch`, `guest_crash` |
| `timeout`   | `budget_reached`                                                                                                                               |
| `error`     | `engine_stalled`, `wall_cap`, `renderer_crash`, `page_load_failed`, `runner_lost`, `no_runner`, `server_error`, `load_failed`                  |
| `cancelled` | `user`, `client_disconnected`                                                                                                                  |
| `lost`      | `heartbeat`, `api_restart`                                                                                                                     |

`screenshot_mismatch` est réservé : la comparaison de captures d'écran n'est pas encore implémentée, donc un `compare-with` ne fait jamais échouer une exécution aujourd'hui. Voir
[Scénarios](/docs/fr/ci/scenarios/).

Avec `--json`, chaque ligne est un objet et la dernière porte tout :

```json
{
  "t": "end",
  "status": "failed",
  "reason": "expect_pin_mismatch",
  "exit_code": 1
}
```

Dans GitHub Actions, les mêmes valeurs arrivent sous forme de sorties `status` et `sim_time_ms` de l'[action](/docs/fr/ci/github-action/).

## Pourquoi une exécution a été refusée (exit 2)

Celles-ci reviennent avant que quoi que ce soit ne soit facturé, chacune avec le nom fautif dans le message :

| code                                                                          | quoi corriger                                                                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `unknown_board_type`                                                          | la carte n'est pas un type Velxio ou un type de carte que la CI connaît. `velxio-cli boards`.                                              |
| `board_not_supported_in_ci`                                                   | Velxio n'a pas encore de simulation CI pour cette carte ; le message nomme la phase. Voir le [tableau des cartes](/docs/fr/ci/velxio-toml/). |
| `board_not_launched`                                                          | la carte existe mais n'est pas disponible pour l'exécution.                                                                              |
| `unsupported_part`                                                            | un composant du schéma ne peut pas être simulé ; les ids sont listés.                                                             |
| `firmware_format_mismatch`                                                    | l'image n'est pas pour cette puce - une image ESP32-C3 sur une carte `esp32-s3`, par exemple.                                            |
| `firmware_too_large`, `bundle_too_large`, `blob_missing`, `blob_sha_mismatch` | au-dessus d'un plafond de taille, ou un upload qui n'est pas arrivé intact.                                                                  |
| `scenario_invalid`                                                            | une étape est inconnue ou un champ est manquant ou non analysable.                                                                    |
| `scenario_part_missing`                                                       | une étape nomme un `part-id` que le circuit n'a pas.                                                                        |
| `feature_unsupported`                                                         | quelque chose qui n'est pas encore construit : `language = "micropython"`, un `[[chip]]`, une étape tactile.                                           |
| `no_sim_clock`                                                                | cette carte n'a pas d'horloge simulée lisible, donc rien ne pouvait être facturé en temps simulé.                                  |
| `too_many_parts`, `bad_request`                                               | au-dessus des limites du circuit, ou une requête malformée.                                                                           |

Exit 4 est `quota_exhausted` (le message porte la date de réinitialisation) ou
`concurrency`. Exit 5 est `rate_limited`, `ci_disabled` ou `server_error`.

Lancez d'abord `velxio-cli lint .` : il attrape localement la plupart des causes d'exit 2, sans token et sans réseau.

## Ce que coûte chaque fin

Les minutes sont du temps **simulé**, arrondi à la seconde entière, et jamais plus que le budget réservé par l'exécution.

- **Refusée avant de commencer** (exit 2, 3, 4) - rien. L'exécution n'a jamais atteint un runner.
- **Aucun runner n'était libre** à temps, ou la connexion a été coupée avant le démarrage du firmware - rien.
- **Passed, failed ou timed out** - les secondes simulées qui se sont écoulées.
- **Une erreur serveur ou runner en cours d'exécution** (exit 5) - uniquement les secondes simulées qui s'étaient écoulées, pas le temps réel qu'a pris la tentative.
- **Ctrl-C** - les secondes simulées jusqu'à l'annulation.

Votre solde et le statut de chaque exécution, le temps simulé, les secondes facturées et le code de sortie sont sur [velxio.dev/account/ci](https://velxio.dev/account/ci).
