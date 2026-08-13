---
title: Controlando la simulación
description: Ejecuta, detén, reinicia e interactúa con un circuito en vivo.
sidebar:
  order: 6
---

## Ejecutar / Detener / Reiniciar

Los tres botones de transporte en la barra de herramientas:

- **Run** (Ejecutar) — compila si es necesario, inicia el firmware, arranca el mundo.
- **Stop** (Detener) — detiene la simulación. El circuito conserva su dibujo pero
  no se ejecuta nada.
- **Reset** (Reiniciar) — reinicia el firmware desde el principio sin recompilar.

El punto de estado junto al nombre de la placa en el árbol de archivos sigue el estado:
Inactivo, Compilado, Ejecutándose.

## Interactuar mientras se ejecuta

El lienzo está activo durante la simulación:

- **Buttons and switches** (Botones e interruptores) responden a los clics.
- **Potentiometers, encoders and sensors** (Potenciómetros, codificadores y sensores) exponen controles para cambiar sus
  valores — la temperatura de un DHT22, el nivel de luz de un LDR — y el firmware
  ve el cambio inmediatamente.
- **Displays, LEDs and motors** (Pantallas, LED y motores) representan su estado real de accionamiento.

Las ediciones de propiedades desde el [inspector de partes](/docs/es/circuit-editor/part-inspector/)
también se aplican en vivo.

## Múltiples placas

Un proyecto puede contener **más de una placa**, cada una con su propio código, pestaña
serial y estado de **Run** — el selector de placa en la barra de herramientas elige a cuál
apuntan el editor de código y los botones de transporte. Las placas pueden comunicarse entre
sí a través de buses cableados, que es como funcionan los ejemplos de múltiples chips.

## El motor analógico

La actividad de los pines digitales y las partes analógicas se resuelven juntas: la insignia
amarilla **SPICE** sobre el circuito muestra el tamaño de la red analógica y el tiempo de
resolución. Cuando un circuito dañaría una parte (un LED sin resistencia en serie,
en modo eléctrico), el verificador lo señala antes de que comience la ejecución — corrige el
cableado o el valor y ejecuta **Run** de nuevo.
----- END PAGE -----
