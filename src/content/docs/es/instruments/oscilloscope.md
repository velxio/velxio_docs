---
title: Osciloscopio
description: "Observa la forma de onda de cualquier pin en vivo: canales, base de tiempo y disparo."
sidebar:
  order: 2
---

Activa el osciloscopio con el botón **Scope** (osciloscopio) en la barra de herramientas. Se abre
como un panel inferior junto al monitor serie.

## Añadir un canal

Haz clic en **+ Add Channel** (añadir canal) y elige el pin de la placa a monitorear:

![Añadiendo un canal de osciloscopio](../../../../assets/docs/instruments/oscilloscope-add-channel.png)

Cada canal recibe un color y una etiqueta (placa + pin). Elimina uno con la
pequeña **x** debajo de su etiqueta.

## Leyendo la traza

Aquí el osciloscopio observa **GPIO2** — el pin del LED parpadeante del
[primer proyecto](/docs/es/getting-started/first-project/):

![Una onda cuadrada en el osciloscopio](../../../../assets/docs/instruments/oscilloscope.png)

## Controles

| Control            | Qué hace                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Time/div**       | Escala horizontal, de 0.1 ms a 500 ms por división. Ajústala a tu señal: un parpadeo de 1 s se lee mejor alrededor de 100 ms/div; un PWM de 1 kHz alrededor de 0.5 ms/div. |
| **Trigger**        | **Auto** (libre), **Normal** (solo dibuja con disparo) o **Single** (una captura). Elige el canal de disparo y el flanco: ascendente, descendente o cualquiera.            |
| **Pause / Resume** | Congela la pantalla para inspeccionar una forma de onda.                                                                                                                   |
| **Clear**          | Borra las trazas.                                                                                                                                                          |

## Qué probar

- **Medir un ciclo de trabajo PWM**: ejecuta un sketch de `analogWrite()`, observa el
  pin a 0.5 ms/div, compara el tiempo alto vs. el bajo.
- **Capturar un evento de una sola vez**: configura el disparo en **Single**, flanco ascendente, y luego
  presiona un botón en tu circuito.
- **Comparar dos señales**: añade dos canales — por ejemplo, las salidas A y B de un
  encoder — y observa su relación de fase.

----- END PAGE -----
