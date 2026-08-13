---
title: Using libraries
description: Search, install and pin Arduino libraries for your project.
sidebar:
  order: 5
---

Click **Libraries** in the toolbar to search the Arduino library registry
and add libraries to the active board.

Installed libraries are recorded in the board's **`libraries.json`** file
(visible in the file tree), so they travel with the project: anyone who
opens it — including future you — gets the same versions resolved at
compile time. No per-machine library folder to keep in sync.

## Using a library

Install it, then `#include` it as usual:

```cpp
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
```

The cloud compiler fetches the declared libraries (plus their
dependencies) before building. If a build fails with
`No such file or directory` on a header, the library that provides that
header isn't declared yet — add it through **Libraries**.

## MicroPython

MicroPython firmware ships with its standard bundled modules
(`machine`, `network`, `time`, …). Pure-Python helper modules can be added
as extra files in the file tree next to `main.py` and imported normally.

## Examples come pre-wired

Every gallery example declares the libraries it needs — opening one gives
you a known-good combination of code + circuit + library versions, which
makes them good starting points for your own projects.
