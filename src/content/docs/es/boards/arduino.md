---
title: Arduino y AVR
description: Arduino UNO, Nano, Mega 2560 y el ATtiny85 desnudo.
sidebar:
  order: 2
---

La familia AVR funciona **enteramente en tu navegador** — inicio instantáneo, sin
ida y vuelta a la nube — con emulación AVR de precisión de ciclos.

| Placa                  | MCU                | Flash  | Notas                                                   |
| ---------------------- | ------------------ | ------ | ------------------------------------------------------- |
| **Arduino UNO**        | ATmega328P, 16 MHz | 32 KB  | La placa predeterminada para principiantes; 14 pines digitales + 6 analógicos |
| **Arduino Nano**       | ATmega328P, 16 MHz | 32 KB  | El mismo chip que el UNO en una barra compatible con protoboard |
| **Arduino Mega 2560**  | ATmega2560, 16 MHz | 256 KB | 54 E/S digitales, 4 UARTs — para proyectos que necesitan muchos pines |
| **ATtiny85**           | ATtiny85, 8 MHz    | 8 KB   | El chip DIP desnudo de 8 pines, conéctalo directamente a la protoboard |

**Lenguaje:** Arduino C++.

## Detalles que se comportan como hardware real

- `analogWrite` PWM, temporizadores, interrupciones (`attachInterrupt`), EEPROM y
  `Serial` a cualquier velocidad de baudios funcionan como en silicio.
- El ADC lee lo que el circuito analógico proporcione — conecta un
  divisor con potenciómetro y `analogRead` lo seguirá.
- Una cantidad de componentes clásicos de shields (LCDs, 74HC595s, servos, teclados
  matriciales) están en el catálogo con ejemplos.

## Buenos ejemplos para empezar

El filtro **Arduino Uno** de la galería muestra docenas — contadores binarios,
pantallas OLED, motores paso a paso con drivers A4988, monitores de batería. Consulta la
[galería de ejemplos](/docs/es/getting-started/examples-gallery/).
