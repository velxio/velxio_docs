---
title: Raspberry Pi (Linux)
description: Placas Raspberry Pi, desde Zero hasta Pi 5. Python contra el circuito en el lienzo, en el navegador por defecto o en un invitado Linux en los servidores de Velxio, con lo que funciona en cada pieza medida parte por parte.
sidebar:
  order: 7
  badge: PRO
---

La familia Raspberry Pi ejecuta **scripts de Python contra el circuito en el
lienzo**. A diferencia de las placas microcontroladoras, no hay nada que compilar:
escribes un script, pulsas **Run** y Velxio elige uno de dos motores para
ejecutarlo. Ninguno de los dos motores es un escritorio de Raspberry Pi OS, así que lee esta página
antes de asumir que un tutorial escrito para hardware real funcionará sin cambios.
La mayoría lo hace: las tablas de abajo se midieron contra el producto en vivo,
parte por parte, el 2026-09-19 y el 2026-09-20.

| Placa                         | Perfil de CPU        |
| ----------------------------- | -------------------- |
| **Raspberry Pi Zero / 1 / 2** | Clase ARM Cortex-A7  |
| **Raspberry Pi 3**            | Cortex-A53           |
| **Raspberry Pi 4**            | Cortex-A72           |
| **Raspberry Pi 5**            | Cortex-A76           |

Cualquiera puede colocar una Pi en el lienzo y cablear un circuito a su alrededor. **Ejecutarla**
requiere un plan de pago, o una de las **tres sesiones de prueba gratuitas de 15
minutos** que toda cuenta con sesión iniciada recibe para la familia Pi (consulta
[planes](/docs/es/getting-started/plans/)). A un proyecto que no tiene nada que una Pi pueda
ejecutar, como un sketch `.ino` de Arduino en una placa Pi, se le avisa antes de gastar una sesión de prueba
en él.

![Raspberry Pi 5 en el lienzo de Velxio](../../../../assets/docs/boards/raspberry-pi-5.png)

## Dos motores

### Instantáneo (en tu navegador)

El predeterminado. Tu script se ejecuta en un intérprete de Python compilado a
WebAssembly dentro de la pestaña, arranca en unos pocos segundos y no necesita nada
de los servidores de Velxio. Las escrituras de pines llegan directamente al lienzo, así que un LED
se enciende en el momento en que se ejecuta `led.on()`. I2C, SPI y 1-Wire están ahí como los
archivos de dispositivo que tiene una Pi (`/dev/i2c-1`, `/dev/spidev0.0`, el
árbol `/sys/bus/w1/devices`), respondidos por las piezas cableadas en el lienzo, así que
los `smbus2`, `w1thermsensor` y Adafruit Blinka reales se ejecutan sin modificaciones.

Es un intérprete simple, no un sistema operativo: no hay shell, ni
`subprocess`, ni sockets sin procesar. Un script que pida uno de esos se envía
al motor Linux en su lugar; el **chip de motor** en la barra de herramientas indica qué
motor se ejecutará y, cuando es Linux, el archivo y la línea que lo pidieron.

### Linux (en los servidores de Velxio)

Un invitado Linux real arrancado en QEMU (`-M virt`, con el perfil de CPU de tu
placa) al que llegas a través de la consola serie en el espacio de trabajo. Sé
preciso sobre lo que es:

- **Alpine Linux**, no Raspberry Pi OS. `python3` y `pip` están instalados;
  `apt`, `raspi-config`, el escritorio y las herramientas de firmware de la Pi no están
  ahí.
- **Sin red** desde dentro del invitado, a propósito. Nada de ahí puede
  llegar a PyPI; los paquetes que un proyecto declara en `requirements.txt` son
  importables en el momento en que el invitado arranca, y `pip` mismo funciona sin conexión
  contra un wheelhouse local (abajo).
- **Los buses del header son archivos de dispositivo reales.** `/dev/i2c-0`, `/dev/i2c-1`,
  `/dev/spidev0.0` y `/dev/spidev0.1` responden a las mismas llamadas al sistema que
  hacen en una Pi, así que una biblioteca que los abre por sí misma (Adafruit Blinka), un programa
  en C, o tu propio código `ioctl` hablan con las piezas en el
  lienzo. Una dirección que nadie ocupa falla con `OSError: [Errno 121] Remote I/O error`,
  como en el hardware.
- **`smbus2` y `spidev` son los paquetes originales**, no sustitutos de Velxio:
  `import smbus2` te da el smbus2 real, `import spidev`
  un py-spidev compilado, y ambos pasan por esos nodos de dispositivo. Así que las
  reglas del kernel se aplican como en una placa. Una transferencia de bloque SMBus
  de más de 32 bytes falla con un error en lugar de acortarse silenciosamente,
  y abrir un bus que no existe, `SMBus(2)` por
  ejemplo, lanza una excepción en la llamada de apertura en lugar de en la primera lectura.
- **El UART del header es un puerto serie real.** `/dev/serial0` (también
  `/dev/ttyAMA0` y `/dev/ttyS0`) es un tty genuino controlado por el
  pyserial sin modificaciones: `serial.tools.list_ports`, `select()` en el puerto
  y `cat /dev/serial0` funcionan, y los bytes van a lo que esté cableado a
  GPIO14 y GPIO15 en el lienzo.
- **1-Wire está ahí como el árbol sysfs que tiene una Pi.** Un DS18B20 en GPIO4 aparece
  bajo `/sys/bus/w1/devices/28-*/` con `w1_slave` y `temperature`, así que
  `cat`, los lectores estilo `w1thermsensor` y tu propio código funcionan
  (`dtoverlay=w1-gpio,gpiopin=N` en un `config.txt` del proyecto mueve el
  pin).
- **`libcamera-jpeg`, `rpicam-jpeg`, `rpicam-still` y `libcamera-still`**
  toman una foto de la pieza de cámara en el lienzo, tal como un script los llama
  con `subprocess`. La imagen es el **patrón de prueba** de la pieza a menos
  que permitas que el invitado use tu webcam, cosa que Velxio pide la primera
  vez que un programa toma una foto (ver abajo).
- **GPIO tiene un dispositivo de caracteres real.** `/dev/gpiochip0` está ahí, y también
  lo está el obsoleto `/sys/class/gpio`, además de `RPi.GPIO` y `gpiozero`.
  Todavía **no** hay `/dev/gpiomem`, así que `pigpio`, que quiere los
  registros de periféricos, no tiene con qué hablar (ver abajo).
- El arranque tarda aproximadamente de 20 a 30 segundos, más cuando el servidor está ocupado; una
  superposición de "Booting" lo sigue. Una sesión de invitado termina después de **2 horas** como
  máximo.
- El invitado ejecuta **`script.py`** de tu proyecto cuando arranca. Nombra tu
  archivo principal así en modo Linux (el motor instantáneo ejecuta el primer
  `.py` que encuentra).

El botón **Linux terminal** en el espacio de trabajo fija este motor para el
resto de la sesión cuando quieres el shell, por ejemplo para inspeccionar archivos
o ejecutar un script a mano. La elección no se guarda con el proyecto: vuelve a abrirlo
mañana y Run vuelve a la respuesta del detector. Todo lo que el
motor instantáneo puede ejecutar es más rápido sin él.

## GPIO en el motor Linux: gpiochip0 y libgpiod

El invitado registra un dispositivo de caracteres GPIO con la propia identidad de la Pi,
así que el stack moderno que enseñan la documentación de Bookworm y la Pi 5 funciona
aquí. `gpiodetect` responde:

```text
gpiochip0 [pinctrl-bcm2835] (54 lines)
```

Las herramientas están instaladas (`gpiodetect`, `gpioinfo`, `gpioget`, `gpioset`,
`gpiomon`), y una línea que controlan llega a la pieza cableada a ese pin en
el lienzo.

La imagen incluye **libgpiod versión 1**, así que escribe los comandos a la
manera de la versión 1: el chip es un argumento posicional, no una opción `--chip`.

```bash
gpioset gpiochip0 17=1     # drive GPIO17 high
gpioget gpiochip0 5        # read GPIO5, prints 0 or 1
gpiomon gpiochip0 5        # print edges on GPIO5 as they arrive
```

La forma de la versión 2 (`gpioset --chip gpiochip0 17=1`) no se
entiende. Si un tutorial la usa, elimina la opción y pasa el chip
por sí solo.

Los bindings de Python también están preinstalados, de nuevo con la API de la versión 1:

```python
import gpiod

chip = gpiod.Chip("gpiochip0")
line = chip.get_line(17)
line.request(consumer="velxio", type=gpiod.LINE_REQ_DIR_OUT)
line.set_value(1)
```

`RPi.GPIO` y `gpiozero` no se ven afectados por esto y siguen siendo la forma más corta de
escribir un script. La interfaz sysfs obsoleta bajo `/sys/class/gpio`
también funciona, así que un tutorial antiguo que exporta un pin escribiendo en archivos
hace lo que dice. Lo que todavía está ausente es `/dev/gpiomem`, y con él
`pigpio`: esa biblioteca mapea los registros de periféricos directamente, y no
hay nada aquí que mapear.

El motor instantáneo no tiene dispositivo de caracteres: en tu navegador, GPIO es
`RPi.GPIO`, `gpiozero` o Blinka.

## La cámara en el motor Linux

Por defecto, las herramientas de cámara del invitado devuelven el **patrón de
prueba** de la pieza de cámara, y un script que toma una foto obtiene una imagen sin que se le
pregunte nada a nadie.

La primera vez que un programa pide una foto en el motor Linux con la
pieza de cámara en modo webcam, Velxio pregunta si puede usar tu webcam real
para ello. Tiene que preguntar por dónde se ejecuta el código: en el
motor instantáneo los fotogramas nunca salen de tu máquina, mientras que el invitado Linux
se ejecuta en los servidores de Velxio, así que permitirlo significa que los fotogramas se envían allí.

- Di **no** y las herramientas siguen devolviendo el patrón de prueba. Nada
  se rompe y ningún script tiene que cambiar.
- Di **sí** y las fotos son tu webcam real, **solo para esa sesión de página**.
  La respuesta no se guarda en el proyecto ni se recuerda después
  de una recarga, así que la próxima vez que abras la página se te preguntará de nuevo.

`picamera2` es otro asunto: sigue siendo un módulo del motor instantáneo.
En el invitado Linux, toma fotos con las herramientas de línea de comandos.

## Qué funciona, parte por parte

Cada fila es un script escrito como lo escribe un tutorial de Pi, ejecutado a través
del producto en vivo con la pieza cableada en el lienzo, en una Raspberry Pi 4.
Las filas de pantalla se comprueban en el propio lienzo: el panel tiene que encenderse,
no solo terminar el script.

| Qué | Biblioteca que usa el script | Instantáneo | Linux |
| --- | --- | --- | --- |
| LED y pulsador | `gpiozero` | Sí | Sí |
| LED desde el shell | `gpioset` (libgpiod 1) | No | Sí |
| Servo (PWM) | `gpiozero.Servo` | Sí | Sí |
| Acelerómetro MPU6050 | `smbus2` | Sí | Sí |
| Reloj de tiempo real DS3231 | `smbus2` | Sí | Sí |
| Sensor de presión BMP280 | `smbus2` | Sí | Sí |
| Temperatura y humedad SHT31 | `smbus2` | Sí | Sí |
| Driver PWM de 16 canales PCA9685 | `smbus2` | Sí | Sí |
| ADC ADS1115 | `smbus2` | Sí | Sí |
| LCD 16x2, backpack I2C | `smbus2` o `RPLCD.i2c` | Sí | Sí |
| LCD 16x2, paralelo (RS, E, D4 a D7) | `RPLCD.gpio` | Sí | Sí |
| OLED SSD1306 | `smbus2` | Sí | Sí |
| OLED SSD1306 | `luma.oled` | Sí | Sí |
| OLED SSD1306 | Adafruit Blinka + `adafruit_ssd1306` | Sí | Sí |
| TFT ILI9341 | `spidev` | Sí | Sí |
| Tarjeta microSD (modo SPI) | `spidev` | Sí | Sí |
| Sonda de temperatura DS18B20 | 1-Wire sysfs, `w1thermsensor` | Sí | Sí |
| Módulo GPS en el UART del header | `pyserial` en `/dev/serial0` | Sí | Sí |
| E-paper de 7.5" (UC8179) | `spidev` + `RPi.GPIO`, driver estilo Waveshare | Sí | Sí |
| Potenciómetro directo en un GPIO | | No (ver abajo) | No |

Las filas de OLED y LCD también se ejecutaron en una Raspberry Pi Zero en el motor
Linux, que es un invitado de 32 bits con su propia imagen.

## Qué no funciona

- **Entrada analógica en un GPIO.** Una Raspberry Pi **no tiene ADC**, tampoco en hardware
  real. Un potenciómetro, LDR o sensor de pulso cableado directamente a un
  GPIO solo lee alto o bajo, y la consola de ejecución lo dice. Pon un
  **ADS1115** (I2C) o un **MCP3008** (SPI) entre el sensor y la Pi,
  exactamente como lo harías en un banco; ambos están en el catálogo, y la galería
  tiene un ejemplo de MCP3008 con un potenciómetro.
- **`picamera2` en el motor Linux.** Usa tu webcam en el motor instantáneo,
  porque el script se ejecuta en tu navegador. En el invitado, las fotos
  vienen de `rpicam-jpeg` y sus hermanos en su lugar, sobre el patrón de prueba
  o sobre tu webcam una vez que lo hayas permitido (arriba).
- **Un driver de e-paper que envía su imagen al lugar equivocado.** En un panel UC8179
  (el de 7.5") el comando `0x10` es la imagen anterior y `0x13` es
  la que muestra el cristal. Un driver que escribe solo `0x10` obtiene una actualización en blanco
  aquí, exactamente como en el panel real, y el monitor serie (la
  terminal Linux, en ese motor) dice por qué. El pin BUSY también sigue al controlador: LOW mientras un panel UltraChip
  trabaja, HIGH en un SSD168x.
- **`pigpio` y `/dev/gpiomem`.** `pigpio` llega a los pines mapeando los
  registros de periféricos, y ningún motor le da ese mapeo. Usa
  `RPi.GPIO`, `gpiozero` o, en el motor Linux, `libgpiod` (arriba).
- **`libgpiod` / `gpiod` en el motor instantáneo.** El dispositivo de caracteres es cosa
  del motor Linux; en el navegador no hay `/dev/gpiochip0` que abrir.
- **Un script copiado de un tutorial de MicroPython.** `import machine`,
  `from gpio_lcd import GpioLcd` y compañía existen en una Pico o un ESP32, no
  en una placa que ejecuta el Python completo. La consola nombra el equivalente en Pi
  (`gpiozero`, `RPLCD`, `luma.oled`, `w1thermsensor`) en lugar de proponer un
  paquete para instalar.
- **PyTorch, TensorFlow.** Gigabytes, y nada aquí para acelerarlos.
  Se rechazan con esa explicación.

## Módulos de Python en cada motor

Ambos motores incluyen la biblioteca estándar. "Preinstalado" significa que funciona desde
la línea `import` sola, sin `requirements.txt`, tal como Raspberry Pi OS
tiene sus bibliotecas de hardware en la imagen.

| Módulo | Instantáneo (navegador) | Linux (invitado) |
| --- | --- | --- |
| `RPi.GPIO` | Preinstalado | Preinstalado |
| `gpiozero` | Preinstalado | Preinstalado (2.0.1) |
| `gpiod` (libgpiod 1) | Sin dispositivo de caracteres en el navegador | Preinstalado, con las herramientas `gpio*` |
| `smbus2` / `smbus` | Preinstalado (la biblioteca real) | Preinstalado (la biblioteca real) |
| `spidev` | Preinstalado | Preinstalado (un py-spidev compilado) |
| `serial` (pyserial) | Solo las rutas UART de la Pi | El pyserial 3.5 real en un tty real |
| `w1thermsensor` | Preinstalado | A través de `requirements.txt` (el árbol 1-Wire está ahí) |
| `luma.core`, `luma.oled`, `luma.lcd` | Preinstalado | Preinstalado |
| `RPLCD` | Preinstalado | Preinstalado |
| `ST7789` | Preinstalado | Preinstalado |
| `board`, `busio`, `digitalio` (Adafruit Blinka) | Preinstalado | Preinstalado |
| `adafruit_ssd1306`, `adafruit_rgb_display` | Preinstalado | Preinstalado |
| `PIL` (Pillow), `numpy` | Preinstalado | Preinstalado (Pillow 10.3, numpy 1.25) |
| `cv2` (OpenCV) | Sí | No (sin build para el invitado) |
| `picamera2` | Sí, sobre tu webcam | No (usa `rpicam-jpeg` / `libcamera-jpeg`) |
| `velxio_screen` | Sí | Sí |
| `requests` / `urllib` | Sí, a través del proxy de salida de Velxio con una lista de permitidos | Sin red |
| Cualquier otra cosa | A través de `requirements.txt` | A través de `requirements.txt` |

Las fuentes DejaVu están en el invitado en la ruta que usa Raspberry Pi OS
(`/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`), porque los tutoriales de pantallas
la codifican directamente.

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
Velxio lo resuelve antes de la ejecución y te dice, en la consola de ejecución, qué
instaló. Cuando un script importa un paquete que falta, la consola
ofrece la línea para añadir y un botón la escribe por ti. Qué motor puede aceptar
un paquete depende de cómo esté construido:

- Un paquete de Python puro (una rueda `py3-none-any`) se ejecuta en ambos motores.
- Un paquete con código compilado se ejecuta en el motor **instantáneo** cuando el
  runtime del navegador lo incluye (numpy, pillow, opencv-python, scikit-learn entre
  otros), y en el motor **Linux** solo si PyPI tiene una rueda **musl aarch64**
  para él (numpy, pandas, scipy y psutil la tienen). Los paquetes que solo
  publican ruedas glibc `manylinux` no se pueden instalar en el invitado.
- En una Raspberry Pi Zero, 1 o 2 el invitado es de 32 bits, y PyPI casi no tiene
  ruedas compiladas para él: ahí, quédate con lo que está preinstalado o con
  paquetes de Python puro.
- Los nombres que el invitado ya proporciona (`RPi.GPIO`, `smbus2`, `spidev`,
  `pyserial`, `gpiozero`, `gpiod`) nunca se descargan, así que un
  `requirements.txt` de un tutorial que los liste no hace daño.

Las ruedas cuentan contra la misma cuota de almacenamiento que las bibliotecas de Arduino.

### Ejecutar pip a mano en el invitado Linux

Nunca tienes que hacerlo. Lo que `requirements.txt` declara es importable en el
momento en que el invitado arranca, sin ningún paso de instalación. El comando real
también funciona, para alguien que siga un tutorial que lo detalla:

```bash
python3 -m venv --system-site-packages ~/.venv
~/.venv/bin/pip install -r requirements.txt
```

El invitado no tiene red, así que `pip` resuelve contra un wheelhouse local
que se incluye con los paquetes del proyecto; instala lo que el proyecto
declara, y no puede llegar a PyPI para nada más.

Sabe lo que cuesta antes de empezar, y no leas el silencio como un
cuelgue: en la CPU emulada, crear un virtualenv **con** pip tarda unos
cuatro minutos (unos seis segundos sin él), y la instalación en sí alrededor de
medio minuto. La espera no te da nada que no tuvieras ya, puesto que
los paquetes que declaraste ya están importados cuando obtienes un
prompt. Está ahí para las veces en que quieres el flujo de trabajo real.

El Python del sistema está marcado como gestionado externamente (PEP 668), exactamente como en
Raspberry Pi OS Bookworm, así que un `pip install` sin más fuera de un virtualenv
se rechaza con el mismo mensaje que da en la placa.

## Archivos

Un **panel de archivos** en el espacio de trabajo de la Pi sube scripts y archivos de datos al
proyecto; en modo Linux se copian al directorio home del invitado
antes de que arranque `script.py`.

## La UNIHIKER M10

La SBC educativa de DFRobot (una placa Linux con pantalla táctil incorporada) se ejecuta
en los mismos dos motores, con sus propios módulos `pinpong` y `unihiker` en
lugar de las bibliotecas de la Pi. Es una placa de pago con sus propias tres sesiones de prueba;
encuéntrala en el selector junto a la familia Pi.

## Arte de placa y pinouts

El arte del lienzo de cada placa y el mapa de pines completo, generados desde el simulador:

[Raspberry Pi 3 (arte también para Zero/1/2)](/docs/es/boards/reference/raspberry-pi-3/) ·
[Raspberry Pi 4](/docs/es/boards/reference/raspberry-pi-4/) ·
[Raspberry Pi 5](/docs/es/boards/reference/raspberry-pi-5/) ·
[UNIHIKER M10](/docs/es/boards/reference/unihiker-m10/)
