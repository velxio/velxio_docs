---
title: Troubleshooting
description: The checks that fix most problems, in order.
sidebar:
  order: 4
---

## The simulation won't start

1. Check the **Output console** — if the compile failed, the error is
   there, with file and line. See
   [reading compile errors](/docs/programming/compile-and-run/).
2. A **circuit verifier** warning (e.g. an LED without a series resistor
   in electrical mode) blocks the run on purpose — fix the flagged wiring.
3. First run of a session compiles cold and can take a while on the big
   toolchains (ESP-IDF); later runs are much faster. Give the first one
   time before assuming it hung.

## It runs, but nothing happens

- Is the **right board** selected in the toolbar's board selector?
- Open the **serial monitor** — a firmware that crashed or is waiting for
  input tells you there.
- Right-click parts to confirm their **properties** (a NeoPixel strip set
  to 0 LEDs draws exactly nothing).

## The page itself misbehaves

- Velxio wants a **desktop Chromium or Firefox**, reasonably current.
- Hard-reload (Ctrl+Shift+R) after updates — a stale cached bundle can
  pair badly with a fresh backend.
- Browser extensions that touch WebAssembly, canvas or WebSockets
  (aggressive privacy blockers) can break the emulators — try an
  incognito window.

## Web flash doesn't see my board

- Use **Chrome or Edge** — Firefox/Safari don't ship the browser serial
  API.
- Close every other program using the port (serial monitors, IDEs).
- Try another cable — charge-only USB cables are the classic trap.

## WiFi examples can't connect

- The SSID is exactly **`Velxio-GUEST`**, open, no password.
- Watch the serial monitor for the WiFi stack's own progress lines
  (`wifi:connected`, `got ip`) to see which step fails.

## Still stuck?

Ask the [AI assistant](/docs/ai/overview/) with your project open — it
reads the same errors you do. For bugs, reach the team via the **Help**
menu, Discord, or GitHub.
