---
title: Scenarios
description: Drive the simulated board from a YAML file - wait for serial, send bytes, press a button, set a sensor, check a pin - all on the simulated clock.
sidebar:
  order: 4
---

`--expect-text` answers one question: did this line ever appear? A scenario
answers the rest. It is a YAML file listing steps the runner executes in
order, on the **simulated clock** of the primary board.

The field names are Wokwi's, so an existing Wokwi scenario runs unchanged.

```yaml
# scenario.yaml
name: uno-ready boots and blinks
version: 1
steps:
  - wait-serial: READY
  - delay: 600ms
  - expect-pin:
      part-id: uno
      pin: 13
      expected: 1
```

```bash
velxio-cli run --scenario scenario.yaml .
```

The run passes when the last step passes, and fails at the first step that
does not. Each step is reported as it happens:

```
ok   wait-serial "READY" at 0.004 s
ok   delay 600 ms at 0.604 s
ok   expect-pin uno:13 expected 1 at 0.604 s
PASS in 0.60 s simulated (2.9 s wall) · billed 1 s · exit 0
```

## Steps

| step              | fields                                                                                      | what it does                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delay`           | `500ms`, `2s`, `100us`; a bare number is milliseconds                                       | waits until the simulated clock reaches `t0 + n`                                                                                                                              |
| `wait-serial`     | a string, at most 512 bytes                                                                 | substring match, byte-exact, over the serial received since the previous `wait-serial`. If the budget runs out first the run ends `timeout`                                   |
| `write-serial`    | a UTF-8 string, or a list of bytes `0..255`                                                 | writes to the primary board's UART                                                                                                                                            |
| `expect-pin`      | `part-id`, `pin`, `expected` (`0`/`1`, `high`/`low`, `true`/`false`; `value` also accepted) | reads the pin once, immediately. A mismatch fails the run and reports the level it actually read                                                                              |
| `set-control`     | `part-id`, `control`, `value` (number, string or boolean)                                   | `pressed` on a button presses or releases it; other controls are the part's sensor controls and attributes. An unknown control fails the run and lists the ones that part has |
| `take-screenshot` | `part-id`, `save-to` and/or `compare-with`, `tolerance`                                     | captures a PNG of that part at that point in the run                                                                                                                          |

Any step may carry a `name:` alongside its key, purely for the log.

Limits: 200 steps and 20 screenshots per run.

## Everything is simulated time

`delay: 600ms` is 600 milliseconds of the guest's clock, not of the wall
clock. The same scenario takes the same simulated time on a loaded runner
and on an idle one, which is what makes the result reproducible - and what
you are billed for.

:::caution
Do not pin a pin level to a serial line. Serial bytes are queued in the UART
and finish sending after the code that queued them, so a `wait-serial` on a
line printed in the same loop as a `digitalWrite` can land on the wrong side
of the edge - by fractions of a millisecond, every time. Use `wait-serial`
for a boot sentinel, then a `delay` that puts the read in the middle of the
window you expect.
:::

## Driving inputs

```yaml
steps:
  - wait-serial: READY
  - set-control:
      part-id: btn1
      control: pressed
      value: 1
  - delay: 50ms
  - set-control:
      part-id: btn1
      control: pressed
      value: 0
  - wait-serial: "pressed"
```

`part-id` is the id from your `diagram.json` (or the `.vlx`), never an
internal one. A step naming a part that does not exist is refused before
the run starts, with `scenario_part_missing` and exit 2 - nothing billed.

Bytes go the other way with `write-serial`, and come back byte-exact,
including values above `0x7f`:

```yaml
steps:
  - wait-serial: ECHO READY
  - write-serial: "hi\n"
  - wait-serial: "hi"
```

## Screenshots

```yaml
- take-screenshot:
    part-id: oled1
    save-to: shots/oled.png
```

The PNG of that part is captured at that point of the run and written to
`save-to`, resolved against the project directory. A run whose only
expectation is a screenshot passes once the last screenshot is taken.

:::note
`compare-with` is parsed and uploaded, but the comparison is **not
implemented yet**: the screenshot is captured, the run carries a warning
saying it was not compared, and it never fails the run. Compare the PNG in
your own job for now.
:::

## Flags that become steps

You can express the simple cases without a file, and they combine with one:

| flag                                      | equivalent                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--expect-text X`                         | a final `wait-serial X`                                                                                                        |
| `--screenshot-part P --screenshot-time T` | `delay T` then `take-screenshot P`                                                                                             |
| `--fail-text Y`                           | not a step: `Y` is watched on every serial chunk of every board, for the whole run, and ends it `failed` the moment it appears |

## Typing at the board

`--interactive` forwards your stdin to the primary board's serial port,
coalesced every 20 ms. It works together with a scenario: both write to the
same UART, in arrival order. Closing stdin ends the input, not the run -
the budget or the scenario does that.

## Not supported yet

- **Touch steps** (`touch-press`, `touch-move`, `touch-release`). The CLI
  refuses them at lint time rather than skipping them.
- **Screenshot comparison**, as above.
- **Custom chips** in a CI run: a `[[chip]]` in the config is refused with
  `feature_unsupported`.

See [Exit codes](/docs/ci/exit-codes/) for what each failure returns to your
job, and [velxio.toml](/docs/ci/velxio-toml/) for how a scenario is attached
to a project by default.
