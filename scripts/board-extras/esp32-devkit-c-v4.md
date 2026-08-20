## About this board

Espressif's own devkit, and the wider sibling of the
[DevKit V1](/docs/boards/reference/esp32/): same dual-core Xtensa ESP32 and
the same peripheral set, but **38 pins instead of 30**. The extra rows bring
out GPIOs the V1 leaves unbonded, which matters when a project runs out of
pins rather than out of MCU.

Sketches are interchangeable with the V1 as long as the pin numbers you use
exist on both — check the map below before moving a project across.

## Start here

There is no separate starter for this board: open
[New ESP32 project](https://velxio.dev/example/esp32-blink-led) and swap the
board, or place it from **Add Component** on an empty canvas.
