---
title: Schede Pro
description: Il catalogo premium delle schede — M5Stack, Badger 2350, XIAO Sense, ESP32-C6, Galactic Unicorn, UNIHIKER.
sidebar:
  order: 8
  badge: PRO
---

Le schede Pro sono il livello premium del catalogo: hardware di marca con
periferiche integrate ricche, emulato abbastanza profondamente da avviare il
**firmware di fabbrica**. Fanno parte del catalogo ospitato su velxio.dev.

:::note[Quale piano serve?]
**Solo la UNIHIKER M10 richiede un piano a pagamento.** Ogni altra scheda in
questa pagina — M5Stack, Pimoroni, XIAO e la ESP32-C6 DevKit — **funziona con
il piano gratuito**. Le schede solo a pagamento sono esattamente la famiglia
STM32 e la famiglia Raspberry Pi Linux (a cui appartiene la UNIHIKER). Vedi
[piani](/docs/it/getting-started/plans/).
:::

## M5Stack

*Piano gratuito.*

### M5 Cardputer ADV

![M5 Cardputer ADV sul canvas di Velxio](../../../../assets/docs/boards/cardputer-adv.png)

Il computer tascabile ESP32-S3 con tastiera e TFT. Avvia il vero firmware
launcher M5; digita sulla tastiera a schermo, esegui le app, usa lo speaker.

### M5Stack Core

![M5Stack Core sul canvas di Velxio](../../../../assets/docs/boards/m5stack-core.png)

Il classico ESP32 impilabile con TFT 320x240 e tre pulsanti.

## Pimoroni

*Piano gratuito.*

### Badger 2350

![Pimoroni Badger 2350 sul canvas di Velxio](../../../../assets/docs/boards/badger-2350.png)

Il badge e-paper RP2350. Avvia il **firmware di fabbrica BadgeOS** completo:
naviga nel launcher con i pulsanti A/B/C/UP/DOWN, apri le app orologio,
badge e galleria, e osserva l'e-paper aggiornarsi come fa davvero l'e-paper.

### Galactic Unicorn

![Pimoroni Galactic Unicorn sul canvas di Velxio](../../../../assets/docs/boards/galactic-unicorn.png)

La matrice LED RGB 53x11 (583 pixel) pilotata da un Pico 2 W (RP2350) di
bordo, con i pulsanti A/B/C/D e volume/luminosità.

### Pico Plus 2 W

![Pimoroni Pico Plus 2 W sul canvas di Velxio](../../../../assets/docs/boards/pimoroni-pico-plus-2w.png)

La scheda RP2350B di Pimoroni nel footprint standard Pico (GP0..GP28 più
alimentazione), quindi qualsiasi cablaggio Pico si adatta direttamente.
GPIO, UART, USB seriale, I2C e SPI funzionano; il coprocessore WiFi CYW43
e la PSRAM non sono emulati.

## Seeed Studio XIAO

*Piano gratuito.*

### XIAO ESP32S3 Sense

![XIAO ESP32S3 Sense sul canvas di Velxio](../../../../assets/docs/boards/xiao-esp32s3-sense.png)

La S3 con modulo fotocamera, microfono PDM e microSD.

### XIAO ESP32C6

![XIAO ESP32C6 sul canvas di Velxio](../../../../assets/docs/boards/xiao-esp32c6.png)

La C6 RISC-V con WiFi 6 nel footprint XIAO.

### XIAO RP2040

![XIAO RP2040 sul canvas di Velxio](../../../../assets/docs/boards/xiao-rp2040.png)

La RP2040 XIAO con il suo NeoPixel.

## Espressif ESP32-C6

*Piano gratuito.*

![ESP32-C6 DevKit sul canvas di Velxio](../../../../assets/docs/boards/esp32-c6.png)

La **ESP32-C6 DevKit** — il chip RISC-V WiFi-6, con lo stesso trio di
linguaggi (Arduino / MicroPython / ESP-IDF) del resto della famiglia ESP32.

## DFRobot UNIHIKER M10

*Richiede piano a pagamento.*

![DFRobot UNIHIKER M10 sul canvas di Velxio](../../../../assets/docs/boards/unihiker-m10.png)

Un computer Linux a scheda singola con touchscreen integrato — documentato
con la [famiglia Raspberry Pi](/docs/it/boards/raspberry-pi/), poiché condivide
il flusso di lavoro Linux completo. Come il resto di quella famiglia, è
l'unica scheda in questa pagina che **richiede un piano a pagamento** per
funzionare.

---

Le schede Pro appaiono nel [selettore componenti](/docs/it/circuit-editor/placing-components/)
con un **badge PRO**; i [modelli iniziali](/docs/it/getting-started/projects/)
includono progetti pronti all'uso per ciascuna.

## Arte della scheda e pinout

L'arte su canvas di ogni scheda e la mappa completa dei pin, generate dal
simulatore:

[Badger 2350](/docs/it/boards/reference/badger-2350/) ·
[Galactic Unicorn](/docs/it/boards/reference/galactic-unicorn/) ·
[Pico Plus 2 W](/docs/it/boards/reference/pimoroni-pico-plus-2w/) ·
[M5 Cardputer ADV](/docs/it/boards/reference/cardputer-adv/) ·
[M5Stack Core](/docs/it/boards/reference/m5stack-core/) ·
[ESP32-C6 DevKit](/docs/it/boards/reference/esp32-c6/) ·
[XIAO ESP32S3 Sense](/docs/it/boards/reference/xiao-esp32s3-sense/) ·
[XIAO ESP32C6](/docs/it/boards/reference/xiao-esp32c6/) ·
[XIAO RP2040](/docs/it/boards/reference/xiao-rp2040/) ·
[UNIHIKER M10](/docs/it/boards/reference/unihiker-m10/)
