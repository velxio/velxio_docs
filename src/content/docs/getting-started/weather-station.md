---
title: "Tutorial: weather station"
description: A real multi-sensor project — BMP280 over I2C, DHT22 on GPIO and an ILI9341 TFT over SPI, live on one ESP32.
draft: true
sidebar:
  order: 3
---

The [first project](/docs/getting-started/first-project/) blinked one LED.
This one is a real device: an ESP32 reading **temperature and pressure over
I²C** (BMP280), **humidity on a GPIO** (DHT22), and drawing everything on a
**TFT display over SPI** (ILI9341) — three buses working at once, in the
browser.

![The weather station running: sensors feeding the TFT live](../../../assets/docs/getting-started/weather-station.gif)

## 1. Open the project

Open the public project:
[velxio.dev/dave/estacin-meteorolgica-esp32](https://velxio.dev/dave/estacin-meteorolgica-esp32).

![The weather station as it opens](../../../assets/docs/getting-started/weather-loaded.png)

Take a second to read the circuit before running it:

- **BMP280** — `SDA`/`SCL` to the ESP32's I²C pins. Two wires, two
  measurements (temperature + pressure).
- **DHT22** — a single data GPIO with its pull-up. Humidity and a second
  temperature reading.
- **ILI9341** — the SPI bundle: `MOSI`, `SCK`, `CS`, `DC`, `RST`. Right-click
  any part to see [its pinout and datasheet](/docs/circuit-editor/part-inspector/).

This project was designed, wired and programmed end-to-end by
[Velxio's AI agent](/docs/ai/agent-mode/) — you can build the same thing by
asking for it.

## 2. Run it

Press **Run**. The sketch compiles with the real Arduino toolchain (watch
the **Output** console resolve the Adafruit libraries), the ESP32 boots,
and:

![Weather station running with live TFT](../../../assets/docs/getting-started/weather-running.png)

- The **TFT** draws the dashboard and refreshes with live readings.
- The **serial monitor** logs each sensor sweep:

![Serial output of the weather station](../../../assets/docs/getting-started/weather-serial.png)

## 3. Change the weather

Click the **BMP280** or the **DHT22** while the simulation runs — their
sensor control panels let you drag temperature, humidity and pressure.
The firmware reads the new values on its next I²C/GPIO poll and the TFT
follows. That loop — tweak input, watch the device react — is the whole
point of simulating first.

## 4. Make it yours

Treat it like any project: change the display layout in the sketch, add a
threshold that lights an LED when humidity crosses 70%, or swap the DHT22
for another sensor from the [catalog](/docs/parts/overview/). Then
[save your copy](/docs/getting-started/projects/).

## Build it from scratch instead

If you'd rather wire it yourself: start from a blank ESP32
[template](/docs/getting-started/projects/), add the three parts from the
[picker](/docs/circuit-editor/placing-components/), wire the buses as
above, and add the **Adafruit BMP280**, **DHT sensor library** and
**Adafruit ILI9341** libraries ([how](/docs/programming/libraries/)).
Or open the [AI assistant](/docs/ai/agent-mode/) and ask it to build the
station with you — that's how this one was born.
