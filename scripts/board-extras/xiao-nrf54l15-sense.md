## About this board

Nordic's nRF54L15 — a Cortex-M33 at 128 MHz with RRAM instead of flash — in
the XIAO footprint, Sense variant, with a 6-axis IMU (LSM6DS3TR-C) on board.
The in-browser engine boots the firmware the community nRF54 Arduino core
produces; `Serial` reaches the monitor through the board's own USB bridge.

The IMU is live: press **Sensors** on the canvas toolbar and drag the Tilt pad.
As on the real board, the part only answers once the sketch has switched on
its supply rail (`IMU_MIC_PWR`). The radio is not emulated.

## Start here

- [Blink](https://velxio.dev/example/xiao-nrf54l15-sense-blink) — the shortest
  check that the board and toolchain work.
- [OLED over I2C](https://velxio.dev/example/xiao-nrf54l15-sense-oled) — an
  SSD1306 on the header pins.
- [Knob and button](https://velxio.dev/example/xiao-nrf54l15-sense-knob-button)
  — analog in, digital in, an LED out.
