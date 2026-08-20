---
title: Placas Pro
description: O catálogo premium de placas — M5Stack, Badger 2350, XIAO Sense, ESP32-C6, Galactic Unicorn, UNIHIKER.
sidebar:
  order: 8
---

As placas Pro são o nível premium do catálogo: hardware de marca com
periféricos integrados ricos, emulados profundamente o suficiente para
inicializar o **firmware de fábrica**. Elas fazem parte do catálogo
hospedado em velxio.dev.

:::note[De qual plano elas precisam?]
**Apenas a UNIHIKER M10 requer um plano pago.** Todas as outras placas
nesta página — M5Stack, Pimoroni, XIAO e o ESP32-C6 DevKit — **funcionam
no plano gratuito**. As placas exclusivas para planos pagos são
exatamente a família STM32 e a família Raspberry Pi Linux (à qual a
UNIHIKER pertence). Consulte [planos](/docs/pt-br/getting-started/plans/).
:::

## M5Stack

*Plano gratuito.*

### M5 Cardputer ADV

![M5 Cardputer ADV no canvas do Velxio](../../../../assets/docs/boards/cardputer-adv.png)

O computador de bolso ESP32-S3 com teclado e TFT. Inicializa o firmware
real do launcher M5; digite no teclado na tela, execute aplicativos,
use o alto-falante.

### M5Stack Core

![M5Stack Core no canvas do Velxio](../../../../assets/docs/boards/m5stack-core.png)

O clássico ESP32 empilhável com TFT 320x240 e três botões.

## Pimoroni

*Plano gratuito.*

### Badger 2350

![Pimoroni Badger 2350 no canvas do Velxio](../../../../assets/docs/boards/badger-2350.png)

O crachá de e-paper RP2350. Ele inicializa o **firmware completo do
BadgeOS**: navegue pelo launcher com os botões A/B/C/UP/DOWN, abra os
aplicativos de relógio, crachá e galeria, e veja o e-paper atualizar
da forma que o e-paper realmente faz.

### Galactic Unicorn

![Pimoroni Galactic Unicorn no canvas do Velxio](../../../../assets/docs/boards/galactic-unicorn.png)

A matriz de LED RGB 53x11 (583 pixels) controlada por um Pico 2 W
(RP2350) integrado, com os botões A/B/C/D e volume / brilho.

### Pico Plus 2 W

![Pimoroni Pico Plus 2 W no canvas do Velxio](../../../../assets/docs/boards/pimoroni-pico-plus-2w.png)

A placa RP2350B da Pimoroni no formato padrão Pico (GP0..GP28 mais
alimentação), então qualquer conexão Pico se encaixa diretamente nela.
GPIO, UART, USB serial, I2C e SPI funcionam; o coprocessador WiFi CYW43
e a PSRAM não são emulados.

## Seeed Studio XIAO

*Plano gratuito.*

### XIAO ESP32S3 Sense

![XIAO ESP32S3 Sense no canvas do Velxio](../../../../assets/docs/boards/xiao-esp32s3-sense.png)

O S3 com o módulo de câmera, microfone PDM e microSD.

### XIAO ESP32C6

![XIAO ESP32C6 no canvas do Velxio](../../../../assets/docs/boards/xiao-esp32c6.png)

O C6 RISC-V com capacidade WiFi 6 no formato XIAO.

### XIAO RP2040

![XIAO RP2040 no canvas do Velxio](../../../../assets/docs/boards/xiao-rp2040.png)

O RP2040 XIAO com seu NeoPixel.

## Espressif ESP32-C6

*Plano gratuito.*

![ESP32-C6 DevKit no canvas do Velxio](../../../../assets/docs/boards/esp32-c6.png)

O **ESP32-C6 DevKit** — o chip RISC-V WiFi-6, com o mesmo trio de
linguagens (Arduino / MicroPython / ESP-IDF) que o restante da família
ESP32.

## DFRobot UNIHIKER M10

*Plano pago necessário.*

![DFRobot UNIHIKER M10 no canvas do Velxio](../../../../assets/docs/boards/unihiker-m10.png)

Um computador de placa única Linux com tela de toque integrada —
documentado com a [família Raspberry Pi](/docs/pt-br/boards/raspberry-pi/),
já que compartilha o fluxo de trabalho Linux completo. Como o restante
dessa família, é a única placa nesta página que **precisa de um plano
pago** para funcionar.

---

As placas Pro aparecem no [seletor de componentes](/docs/pt-br/circuit-editor/placing-components/)
com um **PRO badge**; os [modelos iniciais](/docs/pt-br/getting-started/projects/)
incluem projetos prontos para executar para cada uma.

## Arte da placa e pinagens

A arte no canvas e o mapa completo de pinos de cada placa, gerados a
partir do simulador:

[Badger 2350](/docs/pt-br/boards/reference/badger-2350/) ·
[Galactic Unicorn](/docs/pt-br/boards/reference/galactic-unicorn/) ·
[Pico Plus 2 W](/docs/pt-br/boards/reference/pimoroni-pico-plus-2w/) ·
[M5 Cardputer ADV](/docs/pt-br/boards/reference/cardputer-adv/) ·
[M5Stack Core](/docs/pt-br/boards/reference/m5stack-core/) ·
[ESP32-C6 DevKit](/docs/pt-br/boards/reference/esp32-c6/) ·
[XIAO ESP32S3 Sense](/docs/pt-br/boards/reference/xiao-esp32s3-sense/) ·
[XIAO ESP32C6](/docs/pt-br/boards/reference/xiao-esp32c6/) ·
[XIAO RP2040](/docs/pt-br/boards/reference/xiao-rp2040/) ·
[UNIHIKER M10](/docs/pt-br/boards/reference/unihiker-m10/)
