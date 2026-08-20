## About this board

Pimoroni's RP2350B in the standard Pico footprint — `GP0` through `GP28` plus
the power rails — so any wiring you built for a
[Pico](/docs/boards/reference/raspberry-pi-pico/) drops straight onto it.

Two limits worth knowing before you plan around this board:

- **GPIO, UART, USB serial, I2C and SPI run.** That covers most Pico projects
  unchanged.
- **The CYW43 WiFi coprocessor and the PSRAM are not emulated.** If a project
  needs wireless, the [Pico W](/docs/boards/reference/pi-pico-w/) is the board
  that has it here.

## Start here

[Blink + Serial](https://velxio.dev/example/pimoroni-pico-plus-2w-blink) is the
board's own example — an LED and serial output, enough to confirm the toolchain
and the console in one run.
