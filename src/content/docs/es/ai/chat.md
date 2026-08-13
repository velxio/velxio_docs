---
title: Modo básico — chat
description: Un chat de soporte que conoce tu proyecto: errores, conceptos, preguntas sobre cableado.
sidebar:
  order: 2
---

El modo **Básico** es un chat con tu proyecto como contexto: el asistente ve
el circuito en el lienzo y el código en el editor, así que puedes hacer
preguntas de la misma manera que le preguntarías a un colega en el banco de trabajo contiguo:

![El panel de IA en modo Básico](../../../../assets/docs/ai/mode-basic.png)

Buenas preguntas para el modo Básico:

- _"¿Por qué mi LED no parpadea?"_
- _"¿Qué significa este error de compilación?"_ (pégalo, o simplemente pregunta — puede
  leer la salida)
- _"¿Qué pin debería usar para I2C en esta placa?"_
- _"Explica qué hace este sketch línea por línea."_

## Mecánica

- **Enter** envía, **Shift+Enter** crea una nueva línea.
- **Adjunta una imagen** con el clip (PNG/JPEG/WebP/GIF hasta 4 MB) —
  una foto de un breadboard real, un esquemático, una captura de pantalla.
- **Sesiones**: inicia una conversación nueva con **+**, revisita las antiguas
  desde el botón de historial.
- El contador en la parte inferior muestra tu cuota de **ciclos** para el día y
  el mes — consulta [planes](/docs/es/getting-started/plans/).

El modo Básico solo habla. Cuando quieras que el asistente _haga_ cosas en el
lienzo, cambia al [modo Agente](/docs/es/ai/agent-mode/).
