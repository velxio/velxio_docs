---
title: Arduino & AVR
description: Arduino UNO, Nano, Mega 2560 und der nackte ATtiny85.
sidebar:
  order: 2
---

Die AVR-Familie läuft **vollständig in Ihrem Browser** — sofortiger Start, keine
Cloud-Round-Trip — mit zyklusgenauer AVR-Emulation.

| Board                 | MCU                | Flash  | Notizen                                                          |
| --------------------- | ------------------ | ------ | ---------------------------------------------------------------- |
| **Arduino UNO**       | ATmega328P, 16 MHz | 32 KB  | Das Standard-Einsteigerboard; 14 digitale + 6 analoge Pins       |
| **Arduino Nano**      | ATmega328P, 16 MHz | 32 KB  | Gleicher Chip wie der UNO in einem breadboard-freundlichen Stick |
| **Arduino Mega 2560** | ATmega2560, 16 MHz | 256 KB | 54 digitale I/O, 4 UARTs — für pin-hungrige Projekte             |
| **ATtiny85**          | ATtiny85, 8 MHz    | 8 KB   | Der nackte 8-Pin-DIP-Chip, direkt auf dem Breadboard             |

**Sprache:** Arduino C++.

## Details, die sich wie Hardware verhalten

- `analogWrite` PWM, Timer, Interrupts (`attachInterrupt`), EEPROM und
  `Serial` mit jeder Baudrate funktionieren wie auf Silizium.
- Der ADC liest, was die analoge Schaltung liefert — verdrahten Sie einen
  Potentiometer-Spannungsteiler und `analogRead` verfolgt ihn.
- Eine Auswahl klassischer Shield-Komponenten (LCDs, 74HC595s, Servos, Matrix-
  Tastaturen) ist mit Beispielen im Katalog enthalten.

## Gute Einstiegsbeispiele

Der **Arduino Uno**-Filter der Galerie listet Dutzende — Binärzähler,
OLED-Displays, Schrittmotoren mit A4988-Treibern, Batteriemonitore. Siehe
[Beispielgalerie](/docs/de/getting-started/examples-gallery/).
