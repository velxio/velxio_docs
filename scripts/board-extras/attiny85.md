## About this board

The bare 8-pin DIP ATtiny85 at 8 MHz with 8 KB of flash — not a development
board, a chip you breadboard directly. Five usable I/O pins, so most projects
here are one sensor or one output at a time.

Two things worth knowing before you wire it:

- **No hardware I2C or SPI peripheral.** The ATtiny85 has USI instead, so I2C
  libraries written for it (TinyWireM and friends) drive the bus in software.
  The emulator implements USI, so those libraries work.
- **PWM comes from Timer0 and Timer1**, and `analogWrite()` is only available
  on the pins those timers reach — see the
  [PWM fade example](https://velxio.dev/example/attiny85-pwm-fade).

## Start here

[New ATtiny85 project](https://velxio.dev/example/attiny85-blink) opens the
editor with the chip and a working blink sketch. The gallery also has a
[button + LED](https://velxio.dev/example/attiny85-button-led) and an
[NTC temperature sensor](https://velxio.dev/example/attiny85-ntc-sensor)
project on the same chip.
