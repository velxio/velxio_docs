---
title: Arduino & AVR
description: Arduino UNO, Nano, Mega 2560 e o ATtiny85 puro.
sidebar:
  order: 2
---

A família AVR roda **inteiramente no seu navegador** — início instantâneo, sem
ida e volta à nuvem — com emulação AVR precisa em nível de ciclo.

| Placa                 | MCU                | Flash  | Notas                                                            |
| --------------------- | ------------------ | ------ | ---------------------------------------------------------------- |
| **Arduino UNO**       | ATmega328P, 16 MHz | 32 KB  | A placa padrão para iniciantes; 14 pinos digitais + 6 analógicos |
| **Arduino Nano**      | ATmega328P, 16 MHz | 32 KB  | Mesmo chip do UNO em um formato amigável para protoboard         |
| **Arduino Mega 2560** | ATmega2560, 16 MHz | 256 KB | 54 I/O digitais, 4 UARTs — para projetos que exigem muitos pinos |
| **ATtiny85**          | ATtiny85, 8 MHz    | 8 KB   | O chip DIP puro de 8 pinos, use diretamente na protoboard        |

**Linguagem:** Arduino C++.

## Detalhes que se comportam como hardware

- `analogWrite` PWM, temporizadores, interrupções (`attachInterrupt`), EEPROM e
  `Serial` em qualquer taxa de transmissão funcionam como no silício.
- O ADC lê o que o circuito analógico fornece — conecte um
  divisor de potenciômetro e o `analogRead` o acompanha.
- Uma variedade de peças clássicas de shields (LCDs, 74HC595s, servos, teclados
  matriciais) está no catálogo com exemplos.

## Bons exemplos para começar

O filtro **Arduino Uno** da galeria lista dezenas — contadores binários,
displays OLED, motores de passo com drivers A4988, monitores de bateria. Veja a
[galeria de exemplos](/docs/pt-br/getting-started/examples-gallery/).
