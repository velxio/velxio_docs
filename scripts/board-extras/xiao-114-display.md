## About this board

An ST7789 135 x 240 IPS panel on a carrier with a pre-soldered XIAO nRF52840
Plus, three user buttons (USR1 D6, USR2 D7 and USR3 on the edge, D19), a Grove
I2C connector, a 6-axis IMU and a battery connector. The canvas shows the board
front and back; the Grove pads on the back are the ones you wire to.

Drive the panel with **Seeed_GFX2**, which the board declares for you. Tilt
the board and set the battery level from **Sensors** on the canvas toolbar.
The PDM microphone and the I2S pads are not modelled.

## Start here

- [GraphicTest](https://velxio.dev/example/xiao-114-graphictest) — Seeed's ten
  drawing primitives, timed on the serial monitor.
- [Grove SHT31](https://velxio.dev/example/xiao-114-grove-sht31) — a sensor on
  the Grove connector, sharing the bus with the IMU.
- [The three user buttons](https://velxio.dev/example/xiao-114-buttons) — each
  button counted on screen; USR1 toggles the backlight.
