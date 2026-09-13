## About this board

The Nordic nRF52840 in the XIAO footprint, Sense variant: a Cortex-M4F at
64 MHz with a 6-axis IMU (LSM6DS3TR-C) and a PDM microphone on board. It runs
on an in-browser engine that boots the firmware Seeed's own nRF52 core
produces, so GPIO, ADC, PWM, `Wire` and `SPI` behave as they do over USB.

The IMU is live: press **Sensors** on the canvas toolbar and drag the Tilt pad,
and the part reports that gravity at its real I2C address, 0x6A. Bluetooth is
not emulated.

## Start here

- [Blink](https://velxio.dev/example/xiao-nrf52840-sense-blink) — the shortest
  check that the board and toolchain work.
- [OLED over I2C](https://velxio.dev/example/xiao-nrf52840-sense-oled) — an
  SSD1306 on the header pins.
- [Knob and button](https://velxio.dev/example/xiao-nrf52840-sense-knob-button)
  — analog in, digital in, an LED out.
