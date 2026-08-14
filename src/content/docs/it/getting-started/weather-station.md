---
title: "Tutorial: stazione meteorologica"
description: Un vero progetto multi-sensore — BMP280 su I2C, DHT22 su GPIO e un TFT ILI9341 su SPI, tutto su un singolo ESP32.
draft: true
sidebar:
  order: 3
---

Il [primo progetto](/docs/it/getting-started/first-project/) ha fatto lampeggiare un LED.
Questo è un dispositivo reale: un ESP32 che legge **temperatura e pressione su
I²C** (BMP280), **umidità su un GPIO** (DHT22), e disegna tutto su un
**display TFT su SPI** (ILI9341) — tre bus che lavorano contemporaneamente, nel
browser.

![La stazione meteorologica in funzione: i sensori alimentano il TFT in tempo reale](../../../../assets/docs/getting-started/weather-station.gif)

## 1. Apri il progetto

Apri il progetto pubblico:
[velxio.dev/dave/estacin-meteorolgica-esp32](https://velxio.dev/dave/estacin-meteorolgica-esp32).

![La stazione meteorologica all'apertura](../../../../assets/docs/getting-started/weather-loaded.png)

Prenditi un momento per leggere il circuito prima di eseguirlo:

- **BMP280** — `SDA`/`SCL` ai pin I²C dell'ESP32. Due fili, due
  misurazioni (temperatura + pressione).
- **DHT22** — un singolo GPIO dati con la sua resistenza di pull-up. Umidità e una seconda
  lettura di temperatura.
- **ILI9341** — il bundle SPI: `MOSI`, `SCK`, `CS`, `DC`, `RST`. Fai clic con il tasto destro
  su qualsiasi componente per vedere [il suo pinout e datasheet](/docs/it/circuit-editor/part-inspector/).

Questo progetto è stato progettato, cablato e programmato dall'inizio alla fine da
[l'agente AI di Velxio](/docs/it/ai/agent-mode/) — puoi costruire la stessa cosa
semplicemente chiedendolo.

## 2. Eseguilo

Premi **Run** (Esegui). Lo sketch viene compilato con la vera toolchain Arduino (guarda
la console **Output** risolvere le librerie Adafruit), l'ESP32 si avvia,
e:

![Stazione meteorologica in esecuzione con TFT live](../../../../assets/docs/getting-started/weather-running.png)

- Il **TFT** disegna la dashboard e si aggiorna con le letture in tempo reale.
- Il **serial monitor** registra ogni scansione dei sensori:

![Output seriale della stazione meteorologica](../../../../assets/docs/getting-started/weather-serial.png)

## 3. Cambia il meteo

Fai clic su **BMP280** o **DHT22** mentre la simulazione è in esecuzione — i loro
pannelli di controllo dei sensori ti permettono di trascinare temperatura, umidità e pressione.
Il firmware legge i nuovi valori al suo prossimo polling I²C/GPIO e il TFT
li segue. Quel ciclo — modifica l'input, osserva il dispositivo reagire — è il punto
centrale del simulare prima.

## 4. Rendilo tuo

Trattalo come qualsiasi progetto: cambia il layout del display nello sketch, aggiungi una
soglia che accende un LED quando l'umidità supera il 70%, o sostituisci il DHT22
con un altro sensore dal [catalogo](/docs/it/parts/overview/). Poi
[salva la tua copia](/docs/it/getting-started/projects/).

## Costruiscilo da zero, invece

Se preferisci cablarlo da solo: parti da un [template](/docs/it/getting-started/projects/) ESP32
vuoto, aggiungi i tre componenti dal
[selettore](/docs/it/circuit-editor/placing-components/), cabla i bus come
sopra, e aggiungi le librerie **Adafruit BMP280**, **DHT sensor library** e
**Adafruit ILI9341** ([come](/docs/it/programming/libraries/)).
Oppure apri l'[assistente AI](/docs/it/ai/agent-mode/) e chiedigli di costruire la
stazione con te — è così che è nata questa.
