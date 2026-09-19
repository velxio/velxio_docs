---
title: Exit-Codes
description: Was velxio-cli an Ihren Job zurückgibt, was jeder Code bedeutet und was er in Minuten kostet.
sidebar:
  order: 6
---

Der Exit-Code ist der Vertrag zwischen Velxio CI und Ihrem Job. Er ist stabil;
Skripte können sich darauf verlassen.

| code  | bedeutung                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`   | **Passed.** `--expect-text` stimmte überein, das Szenario wurde beendet, oder es wurde nur ein Screenshot angefordert und dieser wurde erstellt.                                                  |
| `1`   | **Failed.** `--fail-text` ist aufgetreten, ein `expect-pin` stimmte nicht überein, ein Schritt ist fehlgeschlagen oder der Gast ist abgestürzt.                                                                     |
| `2`   | **Config.** Ein Nutzungs- oder Lint-Fehler, oder der Server hat den Lauf abgelehnt, bevor er begann. Es wurde nichts berechnet.                                                                     |
| `3`   | **Auth.** Das Token fehlt, ist fehlerhaft, unbekannt, widerrufen oder abgelaufen; oder der Plan berechtigt nicht zu CI.                                                                  |
| `4`   | **Quota.** Keine CI-Minuten mehr in diesem Monat, oder mehr gleichzeitige Jobs als Ihr Plan ausführt. Es wurde nichts berechnet.                                                                     |
| `5`   | **Server oder Runner.** Rate-Limit erreicht, CI deaktiviert, kein Runner rechtzeitig frei, der Runner ging verloren, die Engine stockte, ein Wall-Clock-Limit, ein Renderer-Absturz, eine getrennte Verbindung. |
| `42`  | **Das Budget ist aufgebraucht.** Das Budget der simulierten Zeit wurde erreicht, bevor die Erwartung erfüllt wurde. Ändern Sie es mit `--timeout-exit-code`.                                         |
| `130` | **Ctrl-C.** Die CLI bricht den Lauf ab, wartet bis zu 5 s auf den Abschlussbericht und beendet sich.                                                                                        |

`--timeout-exit-code 0` verwandelt das Budget in ein normales Ende, womit Sie
sagen: "Laufe N simulierte Sekunden und gib mir die serielle Ausgabe":

```bash
velxio-cli run --timeout 5000 --timeout-exit-code 0 --serial-log-file serial.log .
```

## Status und Grund

Die letzte Zeile eines Laufs nennt beides:

```
FAIL (expect_pin_mismatch) in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 1
```

| status      | gründe                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `passed`    | `plan_complete`, `expect_text`, `screenshots_done`                                                                                             |
| `failed`    | `fail_text`, `expect_pin_mismatch`, `pin_not_connected`, `pin_unknown`, `control_unknown`, `step_failed`, `screenshot_mismatch`, `guest_crash` |
| `timeout`   | `budget_reached`                                                                                                                               |
| `error`     | `engine_stalled`, `wall_cap`, `renderer_crash`, `page_load_failed`, `runner_lost`, `no_runner`, `server_error`, `load_failed`                  |
| `cancelled` | `user`, `client_disconnected`                                                                                                                  |
| `lost`      | `heartbeat`, `api_restart`                                                                                                                     |

`screenshot_mismatch` ist reserviert: Der Screenshot-Vergleich ist noch nicht
implementiert, daher lässt ein `compare-with` einen Lauf heute niemals
fehlschlagen. Siehe [Szenarien](/docs/de/ci/scenarios/).

Mit `--json` ist jede Zeile ein Objekt und die letzte trägt alles:

```json
{
  "t": "end",
  "status": "failed",
  "reason": "expect_pin_mismatch",
  "exit_code": 1
}
```

In GitHub Actions kommen dieselben Werte als die `status`- und
`sim_time_ms`-Ausgaben der [Action](/docs/de/ci/github-action/) an.

## Warum ein Lauf abgelehnt wurde (Exit 2)

Diese kommen zurück, bevor irgendetwas berechnet wird, jeweils mit dem
beanstandeten Namen in der Meldung:

| code                                                                          | was zu beheben ist                                                                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `unknown_board_type`                                                          | das Board ist kein Velxio-Typ oder ein Board-Typ, den CI kennt. `velxio-cli boards`.                                              |
| `board_not_supported_in_ci`                                                   | Velxio hat noch keine CI-Simulation für dieses Board; die Meldung nennt die Phase. Siehe die [Board-Tabelle](/docs/de/ci/velxio-toml/). |
| `board_not_launched`                                                          | das Board existiert, ist aber nicht zum Ausführen verfügbar.                                                                              |
| `unsupported_part`                                                            | ein Teil im Schaltplan kann nicht simuliert werden; die IDs werden aufgelistet.                                                             |
| `firmware_format_mismatch`                                                    | das Image ist nicht für diesen Chip - etwa ein ESP32-C3-Image auf einem `esp32-s3`-Board.                                            |
| `firmware_too_large`, `bundle_too_large`, `blob_missing`, `blob_sha_mismatch` | über einem Größenlimit, oder ein Upload, der nicht intakt ankam.                                                                  |
| `scenario_invalid`                                                            | ein Schritt ist unbekannt oder ein Feld fehlt oder ist nicht parsebar.                                                                    |
| `scenario_part_missing`                                                       | ein Schritt nennt eine `part-id`, die der Schaltkreis nicht hat.                                                                        |
| `feature_unsupported`                                                         | etwas, das noch nicht gebaut ist: `language = "micropython"`, ein `[[chip]]`, ein Touch-Schritt.                                           |
| `no_sim_clock`                                                                | dieses Board hat keine lesbare simulierte Uhr, sodass nichts nach simulierter Zeit berechnet werden konnte.                                  |
| `too_many_parts`, `bad_request`                                               | über den Schaltkreis-Limits, oder eine fehlerhafte Anfrage.                                                                           |

Exit 4 ist `quota_exhausted` (die Meldung enthält das Rücksetzdatum) oder
`concurrency`. Exit 5 ist `rate_limited`, `ci_disabled` oder `server_error`.

Führen Sie zuerst `velxio-cli lint .` aus: Es fängt die meisten Exit-2-Ursachen
lokal ab, ohne Token und ohne Netzwerk.

## Was jedes Ende kostet

Minuten sind **simulierte** Zeit, auf ganze Sekunden aufgerundet, und niemals
mehr als das Budget, das der Lauf reserviert hat.

- **Abgelehnt, bevor er begann** (Exit 2, 3, 4) - nichts. Der Lauf hat nie
  einen Runner erreicht.
- **Kein Runner war rechtzeitig frei**, oder die Verbindung brach ab, bevor
  die Firmware startete - nichts.
- **Bestanden, fehlgeschlagen oder Zeitüberschreitung** - die verstrichenen
  simulierten Sekunden.
- **Ein Server- oder Runner-Fehler mitten im Lauf** (Exit 5) - nur die
  verstrichenen simulierten Sekunden, nicht die Wall-Clock-Zeit des Versuchs.
- **Ctrl-C** - die simulierten Sekunden bis zum Abbruch.

Ihr Guthaben und der Status jedes Laufs, die simulierte Zeit, die berechneten
Sekunden und der Exit-Code sind unter [velxio.dev/account/ci](https://velxio.dev/account/ci) zu finden.
