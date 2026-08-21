## About this board

Pimoroni's RP2350B in the standard Pico footprint — `GP0` through `GP28` plus
the power rails — so any wiring you built for a
[Pico](/docs/boards/reference/raspberry-pi-pico/) drops straight onto it. What
the extra silicon adds: 16 MB of flash, 8 MB of PSRAM, a Raspberry Pi RM2
wireless module, a Qw/ST (Qwiic/STEMMA QT) connector on `GP4`/`GP5`, and a BOOT
button that doubles as a user switch on `GP45`.

Two board details that surprise people, on real hardware as much as here:

- **The user LED is not a chip pin.** It hangs off the RM2 module's `WL_GPIO0`
  — `LED_BUILTIN` in Arduino, `Pin('LEDW')` in MicroPython — so it is driven by
  a command over the module's SPI bus rather than a GPIO write.
- **`GP26`–`GP28` are plain digital pins.** On the RP2350B the ADC lives on
  `GP40`–`GP47`, which Pimoroni brings out as `A0`–`A3`.

What runs here: GPIO, UART, USB serial, I2C, SPI, ADC, timers, and the BOOT
button. Not emulated: the 8 MB PSRAM, and the RM2 beyond its bring-up — the
init handshake and the first commands are real round-trips (`WiFi.macAddress()`
returns the chip's MAC), then the module stops answering, so `WiFi.begin()`
never connects and `LED_BUILTIN` stops toggling after the first write. Put LEDs
on a real pin such as `GP2`, and for a wireless project use the
[Pico W](/docs/boards/reference/pi-pico-w/), which has Wi-Fi here.

## Start here

- [BOOT as user button](https://velxio.dev/example/pimoroni-pico-plus-2w-button)
  — Pimoroni's own `button.py` for this board, ported to Arduino: hold BOOT
  (GP45) and the LED comes on.
- [Qw/ST breakout bus](https://velxio.dev/example/pimoroni-pico-plus-2w-qwst-i2c)
  — scans the Qwiic connector on `GP4`/`GP5` and reads the demo I2C devices,
  the pattern Pimoroni's breakout examples use.
- [Blink + Serial](https://velxio.dev/example/pimoroni-pico-plus-2w-blink) —
  an LED and serial output, enough to confirm the toolchain and the console in
  one run.
