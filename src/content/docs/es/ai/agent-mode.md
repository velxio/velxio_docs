---
title: "Modo agente: construye contigo"
description: El asistente coloca componentes, los conecta, escribe el sketch, compila y ejecuta.
sidebar:
  order: 3
---

El modo **Agente** le da manos al asistente. Pide un circuito y este
añadirá los componentes, los conectará, escribirá el código, compilará y
ejecutará, directamente en tu lienzo, mientras lo observas:

![El panel de IA en modo Agente](../../../../assets/docs/ai/mode-agent.png)

Prueba indicaciones como:

- _"Construye un semáforo con 3 LEDs."_
- _"Añade una pantalla OLED a esta placa y muestra un contador en ella."_
- _"Mis lecturas de botón rebotan: corrige el sketch."_
- _"Convierte este proyecto a MicroPython."_

## Tú mantienes el control

Cada acción se refleja en tu proyecto normal: las piezas aparecen en el
lienzo, las ediciones se muestran en el editor de código y el historial
de deshacer es tuyo. Inspecciona lo que hizo, ajústalo o pide el
siguiente paso. Si una ejecución falla, el agente lee la salida del
compilador y el monitor serie de la misma manera que lo harías tú, e
itera.

## Trabajando bien con el agente

- **Pasos pequeños superan a los ensayos** — "añade un DHT22 e imprime la
  temperatura" da mejores resultados que un párrafo de requisitos.
- **Déjalo terminar** — un turno del agente puede incluir varias acciones
  (colocar, conectar, codificar, compilar, ejecutar); el panel narra
  mientras avanza.
- Adjunta una imagen del circuito que quieras reproducir: puede trabajar
  a partir de una foto o un esquema.

Los turnos del agente cuestan más **ciclos** que las respuestas de chat;
el contador de cuota en la parte inferior del panel rastrea lo que queda
hoy. Consulta [planes](/docs/es/getting-started/plans/).
