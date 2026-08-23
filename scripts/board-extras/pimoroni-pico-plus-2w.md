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
  a command over the module's SPI bus rather than a GPIO write. It lights here
  all the same.
- **The pads marked 26, 27 and 28 are two GPIOs each.** The RP2350B's ADC lives
  on `GP40`–`GP47`, nowhere near the Pico footprint, so Pimoroni tied
  `GP26`+`GP40`, `GP27`+`GP41` and `GP28`+`GP42` together through a 1 kΩ
  resistor and silked each pad with both names — `26 / A0` and so on. That is
  why `analogRead(A0)` works and `analogRead(26)` returns 0: `A0` *is* `GP40`.
  There is no `A3` pad; `GP43` is the on-board VSYS monitor.

What runs here: GPIO, UART, USB serial, I2C, SPI, ADC — including the on-die
temperature sensor, so `analogReadTemp()` returns a steady 27 °C — timers, the BOOT button,
the **8 MB PSRAM** (`pmalloc()` returns real memory in the XIP window at
`0x11000000`) and **WiFi** — the CYW43439 inside the RM2 is emulated register by
register, so `WiFi.begin()` associates with Velxio's virtual access point
(`Velxio-GUEST`, open), gets 10.13.37.42 and can make real HTTP requests through
Velxio's network bridge. `WiFi.scanNetworks()` finds it too — one network,
`Velxio-GUEST` on channel 6, open, around -40 dBm, which is everything that is
on the air here. Not emulated: Bluetooth.

## Start here

- [Onboard LED](https://velxio.dev/example/pimoroni-pico-plus-2w-onboard-led) —
  Pimoroni's `onboard_led.py`: blinks the user LED on the RM2.
- [Who is in space](https://velxio.dev/example/pimoroni-pico-plus-2w-astronauts)
  — their `astronauts.py`: joins WiFi and fetches a real HTTP response, live
  from open-notify.org. (Their `catfacts.py` is not shipped: catfact.ninja now
  redirects to HTTPS, and TLS is out of reach for the emulated chip.)
- [BOOT as user button](https://velxio.dev/example/pimoroni-pico-plus-2w-button)
  — their `button.py`: hold BOOT (GP45) and the LED comes on.
- [The 8 MB PSRAM](https://velxio.dev/example/pimoroni-pico-plus-2w-psram) —
  allocates a megabyte outside the chip's own 520 KB of SRAM and verifies it.
- [Analog in on A0](https://velxio.dev/example/pimoroni-pico-plus-2w-analog) —
  a potentiometer on the pad silked `26 / A0`, read as `A0`.
- [Qw/ST breakout bus](https://velxio.dev/example/pimoroni-pico-plus-2w-qwst-i2c)
  — scans the Qwiic connector on `GP4`/`GP5` and reads the demo I2C devices,
  the pattern Pimoroni's breakout examples use.
