## About this board

The original XIAO: a SAMD21 Cortex-M0+ at 48 MHz with native USB, and a real
10-bit DAC on A0. The in-browser engine boots the firmware the Seeed SAMD core
produces; `Serial` is the USB CDC port, and `analogWrite(A0, ...)` drives the
DAC rather than a PWM, which is what the board does on the bench.

## Start here

- [Blink](https://velxio.dev/example/xiao-samd21-blink) — the shortest check
  that the board and toolchain work.
- [OLED over I2C](https://velxio.dev/example/xiao-samd21-oled) — an SSD1306 on
  the header pins.
- [Knob and button](https://velxio.dev/example/xiao-samd21-knob-button) —
  analog in, digital in, an LED out.
