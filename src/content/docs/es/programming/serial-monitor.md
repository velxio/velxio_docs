---
title: Monitor serie
description: Vea la salida serie de su programa y envíe datos de vuelta a él.
sidebar:
  order: 4
---

Active el monitor serie con el botón **Serial** en la barra de herramientas. Se
abre como un panel inferior, con **una pestaña por placa** en el proyecto:

![El monitor serie durante una ejecución](../../../../assets/docs/programming/serial-monitor.png)

Todo lo que su firmware imprime (`Serial.println`, `print` de MicroPython,
el registro de arranque del ROM) aparece aquí en tiempo real, incluidos los
mensajes de arranque del propio chip, porque el emulador arranca el firmware real.

## Controles

- **Baud rate** — coincide con su `Serial.begin(...)`; 115200 es lo habitual.
- **Autoscroll** — sigue la salida más reciente; desmarque para desplazarse hacia atrás.
- **Clear** — vacía el búfer.
- **Hardware serial** — indica que la pestaña está conectada al UART de la placa.

## Envío de entrada

Escriba en el **message box** (cuadro de mensaje) en la parte inferior y presione **Send** (Enviar). El selector de fin de línea (Newline / Carriage return / ambos / ninguno) es importante para
los sketches que analizan `Serial.read()` — de la misma manera que en el monitor
del IDE de Arduino.

En las placas MicroPython, el monitor serie funciona también como **REPL**: detenga
su script con interrupciones de estilo Ctrl+C y escriba Python de forma interactiva.
