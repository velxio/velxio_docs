## About this board

Silicon Labs' EFR32MG24 Cortex-M33 in the XIAO footprint, Sense variant, with
a 6-axis IMU (LSM6DS3TR-C) on board. The in-browser engine boots the firmware
the Silicon Labs Arduino core produces; `Serial` reaches the monitor through
the board's own USB bridge, and `Wire`, `SPI`, the ADC and PWM run.

The IMU is live: press **Sensors** on the canvas toolbar and drag the Tilt pad.
As on the real board, the part only answers once the sketch has powered it
from PD5. The Matter / Bluetooth radio is not emulated.

## Start here

- [Blink](https://velxio.dev/example/xiao-mg24-sense-blink) — the shortest
  check that the board and toolchain work.
- [OLED over I2C](https://velxio.dev/example/xiao-mg24-sense-oled) — an SSD1306
  on the header pins.
- [Knob and button](https://velxio.dev/example/xiao-mg24-sense-knob-button) —
  analog in, digital in, an LED out.
