---
title: Velxio CI
description: Run your firmware on a simulated board from a terminal or a CI job, and fail the build when the firmware misbehaves.
sidebar:
  order: 1
  badge:
    text: Paid
    variant: tip
---

Velxio CI runs a project of yours on our simulator from outside the browser:
your terminal, a GitHub Actions job, any CI that can run a binary. The board
boots your real compiled firmware, the serial output streams back, and the
command exits non-zero when something you asked for did not happen.

```bash
curl -fsSL https://velxio.dev/ci/install.sh | sh
velxio-cli login                           # approve in the browser, once
cd firmware/blink
velxio-cli run --expect-text "Hello, world!" --timeout 10000 .
```

```
velxio-cli 0.2.1 · plan pro · 1998.3 of 2000 min left (resets 2026-10-01)
project blink (esp32-s3, 4 parts) · firmware build/blink.bin (ESP32 image, 912 KB)
run r_9f3c2a1b7e4d queued · budget 10.0 s simulated
Hello, world!
ok   wait-serial "Hello, world!" at 0.412 s
PASS in 0.41 s simulated (3.2 s wall) · billed 1 s · exit 0
```

## What it is for

- **Catch a firmware regression before hardware does.** A test that boots the
  binary and waits for a line of serial is one command; a test that presses a
  button, sets a sensor and checks a pin is a short YAML file.
- **Test what you cannot keep on a desk.** Every board Velxio simulates is
  available to every job, in parallel, with no lab and no flashing.
- **Keep the toolchain you have.** Compile with arduino-cli, ESP-IDF,
  PlatformIO or cargo in an earlier step; Velxio only runs what came out.

## What it costs

CI is billed in **simulated minutes**: the time the guest firmware believes
has passed, not how long our servers took. A 10-second test costs 10 seconds
on every board, whether the emulator ran it faster or slower than real time.

| Plan  | CI minutes per month | Jobs at once | Longest run |
| ----- | -------------------- | ------------ | ----------- |
| Free  | none                 | none         | none        |
| Maker | 200                  | 1            | 5 min       |
| Pro   | 2,000                | 2            | 10 min      |

A run that never starts (an unknown board, a firmware that does not match the
board, a rejected scenario) costs nothing. Minutes reset on the first of the
month, UTC. Your balance, your run history and your tokens live at
[/account/ci](https://velxio.dev/account/ci):

![The CI account page: minutes used this month, the tokens that exist with when each was last used, and a table of recent runs with their status, simulated and billed seconds and exit code](../../../assets/docs/ci/account.png)

## How a project describes itself

Two files in the directory you point the CLI at:

- `velxio.toml`: the board and the firmware. A Wokwi `wokwi.toml` works too.
- `diagram.json`: the circuit. Wokwi's format, so an existing diagram runs
  unchanged.

Add `scenario.yaml` when a serial check is not enough: it can wait for text,
send text, wait on the simulated clock, check a pin and set a control on a
part. See [Scenarios](/docs/ci/scenarios/).

## Next

- [Quickstart](/docs/ci/quickstart/): a first passing run in five minutes.
- [velxio.toml](/docs/ci/velxio-toml/): every key, and how paths resolve.
- [Scenarios](/docs/ci/scenarios/): the steps and what they mean.
- [GitHub Actions](/docs/ci/github-action/): the action and its inputs.
- [Exit codes](/docs/ci/exit-codes/): what each one means for your job.
- [Coming from Wokwi CI](/docs/ci/migrating-from-wokwi/): what changes.
