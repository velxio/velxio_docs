---
title: Início rápido com MicroPython
description: Execute firmware MicroPython real — com REPL incluído — nas placas ESP32 e Pico.
sidebar:
  order: 3
---

O Velxio não aproxima o MicroPython — ele inicializa o **firmware MicroPython
real** no chip emulado. `import machine` se comporta como no
hardware, e o [monitor serial](/docs/pt-br/programming/serial-monitor/)
funciona também como REPL.

## Experimente com um clique

Abra o exemplo de luz noturna na galeria — um LDR (fotorresistor)
controlando um LED, em MicroPython puro:

![O exemplo de luz noturna em MicroPython](../../../../assets/docs/programming/micropython-editor.png)

Observe a barra de ferramentas: o seletor de idioma mostra **MicroPython** e a árvore
de arquivos exibe `main.py` em vez de um sketch. Pressione **Run** (Executar):

![A luz noturna em execução — arraste o LDR e observe o LED](../../../../assets/docs/programming/micropython-running.png)

Enquanto executa, clique no **fotorresistor** e arraste o nível de luz — a
leitura do ADC muda e o LED alterna exatamente como o código determina.

## O essencial

```python
from machine import Pin, ADC
import time

led = Pin(4, Pin.OUT)
ldr = ADC(Pin(34))

while True:
    if ldr.read() < 1000:   # dark
        led.on()
    else:
        led.off()
    time.sleep_ms(200)
```

- **`machine.Pin` / `ADC` / `PWM` / `I2C` / `SPI`** — controlam os mesmos
  periféricos simulados que os sketches do Arduino usam.
- **O REPL** — pare seu script e digite Python interativamente no
  monitor serial; `help()` funciona, a conclusão por tab funciona.
- **WiFi** — nas placas ESP32, `network.WLAN` conecta-se ao `Velxio-GUEST` como no
  hardware: veja [WiFi ESP32](/docs/pt-br/wifi-iot/esp32-wifi/).
- **Módulos extras** — adicione arquivos Python puros ao lado de `main.py` e importe-os;
  veja [Usando bibliotecas](/docs/pt-br/programming/libraries/).

## Quais placas

O MicroPython está disponível no Raspberry Pi **Pico / Pico W** (seu lar
nativo) e em toda a **família ESP32** — a matriz completa está em
[Idiomas](/docs/pt-br/programming/languages/). Alterne qualquer placa compatível para
MicroPython com o seletor de idioma da barra de ferramentas; o Velxio troca o
conjunto de arquivos para você.

----- END PAGE -----
