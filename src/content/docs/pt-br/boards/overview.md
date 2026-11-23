---
title: Placas suportadas
description: Todas as placas que você pode simular no Velxio, por família.
sidebar:
  order: 1
---

O Velxio simula placas de oito famílias. Algumas rodam inteiramente no seu
navegador; as maiores rodam nos emuladores em nuvem do Velxio — você não
precisa fazer nada diferente, simplesmente funciona quando você pressiona Play.

| Família              | Placas                                                                                                                                                                                              | Linguagens                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Arduino / AVR        | UNO, Nano, Mega, ATtiny85                                                                                                                                                                           | Arduino C++                                                   |
| ESP32 classic        | ESP32 DevKit, DevKit-C v4, ESP32-CAM, Lolin32 Lite                                                                                                                                                  | Arduino C++, MicroPython, ESP-IDF                             |
| ESP32-S3             | ESP32-S3, XIAO ESP32-S3, Arduino Nano ESP32                                                                                                                                                         | Arduino C++, MicroPython, ESP-IDF                             |
| ESP32-C3             | ESP32-C3, XIAO ESP32-C3, C3 SuperMini                                                                                                                                                               | Arduino C++, MicroPython, ESP-IDF                             |
| RP2040 / RP2350      | Raspberry Pi Pico, Pico W, Badger 2350 (Pro)                                                                                                                                                        | Arduino C++, MicroPython                                      |
| Seeed XIAO           | ESP32S3 Sense, ESP32C6, RP2040, RP2350, nRF52840 Sense, SAMD21, RA4M1, MG24 Sense, nRF54L15 Sense, as placas com IPS Display                                                                        | Arduino C++ (MicroPython nas placas ESP32 e RP2040/RP2350)    |
| BBC micro:bit        | micro:bit V2, sozinha ou encaixada em sete placas DFRobot: Maqueen Lite e Lite V5, micro:Driver, micro:IO-BOX, IO Extender, micro:Mate, Robotics & Power IO Extender ([página](/docs/pt-br/boards/microbit/)) | MicroPython                                                   |
| STM32                | Blue Pill, Black Pill, F4 Discovery, Olimex H405, Netduino                                                                                                                                          | Arduino C++                                                   |
| Raspberry Pi (Linux) | Zero, 1, 2, 3, 4, 5                                                                                                                                                                                 | Python em um terminal Linux completo                          |

As famílias **STM32** e **Raspberry Pi (Linux)** rodam nos servidores de
emulação do Velxio e exigem um plano pago; elas exibem um selo PRO no
seletor de componentes. Todas as outras placas, incluindo as de marca como a
M5Stack Cardputer e a Badger 2350, rodam no plano gratuito — veja
[planos](/docs/pt-br/getting-started/plans/).

Cada placa tem sua própria página nesta seção, com seu pinout, linguagens
suportadas e particularidades.
