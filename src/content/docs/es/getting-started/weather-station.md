---
title: "Tutorial: estación meteorológica"
description: Un proyecto real con múltiples sensores — BMP280 por I2C, DHT22 en GPIO y una pantalla TFT ILI9341 por SPI, todo en un solo ESP32.
draft: true
sidebar:
  order: 3
---

El [primer proyecto](/docs/es/getting-started/first-project/) encendió un LED.
Este es un dispositivo real: un ESP32 que lee **temperatura y presión por
I²C** (BMP280), **humedad en un GPIO** (DHT22), y dibuja todo en una
**pantalla TFT por SPI** (ILI9341) — tres buses funcionando a la vez, en el
navegador.

![La estación meteorológica en funcionamiento: los sensores alimentan la TFT en vivo](../../../../assets/docs/getting-started/weather-station.gif)

## 1. Abre el proyecto

Abre el proyecto público:
[velxio.dev/dave/estacin-meteorolgica-esp32](https://velxio.dev/dave/estacin-meteorolgica-esp32).

![La estación meteorológica al abrirse](../../../../assets/docs/getting-started/weather-loaded.png)

Tómate un segundo para leer el circuito antes de ejecutarlo:

- **BMP280** — `SDA`/`SCL` a los pines I²C del ESP32. Dos cables, dos
  mediciones (temperatura + presión).
- **DHT22** — un solo GPIO de datos con su pull-up. Humedad y una segunda
  lectura de temperatura.
- **ILI9341** — el conjunto SPI: `MOSI`, `SCK`, `CS`, `DC`, `RST`. Haz clic
  derecho en cualquier pieza para ver [su pinout y hoja de datos](/docs/es/circuit-editor/part-inspector/).

Este proyecto fue diseñado, cableado y programado de principio a fin por
[el agente de IA de Velxio](/docs/es/ai/agent-mode/) — puedes construir lo mismo
simplemente pidiéndolo.

## 2. Ejecútalo

Pulsa **Run** (Ejecutar). El sketch se compila con la cadena de herramientas real de Arduino (observa
la consola de **Output** (Salida) resolver las librerías de Adafruit), el ESP32 arranca,
y:

![Estación meteorológica ejecutándose con TFT en vivo](../../../../assets/docs/getting-started/weather-running.png)

- La **TFT** dibuja el panel de control y se actualiza con lecturas en vivo.
- El **monitor serie** registra cada barrido de sensores:

![Salida serie de la estación meteorológica](../../../../assets/docs/getting-started/weather-serial.png)

## 3. Cambia el clima

Haz clic en el **BMP280** o en el **DHT22** mientras la simulación se ejecuta — sus
paneles de control de sensores te permiten arrastrar temperatura, humedad y presión.
El firmware lee los nuevos valores en su siguiente sondeo I²C/GPIO y la TFT
los sigue. Ese bucle — ajustar la entrada, observar cómo reacciona el dispositivo — es el
sentido de simular primero.

## 4. Hazlo tuyo

Trátalo como cualquier proyecto: cambia el diseño de la pantalla en el sketch, añade un
umbral que encienda un LED cuando la humedad supere el 70%, o cambia el DHT22
por otro sensor del [catálogo](/docs/es/parts/overview/). Luego
[guarda tu copia](/docs/es/getting-started/projects/).

## Constrúyelo desde cero

Si prefieres cablearlo tú mismo: empieza con una [plantilla](/docs/es/getting-started/projects/) de ESP32 en blanco,
añade las tres piezas desde el [selector](/docs/es/circuit-editor/placing-components/), cablea los buses como
se indicó arriba, y añade las librerías **Adafruit BMP280**, **DHT sensor library** y
**Adafruit ILI9341** ([cómo](/docs/es/programming/libraries/)).
O abre el [asistente de IA](/docs/es/ai/agent-mode/) y pídele que construya la
estación contigo — así nació esta.
----- END PAGE -----
