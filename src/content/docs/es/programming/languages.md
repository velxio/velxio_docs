---
title: Idiomas — Arduino, MicroPython, ESP-IDF
description: Qué idioma se ejecuta en cada placa y cómo cambiar.
sidebar:
  order: 2
---

El **selector de idioma** en la barra de herramientas cambia cómo se
escribe y compila el código de la placa activa. Cambiar de idioma
intercambia el conjunto de archivos del espacio de trabajo (un
`sketch.ino` se convierte en un `main.py`, y así sucesivamente).

## Arduino C++

El predeterminado en casi todas partes: los clásicos bocetos `setup()` /
`loop()`, compilados con el toolchain real de Arduino para el objetivo.
Use el botón **Libraries** (Bibliotecas) para añadir cualquier biblioteca
de Arduino publicada — consulte
[Libraries](/docs/es/programming/libraries/).

Disponible en todas las placas excepto en la familia Linux Raspberry Pi.

## MicroPython

Firmware real de MicroPython ejecutándose en el chip emulado — el REPL
funciona a través del monitor serie, `import machine` y similares se
comportan como en el hardware real.

Disponible en:

- **Raspberry Pi Pico / Pico W** (RP2040)
- **ESP32 clásico** — DevKit V1, DevKit-C v4, ESP32-CAM, Lolin32 Lite
- **ESP32-S3** — DevKit, XIAO ESP32-S3, Arduino Nano ESP32
- **ESP32-C3** — DevKit, XIAO ESP32-C3, C3 SuperMini

## ESP-IDF

Proyectos ESP-IDF puros (un punto de entrada `app_main()`, APIs IDF, sin
núcleo Arduino), compilados con el mismo toolchain de ESP-IDF. Para cuando
escribes lo que flashearías en producción.

Disponible en las mismas placas de la familia ESP32 que MicroPython
mencionado anteriormente.

## Python en Linux (Raspberry Pi)

Las placas Linux Raspberry Pi (Zero hasta 5) no usan el selector de
idioma: arrancan un Linux completo y trabajas en un shell real — ejecuta
Python con `gpiozero`/`RPi.GPIO` contra el GPIO simulado, exactamente
como en la Pi física. Consulte las [páginas de placas](/docs/es/boards/overview/).
