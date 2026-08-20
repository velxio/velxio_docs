## About this board

The postage-stamp C3 board that turns up in every parts-bin project — same
single-core RISC-V ESP32-C3 as the [DevKit](/docs/boards/reference/esp32-c3/),
sixteen pins, and almost no board around the chip.

Its inputs are driven by the analog engine like the rest of the catalog, so a
switch or divider wired to a GPIO reads the voltage the circuit actually
produces rather than an idealised level — see
[analog simulation](/docs/instruments/analog-simulation/).

## Start here

No separate starter: open
[New ESP32-C3 project](https://velxio.dev/example/c3-blink) and swap the board,
or place it from **Add Component**.
