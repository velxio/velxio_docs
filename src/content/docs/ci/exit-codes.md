---
title: Exit codes
description: What velxio-cli returns to your job, what each code means, and what it costs in minutes.
sidebar:
  order: 6
---

The exit code is the contract between Velxio CI and your job. It is stable;
scripts may rely on it.

| code  | meaning                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`   | **Passed.** `--expect-text` matched, the scenario finished, or the only thing asked for was a screenshot and it was taken.                                                  |
| `1`   | **Failed.** `--fail-text` appeared, an `expect-pin` did not match, a step failed, or the guest crashed.                                                                     |
| `2`   | **Config.** A usage or lint error, or the server refused the run before it started. Nothing was billed.                                                                     |
| `3`   | **Auth.** The token is missing, malformed, unknown, revoked or expired; or the plan is not entitled to CI.                                                                  |
| `4`   | **Quota.** No CI minutes left this month, or more jobs at once than your plan runs. Nothing was billed.                                                                     |
| `5`   | **Server or runner.** Rate limited, CI disabled, no runner free in time, the runner was lost, the engine stalled, a wall-clock cap, a renderer crash, a dropped connection. |
| `42`  | **The budget ran out.** The simulated-time budget was reached before the expectation was met. Change it with `--timeout-exit-code`.                                         |
| `130` | **Ctrl-C.** The CLI cancels the run, waits up to 5 s for the final report and exits.                                                                                        |

`--timeout-exit-code 0` turns the budget into a normal ending, which is how
you say "run for N simulated seconds and give me the serial":

```bash
velxio-cli run --timeout 5000 --timeout-exit-code 0 --serial-log-file serial.log .
```

## Status and reason

The last line of a run names both:

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

`screenshot_mismatch` is reserved: screenshot comparison is not implemented
yet, so a `compare-with` never fails a run today. See
[Scenarios](/docs/ci/scenarios/).

With `--json` every line is an object and the last one carries all of it:

```json
{
  "t": "end",
  "status": "failed",
  "reason": "expect_pin_mismatch",
  "exit_code": 1
}
```

In GitHub Actions the same values arrive as the `status` and `sim_time_ms`
outputs of the [action](/docs/ci/github-action/).

## Why a run was refused (exit 2)

These come back before anything is billed, each with the offending name in
the message:

| code                                                                          | what to fix                                                                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `unknown_board_type`                                                          | the board is not a Velxio kind or a board type CI knows. `velxio-cli boards`.                                              |
| `board_not_supported_in_ci`                                                   | Velxio has no CI simulation for that board yet; the message names the phase. See the [board table](/docs/ci/velxio-toml/). |
| `board_not_launched`                                                          | the board exists but is not available to run.                                                                              |
| `unsupported_part`                                                            | a part in the diagram cannot be simulated; the ids are listed.                                                             |
| `firmware_format_mismatch`                                                    | the image is not for that chip - an ESP32-C3 image on an `esp32-s3` board, say.                                            |
| `firmware_too_large`, `bundle_too_large`, `blob_missing`, `blob_sha_mismatch` | over a size cap, or an upload that did not arrive intact.                                                                  |
| `scenario_invalid`                                                            | a step is unknown or a field is missing or unparseable.                                                                    |
| `scenario_part_missing`                                                       | a step names a `part-id` the circuit does not have.                                                                        |
| `feature_unsupported`                                                         | something not built yet: `language = "micropython"`, a `[[chip]]`, a touch step.                                           |
| `no_sim_clock`                                                                | that board has no readable simulated clock, so nothing could be billed by simulated time.                                  |
| `too_many_parts`, `bad_request`                                               | over the circuit limits, or a malformed request.                                                                           |

Exit 4 is `quota_exhausted` (the message carries the reset date) or
`concurrency`. Exit 5 is `rate_limited`, `ci_disabled` or `server_error`.

Run `velxio-cli lint .` first: it catches most exit-2 causes locally, with
no token and no network.

## What each ending costs

Minutes are **simulated** time, rounded up to whole seconds, and never more
than the budget the run reserved.

- **Refused before it started** (exit 2, 3, 4) - nothing. The run never
  reached a runner.
- **No runner was free** in time, or the connection dropped before the
  firmware started - nothing.
- **Passed, failed or timed out** - the simulated seconds that elapsed.
- **A server or runner error mid-run** (exit 5) - only the simulated
  seconds that had elapsed, not the wall-clock time the attempt took.
- **Ctrl-C** - the simulated seconds up to the cancellation.

Your balance and every run's status, simulated time, billed seconds and exit
code are at [velxio.dev/account/ci](https://velxio.dev/account/ci).
