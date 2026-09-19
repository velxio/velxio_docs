---
title: Raspberry Pi (Linux)
description: Placas Raspberry Pi, desde la Zero hasta la Pi 5. Python contra el circuito en el lienzo, en el navegador por defecto o en un invitado Linux en los servidores de Velxio, con lo que funciona en cada pieza medida parte por parte.
sidebar:
  order: 7
  badge: PRO
---

La familia Raspberry Pi ejecuta **scripts de Python contra el circuito en el
lienzo**. A diferencia de las placas microcontroladoras, no hay nada que
compilar: escribes un script, pulsas **Run** y Velxio elige uno de dos
motores para ejecutarlo. Ningún motor es un escritorio de Raspberry Pi OS,
así que lee esta página antes de dar por hecho que un tutorial escrito para
hardware real funcionará sin cambios. La mayoría lo hacen: las tablas de
abajo se midieron contra el producto en vivo, parte por parte, el 2026-09-19.

| Placa                         | Perfil de CPU       |
| ----------------------------- | ------------------- |
| **Raspberry Pi Zero / 1 / 2** | Clase ARM Cortex-A7 |
| **Raspberry Pi 3**            | Cortex-A53          |
| **Raspberry Pi 4**            | Cortex-A72          |
| **Raspberry Pi 5**            | Cortex-A76          |

Cualquiera puede colocar una Pi en el lienzo y cablear un circuito a su
alrededor. **Ejecutarla** requiere un plan de pago, o una de las **tres
sesiones de prueba gratuitas de 15 minutos** que toda cuenta con sesión
iniciada recibe para la familia Pi (consulta
[planes](/docs/es/getting-started/plans/)). A un proyecto que no tiene nada que
una Pi pueda ejecutar, como un sketch `.ino` de Arduino en una placa Pi, se
le avisa antes de gastar una sesión de prueba.

![Raspberry Pi 5 en el lienzo de Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Dos motores

### Instantáneo (en tu navegador)

El predeterminado. Tu script se ejecuta en un intérprete de Python compilado
a WebAssembly dentro de la pestaña, arranca en unos segundos y no necesita
nada de los servidores de Velxio. Las escrituras de pines llegan directamente
al lienzo, así que un LED se enciende en el momento en que se ejecuta
`led.on()`. I2C, SPI y 1-Wire están ahí como los archivos de dispositivo que
tiene una Pi (`/dev/i2c-1`, `/dev/spidev0.0`, el árbol
`/sys/bus/w1/devices`), respondidos por las piezas cableadas en el lienzo, de
modo que los `smbus2`, `w1thermsensor` y Adafruit Blinka reales se ejecutan
sin modificaciones.

Es un intérprete simple, no un sistema operativo: no hay shell, ni
`subprocess`, ni sockets sin procesar. Un script que pida uno de esos se
envía al motor Linux en su lugar; el **engine chip** de la barra de
herramientas indica qué motor se ejecutará y, cuando es Linux, el archivo y
la línea que lo pidieron.

### Linux (en los servidores de Velxio)

Un invitado Linux real arrancado en QEMU (`-M virt`, con el perfil de CPU de
tu placa) al que accedes a través de la consola serie del espacio de trabajo.
Sé preciso sobre lo que es:

- **Alpine Linux**, no Raspberry Pi OS. `python3` y `pip` están instalados;
  `apt`, `raspi-config`, el escritorio y las herramientas de firmware de la
  Pi no están ahí.
- **Sin red** desde dentro del invitado, a propósito. `pip install` no puede
  alcanzar PyPI; los paquetes llegan a través de `requirements.txt` (abajo).
- **Los buses del header son archivos de dispositivo reales.** `/dev/i2c-1`,
  `/dev/spidev0.0` y `/dev/spidev0.1` responden a las mismas llamadas al
  sistema que en una Pi, así que una biblioteca que los abre por sí misma
  (Adafruit Blinka), un programa en C o tu propio código `ioctl` hablan con
  las piezas del lienzo. Una dirección que nadie ocupa falla con
  `OSError: [Errno 121] Remote I/O error`, como en hardware.
- **El UART del header es un puerto serie real.** `/dev/serial0` (también
  `/dev/ttyAMA0` y `/dev/ttyS0`) es un tty genuino controlado por el
  pyserial sin modificar: `serial.tools.list_ports`, `select()` sobre el
  puerto y `cat /dev/serial0` funcionan, y los bytes van a lo que esté
  cableado a GPIO14 y GPIO15 en el lienzo.
- **No** hay `/dev/gpiomem`, `/dev/gpiochip0`, `/sys/class/gpio` ni árbol
  1-Wire. GPIO pasa por `RPi.GPIO` y `gpiozero`, que sí están; `libgpiod`,
  `gpioinfo` y `pigpio` no tienen con qué hablar.
- El arranque tarda aproximadamente de 20 a 30 segundos, más cuando el
  servidor está ocupado; una superposición de "Booting" lo sigue. Una sesión
  de invitado termina después de **2 horas** como máximo.
- El invitado ejecuta **`script.py`** de tu proyecto cuando arranca. Nombra
  así tu archivo principal en modo Linux (el motor instantáneo ejecuta el
  primer `.py` que encuentra).

El botón **Linux terminal** del espacio de trabajo fija este motor para el
resto de la sesión cuando quieres la shell, por ejemplo para inspeccionar
archivos o ejecutar un script a mano. La elección no se guarda con el
proyecto: vuelve a abrirlo mañana y Run vuelve a la respuesta del detector.
Todo lo que el motor instantáneo puede ejecutar es más rápido sin él.

## Qué funciona, parte por parte

Cada fila es un script escrito como lo escribe un tutorial de Pi, ejecutado
contra el producto en vivo con la pieza cableada en el lienzo, en una
Raspberry Pi 4. Las filas de pantalla se comprueban en el propio lienzo: el
panel tiene que iluminarse, no solo terminar el script.

| Qué | Biblioteca que usa el script | Instantáneo | Linux |
| --- | --- | --- | --- |
| LED y pulsador | `gpiozero` | Sí | Sí |
| Servo (PWM) | `gpiozero.Servo` | Sí | Sí |
| Acelerómetro MPU6050 | `smbus2` | Sí | Sí |
| Reloj en tiempo real DS3231 | `smbus2` | Sí | Sí |
| Sensor de presión BMP280 | `smbus2` | Sí | Sí |
| Temperatura y humedad SHT31 | `smbus2` | Sí | Sí |
| Controlador PWM de 16 canales PCA9685 | `smbus2` | Sí | Sí |
| ADC ADS1115 | `smbus2` | Sí | Sí |
| LCD 16x2, backpack I2C | `smbus2` o `RPLCD.i2c` | Sí | Sí |
| LCD 16x2, paralelo (RS, E, D4 a D7) | `RPLCD.gpio` | Sí | Sí |
| OLED SSD1306 | `smbus2` | Sí | Sí |
| OLED SSD1306 | `luma.oled` | Sí | Sí |
| OLED SSD1306 | Adafruit Blinka + `adafruit_ssd1306` | Sí | Sí |
| TFT ILI9341 | `spidev` | Sí | Sí |
| Tarjeta microSD (modo SPI) | `spidev` | Sí | Sí |
| Sonda de temperatura DS18B20 | 1-Wire sysfs, `w1thermsensor` | Sí | **No** |
| Potenciómetro directo a un GPIO | | No (ver abajo) | No |

Las filas de OLED y LCD también se ejecutaron en una Raspberry Pi Zero en el
motor Linux, que es un invitado de 32 bits con su propia imagen.

## Qué no funciona

- **Entrada analógica en un GPIO.** Una Raspberry Pi **no tiene ADC**,
  tampoco en hardware real. Un potenciómetro, LDR o sensor de pulso cableado
  directamente a un GPIO solo lee alto o bajo, y la consola de ejecución lo
  dice. Pon un **ADS1115** (I2C) o un **MCP3008** (SPI) entre el sensor y la
  Pi, exactamente como lo harías en un banco; ambos están en el catálogo, y
  la galería tiene un ejemplo de MCP3008 con un potenciómetro.
- **1-Wire en el motor Linux.** El kernel del invitado no tiene soporte de
  1-Wire, así que un script de DS18B20 no encuentra ningún
  `/sys/bus/w1/devices` ahí. Funciona en el motor instantáneo, que es donde
  se ejecuta de todos modos un script que solo importa `w1thermsensor`.
- **La cámara en el motor Linux.** `picamera2` funciona en el motor
  instantáneo, alimentado por tu webcam o un patrón de prueba; el invitado no
  tiene cámara.
- **`pigpio`, `libgpiod` / `gpiod`, `/dev/gpiomem`.** No hay daemon ni
  dispositivo de caracteres GPIO en ningún motor. Usa `RPi.GPIO` o
  `gpiozero`.
- **Un script copiado de un tutorial de MicroPython.** `import machine`,
  `from gpio_lcd import GpioLcd` y similares existen en una Pico o un ESP32,
  no en una placa que ejecuta el Python completo. La consola nombra el
  equivalente en Pi (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) en
  lugar de proponer un paquete para instalar.
- **PyTorch, TensorFlow.** Gigabytes, y aquí no hay nada para acelerarlos. Se
  rechazan con esa explicación.

## Módulos de Python en cada motor

Ambos motores incluyen la biblioteca estándar. "Preinstalado" significa que
funciona solo con la línea `import`, sin `requirements.txt`, tal como
Raspberry Pi OS tiene sus bibliotecas de hardware en la imagen.

| Módulo | Instantáneo (navegador) | Linux (invitado) |
| --- | --- | --- |
| `RPi.GPIO` | Preinstalado | Preinstalado |
| `gpiozero` | Preinstalado | Preinstalado (2.0.1) |
| `smbus2` / `smbus` | Preinstalado (la biblioteca real) | Preinstalado |
| `spidev` | Preinstalado | Preinstalado |
| `serial` (pyserial) | Solo las rutas del UART de la Pi | El pyserial 3.5 real sobre un tty real |
| `w1thermsensor` | Preinstalado | No disponible (sin 1-Wire) |
| `luma.core`, `luma.oled`, `luma.lcd` | Preinstalado | Preinstalado |
| `RPLCD` | Preinstalado | Preinstalado |
| `ST7789` | Preinstalado | Preinstalado |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Preinstalado | Preinstalado |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Preinstalado | Preinstalado |
| `PIL` (Pillow), `numpy` | Preinstalado | Preinstalado (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Sí | No (sin build para el invitado) |
| `picamera2` | Sí, sobre tu webcam | No |
| `velxio_screen` | Sí | Sí |
| `requests` / `urllib` | Sí, a través del proxy de salida de Velxio con una lista de permitidos | Sin red |
| Cualquier otra cosa | A través de `requirements.txt` | A través de `requirements.txt` |

Las fuentes DejaVu están en el invitado en la ruta que usa Raspberry Pi OS
(`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), porque los tutoriales de
pantallas la codifican de forma fija.

```python
from luma.core.interface.serial import i2c
from luma.core.render import canvas
from luma.oled.device import ssd1306

import time

device = ssd1306(i2c(port=1, address=0x3C))
with canvas(device) as draw:
    draw.text((10, 20), "Hello from a Pi", fill="white")

# luma clears the panel when the script ends, as it does on hardware,
# so keep the script alive for as long as the text should stay up.
while True:
    time.sleep(1)
```

### Otros paquetes de terceros necesitan un `requirements.txt`

Añade un archivo `requirements.txt` junto a tu script, un paquete por línea;
Velxio lo resuelve antes de la ejecución y te dice, en la consola de
ejecución, qué instaló. Cuando un script importa un paquete que falta, la
consola ofrece la línea para añadir y un botón la escribe por ti. Qué motor
puede aceptar un paquete depende de cómo esté construido:

- Un paquete de Python puro (una rueda `py3-none-any`) se ejecuta en ambos
  motores.
- Un paquete con código compilado se ejecuta en el motor **instantáneo**
  cuando el entorno del navegador lo incluye (numpy, pillow, opencv-python,
  scikit-learn entre otros), y en el motor **Linux** solo si PyPI tiene una
  rueda **musl aarch64** para él (numpy, pandas, scipy y psutil la tienen).
  Los paquetes que solo publican ruedas glibc `manylinux` no se pueden
  instalar en el invitado.
- En una Raspberry Pi Zero, 1 o 2 el invitado es de 32 bits, y PyPI casi no
  tiene ruedas compiladas para él: ahí, quédate con lo preinstalado o con
  paquetes de Python puro.
- Los nombres que el invitado ya proporciona (`RPi.GPIO`, `smbus2`,
  `spidev`, `pyserial`, `gpiozero`) nunca se descargan, así que un
  `requirements.txt` de un tutorial que los liste no hace ningún daño.

Las ruedas cuentan contra la misma cuota de almacenamiento que las
bibliotecas de Arduino.

## Archivos

Un **file panel** en el espacio de trabajo de la Pi sube scripts y archivos
de datos al proyecto; en modo Linux se copian al directorio home del
invitado antes de que arranque `script.py`.

## La UNIHIKER M10

La SBC educativa de DFRobot (una placa Linux con pantalla táctil integrada)
se ejecuta en los mismos dos motores, con sus propios módulos `pinpong` y
`unihiker` en lugar de los shims de la Pi. Es una placa de pago con sus
propias tres sesiones de prueba; encuéntrala en el selector junto a la
familia Pi.

## Arte de placa y pinouts

El arte del lienzo y el mapa de pines completo de cada placa, generados desde
el simulador:

[Raspberry Pi 3 (arte también para Zero/1/2)](/docs/es/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/es/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/es/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/es/boards/reference/unihiker-m10/)
