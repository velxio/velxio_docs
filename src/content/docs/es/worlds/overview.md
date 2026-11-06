---
title: Mundos 3D
description: Coloca tu circuito en una escena 3D o 2D. El firmware de la placa controla el robot, y los sensores del robot leen la escena de vuelta.
sidebar:
  order: 1
---

Un **Mundo** coloca tu circuito en una escena física. El firmware se ejecuta en
la placa emulada exactamente como lo haría en la real: los motores que controla
mueven un robot, los servos que ajusta giran un brazo o un sensor, y los
sensores de línea, distancia y movimiento leen lo que hay debajo y delante del
robot. El mismo código se ejecuta después en el hardware real.

![El seguidor de línea Romeo ESP32-S3 en su Mundo, junto al circuito en ejecución](../../../../assets/docs/worlds/romeo-running.png)

## Abrir el Mundo

Cada proyecto con una placa tiene un botón **3D** en la cabecera del lienzo,
junto al selector de placa:

![El botón 3D junto al selector de placa](../../../../assets/docs/worlds/3d-button.png)

La primera vez, abre una introducción con tres formas de empezar:

![La introducción al Mundo 3D](../../../../assets/docs/worlds/intro.png)

- **Start from a robot** (Empezar desde un robot): abre un proyecto de robot
  completo (placa, motores y sensores cableados, firmware y Mundo) y pulsa
  **Run**. Consulta el
  [seguidor de línea Romeo ESP32-S3](/docs/es/worlds/example-romeo-line-follower/)
  y el [tanque Devastator](/docs/es/worlds/example-devastator-tank/).
- **Create a world for this circuit** (Crear un mundo para este circuito):
  Velxio construye una escena inicial a partir de lo que hay en tu lienzo. Los
  motores se convierten en un robot (dos o cuatro ruedas), los sensores de
  línea obtienen una pista con cinta debajo, un sensor de distancia obtiene
  obstáculos delante, y los servos por sí solos se convierten en un brazo
  robótico sobre una mesa pequeña.
- **Copy AI prompt** (Copiar prompt de IA): copia un resumen con tus placas,
  componentes, cableado y firmware para ChatGPT, Claude o Gemini, de modo que
  una IA pueda escribir cualquier Mundo que describas. Consulta
  [Escribe tu propio Mundo](/docs/es/worlds/write-your-own/).

Una vez que el proyecto tiene un Mundo, el botón 3D alterna entre el Mundo y
tu código.

## Pulsa Run

Cuando comienza la simulación, el área del editor muestra el Mundo y el lienzo
permanece junto a él, para que puedas ver girar los motores en el circuito
mientras el robot se desplaza. El bucle se cierra unas 125 veces por segundo:

1. El firmware ajusta los pines: una dirección y un ciclo de trabajo PWM para
   cada motor, un pulso para cada servo.
2. Velxio lee la excitación de cada motor (a través del driver que use el
   circuito) y el ángulo de cada servo, y los envía al Mundo.
3. El Mundo mueve el robot y mide la escena: la cinta bajo cada sensor de
   línea, el obstáculo más cercano delante de cada sensor de distancia, la
   aceleración y la velocidad de giro del robot para una IMU.
4. Velxio escribe esas lecturas en los componentes sensores, y el firmware las
   lee en su siguiente `digitalRead()`, `pulseIn()` o transferencia I2C.

El Mundo se ejecuta con el **reloj simulado** de la placa, no con el tiempo
real. Si tu ordenador ejecuta la simulación a media velocidad, el robot también
se mueve a media velocidad, y sigue coincidiendo con el `millis()` del
firmware.

## La barra del Mundo

| Control            | Qué hace                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **World / HTML**   | Muestra la escena, o el código fuente `world.html` que hay detrás.                                        |
| **Guide**          | Una breve explicación del Mundo, sobre la escena.                                                         |
| **Copy AI prompt** | Copia el resumen para un chat de IA externo (consulta [Escribe tu propio Mundo](/docs/es/worlds/write-your-own/)). |
| **Reload**         | Reinicia el Mundo desde su archivo.                                                                       |
| **Full screen**    | Muestra solo el Mundo. Pulsa Esc para volver.                                                             |

Los Mundos creados con el kit de escenas de Velxio añaden su propia barra de
herramientas dentro de la escena: **Edit**, **Add**, **3D / 2D**, **Camera**
(órbita, seguir al robot, desde arriba) y **Reset** (devuelve los robots a su
posición inicial). Consulta [Construir una escena](/docs/es/worlds/scene-editor/).

## 3D o 2D

La vista 3D necesita WebGL. La vista superior **2D** dibuja la misma escena y
ejecuta la misma física sin tarjeta gráfica, así que funciona en cualquier
ordenador escolar, y es la alternativa cuando el 3D no está disponible.

![La arena del Devastator en la vista superior 2D](../../../../assets/docs/worlds/view-2d.png)

## Con qué funciona un Mundo

- **Lee**: motores de CC y motorreductores (detrás de un L293D, un transistor
  o MOSFET, el driver integrado de una placa, o directamente en un pin) y
  servos.
- **Alimenta**: el seguidor de línea DFRobot Gravity, los sensores
  ultrasónicos URM09 y URM37, el HC-SR04 y la IMU MPU6050.

Todos los demás componentes (LEDs, pantallas, zumbadores) siguen funcionando en
el lienzo. Detalles y recetas de firmware:
[Motores y sensores](/docs/es/worlds/motors-and-sensors/).

## Es un archivo

Un Mundo es un solo archivo, `world.html`, en el grupo de archivos de la placa
junto al sketch. Se guarda, se comparte y se exporta con el proyecto, y nunca
va a la placa: no se compila, no se escribe en la flash ni se copia a la
tarjeta microSD. Elimina el archivo y el proyecto se queda sin Mundo.
