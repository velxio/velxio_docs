---
title: "BBC micro:bit"
description: "La BBC micro:bit V2 y siete placas DFRobot para ella, ejecutando el firmware oficial de MicroPython en tu navegador."
sidebar:
  order: 5.5
---

La **BBC micro:bit V2** se ejecuta en Velxio con su propio firmware oficial de
MicroPython (2.1.1), sin modificar, sobre un motor en el navegador para su chip
nRF52833. Escribe MicroPython, pulsa **Run** (Ejecutar) y el programa se ejecuta
en la pestaña de tu navegador, en todos los planes, incluido el gratuito.

![La BBC micro:bit V2 en el lienzo de Velxio](../../../../assets/docs/boards/microbit-v2.png)

## Qué se ejecuta

- La matriz de LEDs de 5x5, los botones A y B y el logo táctil, sobre un dibujo
  en el que puedes hacer clic.
- El sensor de movimiento (inclina la almohadilla bajo la placa), y el rumbo de
  la brújula, la temperatura, el nivel de luz y el nivel de sonido, ajustados
  desde el panel de sensores de la placa.
- El altavoz, una vez que actives el sonido en ese panel, y el conector de
  borde: conecta LEDs, potenciómetros, servos o sensores Grove a sus anillos y
  tiras como en la placa real.
- Un REPL en el **Serial** Monitor (Monitor Serie), y **Upload firmware**
  (Cargar firmware) para un `.hex` de MicroPython guardado desde
  python.microbit.org, cuyos archivos se abren en el editor.

**Solo MicroPython** por ahora: ni Arduino/C++ ni bloques de MakeCode (un `.hex`
de MakeCode todavía no arranca). La radio entre dos micro:bits y el Bluetooth no
están modelados.

## Empieza aquí

- [Hello, World! en la matriz de LEDs](https://velxio.dev/example/microbit-v2-hello)
- [Botones A y B](https://velxio.dev/example/microbit-v2-buttons)
- [Nivel de burbuja](https://velxio.dev/example/microbit-v2-spirit-level), sobre
  el acelerómetro
- [Termómetro](https://velxio.dev/example/microbit-v2-thermometer), sobre la
  temperatura del propio chip

## Placas DFRobot para la micro:bit

Siete placas DFRobot están en Velxio, cada una su propia placa en el lienzo:
colócala y la micro:bit aparece encajada en su zócalo, con la matriz y los
botones todavía a mano. Una placa con chips se abre con un controlador de
MicroPython junto a `main.py` (`maqueen.py`, `maqueen_v5.py`, `microdriver.py`,
`microiobox.py`) que escribe los mismos bytes que los propios bloques de
MakeCode de DFRobot.

![La micro:bit V2 encajada en una DFRobot Maqueen Lite en el lienzo de Velxio](../../../../assets/docs/boards/microbit-v2-maqueen-lite.png)

### Maqueen Lite

El pequeño robot de dos ruedas de DFRobot (ROB0148-EN): dos motores tras un
controlador en I2C, dos faros, dos sensores de línea, cuatro LEDs RGB y un
zócalo para ultrasonidos. En un 3D World el propio Maqueen es el robot.
[Seguidor de línea](https://velxio.dev/example/microbit-v2-maqueen-lite-line) ·
[Conduce y parpadea los faros](https://velxio.dev/example/microbit-v2-maqueen-lite-drive) ·
[Tienda DFRobot](https://www.dfrobot.com/product-1783.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite)

### Maqueen Lite V5

El Maqueen Lite actual (MBT0046): faros RGB, tres sensores de línea, dos
sensores de luz y un nivel de batería tras su propio controlador en I2C.
[Faros de color y sensores de luz](https://velxio.dev/example/microbit-v2-maqueen-lite-v5-lights) ·
[Tienda DFRobot](https://www.dfrobot.com/product-2937.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-maqueen-lite-v5)

### micro:Driver

Cuatro salidas de motor de CC y ocho conectores de servo desde un único chip
PCA9685 en I2C (DFR0548), más nueve pines de la micro:bit en conectores de 3
pines.
[Dos servos y un motor de CC](https://velxio.dev/example/microbit-v2-micro-driver-servos) ·
[Tienda DFRobot](https://www.dfrobot.com/product-1738.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-driver)

### micro:IO-BOX

Un controlador de robot compacto (MBT0005): un controlador de motor de dos vías
en I2C, nueve conectores IO, puertos I2C y UART y un zumbador en P0.
[Dos motores hacia delante y hacia atrás](https://velxio.dev/example/microbit-v2-io-box-motors) ·
[Tienda DFRobot](https://www.dfrobot.com/product-1847.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-box)

### IO Extender

Un breakout (MBT0008) con todos los pines del conector de borde en un conector
de 3 pines (señal, 3.3 V, tierra), tres puertos I2C y un zumbador en P0 con un
interruptor.
[Un sensor de luz en P1](https://velxio.dev/example/microbit-v2-io-extender-light) ·
[Tienda DFRobot](https://www.dfrobot.com/product-1867.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-io-extender)

### micro:Mate

Una placa del tamaño de la micro:bit (DFR0518) que se atornilla sobre su parte
frontal, con seis conectores Gravity de 3 pines: P0, P1 y P2 a 3.3 V, P8, P12 y
P16 a 5 V.
[Un sensor de luz en P0](https://velxio.dev/example/microbit-v2-micro-mate-light) ·
[Tienda DFRobot](https://www.dfrobot.com/product-1699.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-micro-mate)

### Robotics & Power IO Extender

Un breakout completo para la micro:bit (DFR1231) con los conectores del IO
Extender en el mismo orden y con los mismos nombres de pin, de modo que un
proyecto pasa de uno a otro sin renombrar un cable.
[Un sensor de luz en P1](https://velxio.dev/example/microbit-v2-robotics-io-extender-light) ·
[Tienda DFRobot](https://www.dfrobot.com/product-2963.html?tracking=rzqVux&utm_source=velxio&utm_medium=docs-family&utm_content=microbit-v2-robotics-io-extender)

_Los enlaces a la tienda de esta página son enlaces de afiliado: Velxio gana una pequeña comisión sin coste adicional para ti._

## Arte de las placas y pinouts

El arte del lienzo y el mapa de pines completo de cada placa, generados desde el
simulador:

[BBC micro:bit V2](/docs/es/boards/reference/microbit-v2/) ·
[Maqueen Lite](/docs/es/boards/reference/microbit-v2-maqueen-lite/) ·
[Maqueen Lite V5](/docs/es/boards/reference/microbit-v2-maqueen-lite-v5/) ·
[micro:Driver](/docs/es/boards/reference/microbit-v2-micro-driver/) ·
[micro:IO-BOX](/docs/es/boards/reference/microbit-v2-io-box/) ·
[IO Extender](/docs/es/boards/reference/microbit-v2-io-extender/) ·
[micro:Mate](/docs/es/boards/reference/microbit-v2-micro-mate/) ·
[Robotics & Power IO Extender](/docs/es/boards/reference/microbit-v2-robotics-io-extender/)

---

BBC micro:bit es una marca registrada de la Micro:bit Educational Foundation.
Velxio funciona con la micro:bit; no está fabricado ni respaldado por la
Foundation. La micro:bit en sí se vende a través de los distribuidores que la
Foundation enumera en [microbit.org](https://microbit.org/buy/).
