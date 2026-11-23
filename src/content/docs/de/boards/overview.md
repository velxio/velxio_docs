---
title: Unterstützte Boards
description: Jedes Board, das du in Velxio simulieren kannst, nach Familie.
sidebar:
  order: 1
---

Velxio simuliert Boards aus acht Familien. Einige laufen vollständig in deinem
Browser; größere laufen auf Velxios Cloud-Emulatoren — du musst nichts anders
machen, es funktioniert einfach, wenn du auf Play drückst.

| Familie              | Boards                                                                                                                                                                                              | Sprachen                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Arduino / AVR        | UNO, Nano, Mega, ATtiny85                                                                                                                                                                           | Arduino C++                                                   |
| ESP32 classic        | ESP32 DevKit, DevKit-C v4, ESP32-CAM, Lolin32 Lite                                                                                                                                                  | Arduino C++, MicroPython, ESP-IDF                             |
| ESP32-S3             | ESP32-S3, XIAO ESP32-S3, Arduino Nano ESP32                                                                                                                                                         | Arduino C++, MicroPython, ESP-IDF                             |
| ESP32-C3             | ESP32-C3, XIAO ESP32-C3, C3 SuperMini                                                                                                                                                               | Arduino C++, MicroPython, ESP-IDF                             |
| RP2040 / RP2350      | Raspberry Pi Pico, Pico W, Badger 2350 (Pro)                                                                                                                                                        | Arduino C++, MicroPython                                      |
| Seeed XIAO           | ESP32S3 Sense, ESP32C6, RP2040, RP2350, nRF52840 Sense, SAMD21, RA4M1, MG24 Sense, nRF54L15 Sense, die IPS Display Boards                                                                            | Arduino C++ (MicroPython auf den ESP32- und RP2040/RP2350-Modellen) |
| BBC micro:bit        | micro:bit V2, allein oder auf sieben DFRobot-Boards: Maqueen Lite und Lite V5, micro:Driver, micro:IO-BOX, IO Extender, micro:Mate, Robotics & Power IO Extender ([Seite](/docs/de/boards/microbit/)) | MicroPython                                                   |
| STM32                | Blue Pill, Black Pill, F4 Discovery, Olimex H405, Netduino                                                                                                                                          | Arduino C++                                                   |
| Raspberry Pi (Linux) | Zero, 1, 2, 3, 4, 5                                                                                                                                                                                 | Python in einem vollständigen Linux-Terminal                  |

Die Familien **STM32** und **Raspberry Pi (Linux)** laufen auf Velxios
Emulationsservern und erfordern einen kostenpflichtigen Plan; sie tragen ein
PRO-Badge in der Komponentenauswahl. Alle anderen Boards, einschließlich der
Marken-Boards wie dem M5Stack Cardputer und dem Badger 2350, laufen im
kostenlosen Plan — siehe [Pläne](/docs/de/getting-started/plans/).

Jedes Board hat in diesem Abschnitt eine eigene Seite mit seinem Pinout, den
unterstützten Sprachen und Besonderheiten.
