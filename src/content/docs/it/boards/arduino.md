---
title: Arduino & AVR
description: Arduino UNO, Nano, Mega 2560 e il ATtiny85 nudo.
sidebar:
  order: 2
---

La famiglia AVR funziona **interamente nel tuo browser** — avvio immediato, nessun
viaggio di andata e ritorno nel cloud — con emulazione AVR accurata al ciclo.

| Scheda                 | MCU                | Flash  | Note                                                  |
| ---------------------- | ------------------ | ------ | ----------------------------------------------------- |
| **Arduino UNO**        | ATmega328P, 16 MHz | 32 KB  | La scheda predefinita per principianti; 14 pin digitali + 6 analogici |
| **Arduino Nano**       | ATmega328P, 16 MHz | 32 KB  | Stesso chip dell'UNO in un formato breadboard-friendly |
| **Arduino Mega 2560**  | ATmega2560, 16 MHz | 256 KB | 54 I/O digitali, 4 UART — per progetti che richiedono molti pin |
| **ATtiny85**           | ATtiny85, 8 MHz    | 8 KB   | Il chip DIP nudo a 8 pin, collegatelo direttamente su breadboard |

**Linguaggio:** Arduino C++.

## Dettagli che si comportano come l'hardware

- `analogWrite` PWM, timer, interrupt (`attachInterrupt`), EEPROM e
  `Serial` a qualsiasi baud rate funzionano come sul silicio.
- L'ADC legge qualunque cosa fornisca il circuito analogico — collegate un
  partitore potenziometrico e `analogRead` lo traccia.
- Una quantità di componenti tipici degli shield (LCD, 74HC595, servo,
  tastiere a matrice) è nel catalogo con esempi.

## Buoni esempi per iniziare

Il filtro **Arduino Uno** della galleria elenca dozzine — contatori binari,
display OLED, stepper con driver A4988, monitor di batteria. Consultate la
[galleria di esempi](/docs/it/getting-started/examples-gallery/).
