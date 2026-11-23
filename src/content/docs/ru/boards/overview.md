---
title: Поддерживаемые платы
description: Все платы, которые можно симулировать в Velxio, по семействам.
sidebar:
  order: 1
---

Velxio симулирует платы из восьми семейств. Некоторые работают полностью в
вашем браузере; более крупные запускаются на облачных эмуляторах Velxio — вам
не нужно делать ничего по-другому, всё просто работает, когда вы нажимаете Play.

| Семейство            | Платы                                                                                                                                                                                               | Языки                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Arduino / AVR        | UNO, Nano, Mega, ATtiny85                                                                                                                                                                           | Arduino C++                                                   |
| ESP32 classic        | ESP32 DevKit, DevKit-C v4, ESP32-CAM, Lolin32 Lite                                                                                                                                                  | Arduino C++, MicroPython, ESP-IDF                             |
| ESP32-S3             | ESP32-S3, XIAO ESP32-S3, Arduino Nano ESP32                                                                                                                                                         | Arduino C++, MicroPython, ESP-IDF                             |
| ESP32-C3             | ESP32-C3, XIAO ESP32-C3, C3 SuperMini                                                                                                                                                               | Arduino C++, MicroPython, ESP-IDF                             |
| RP2040 / RP2350      | Raspberry Pi Pico, Pico W, Badger 2350 (Pro)                                                                                                                                                        | Arduino C++, MicroPython                                      |
| Seeed XIAO           | ESP32S3 Sense, ESP32C6, RP2040, RP2350, nRF52840 Sense, SAMD21, RA4M1, MG24 Sense, nRF54L15 Sense, платы с IPS-дисплеем                                                                             | Arduino C++ (MicroPython на платах ESP32 и RP2040/RP2350)     |
| BBC micro:bit        | micro:bit V2, отдельно или на семи платах DFRobot: Maqueen Lite и Lite V5, micro:Driver, micro:IO-BOX, IO Extender, micro:Mate, Robotics & Power IO Extender ([страница](/docs/ru/boards/microbit/))   | MicroPython                                                   |
| STM32                | Blue Pill, Black Pill, F4 Discovery, Olimex H405, Netduino                                                                                                                                          | Arduino C++                                                   |
| Raspberry Pi (Linux) | Zero, 1, 2, 3, 4, 5                                                                                                                                                                                 | Python в полноценном терминале Linux                          |

Семейства **STM32** и **Raspberry Pi (Linux)** работают на серверах
эмуляции Velxio и требуют платного плана; в средстве выбора компонентов они
отмечены значком PRO. Все остальные платы, включая брендовые, такие как
M5Stack Cardputer и Badger 2350, работают на бесплатном плане — см.
[планы](/docs/ru/getting-started/plans/).

У каждой платы есть собственная страница в этом разделе с распиновкой,
поддерживаемыми языками и особенностями.
