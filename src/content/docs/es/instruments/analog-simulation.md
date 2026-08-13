---
title: Simulación analógica
description: El motor de clase SPICE detrás del lienzo — qué modela y cómo leer su insignia.
sidebar:
  order: 3
---

Velxio no solo propaga niveles digitales altos y bajos. Las partes analógicas
de tu circuito — resistencias, diodos, transistores, fuentes de alimentación — se
resuelven mediante un **motor de clase SPICE** que funciona acoplado a la simulación
digital, de la misma manera que lo hacen los simuladores de modo mixto en el escritorio.

## La insignia SPICE

La insignia amarilla sobre el circuito informa sobre la red analógica:

- **nets** — cuántos nodos eléctricos está resolviendo el motor.
- **solve time** — cuánto costó el último análisis.

Cuando un pin de una placa controla una red analógica (por ejemplo, un GPIO a través de una resistencia
hacia un LED), los flancos de los pines del firmware alimentan la resolución analógica, y los
voltajes y corrientes resultantes impulsan lo que ves — incluido el brillo del LED.

## Lo que se modela

- **Passives** — resistencias, potenciómetros y el propio cableado.
- **Diodos y LEDs** — comportamiento exponencial real de I/V con voltajes
  de polarización directa específicos por color.
- **Transistores** — transistores bipolares (NPN/PNP) con modelos de unión
  adecuados; los circuitos de control de motores y relés se comportan de manera realista.
- **Familias lógicas** — circuitos integrados lógicos discretos (serie 74xx y similares) modelados con
  niveles precisos según la familia.
- **Alimentación** — fuentes, reguladores y baterías en la categoría de alimentación.

El motor mejora continuamente versión tras versión; si un caso analógico exótico
se comporta de manera inesperada, simplifica el circuito o pregunta en la comunidad.

## El verificador de circuitos

Antes de una ejecución, Velxio revisa el circuito en busca de configuraciones que podrían
dañar componentes reales — el clásico siendo un LED conectado a una fuente **sin
resistencia en serie**. En modo eléctrico, el verificador bloquea la ejecución y
señala el problema; corrige el cableado y ejecuta de nuevo. Es una ventaja: el
simulador enseña el hábito que salva LEDs reales.
