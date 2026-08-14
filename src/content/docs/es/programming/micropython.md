---
title: Inicio rápido con MicroPython
description: Ejecuta firmware real de MicroPython (REPL incluido) en placas ESP32 y Pico.
sidebar:
  order: 3
---

Velxio no simula MicroPython de forma aproximada: inicia el **firmware real
de MicroPython** en el chip emulado. `import machine` se comporta igual que
en el hardware, y el [monitor serie](/docs/es/programming/serial-monitor/)
funciona también como REPL.

## Pruébalo con un clic

Abre el ejemplo de luz nocturna de la galería: un LDR (fotorresistor)
que controla un LED, en MicroPython puro:

![El ejemplo de luz nocturna en MicroPython](../../../../assets/docs/programming/micropython-editor.png)

Observa la barra de herramientas: el selector de idioma muestra **MicroPython**
y el árbol de archivos muestra `main.py` en lugar de un sketch. Pulsa **Run** (Ejecutar):

![La luz nocturna en funcionamiento: arrastra el LDR y observa el LED](../../../../assets/docs/programming/micropython-running.png)

Mientras se ejecuta, haz clic en el **fotorresistor** y arrastra su nivel de luz:
la lectura del ADC cambia y el LED se enciende o apaga exactamente según lo que decide el código.

## Lo esencial

```python
from machine import Pin, ADC
import time

led = Pin(4, Pin.OUT)
ldr = ADC(Pin(34))

while True:
    if ldr.read() < 1000:   # oscuro
        led.on()
    else:
        led.off()
    time.sleep_ms(200)
```

- **`machine.Pin` / `ADC` / `PWM` / `I2C` / `SPI`** — controlan los mismos
  periféricos simulados que los sketches de Arduino.
- **El REPL** — detén tu script y escribe Python de forma interactiva en el
  monitor serie; `help()` funciona y también el autocompletado con tabulador.
- **WiFi** — en placas ESP32, `network.WLAN` se conecta a `Velxio-GUEST` igual
  que en el hardware: consulta [WiFi ESP32](/docs/es/wifi-iot/esp32-wifi/).
- **Módulos adicionales** — añade archivos Python puros junto a `main.py` e
  impórtalos; consulta [Uso de librerías](/docs/es/programming/libraries/).

## Qué placas

MicroPython está disponible en Raspberry Pi **Pico / Pico W** (su hogar
nativo) y en toda la **familia ESP32**; la matriz completa está en
[Idiomas](/docs/es/programming/languages/). Cambia cualquier placa compatible a
MicroPython con el selector de idioma de la barra de herramientas; Velxio
intercambia el conjunto de archivos por ti.
