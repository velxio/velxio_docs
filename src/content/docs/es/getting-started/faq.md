---
title: FAQ
description: Preguntas frecuentes sobre Velxio.
sidebar:
  order: 8
---

### ¿Necesito instalar algo?

No. Velxio funciona completamente en el navegador — el editor, el compilador (en la
nube) y la simulación. Un Chrome, Edge o Firefox reciente en un escritorio es
la mejor experiencia.

### ¿Realmente está ejecutando mi código?

Sí. Su sketch se compila con las mismas cadenas de herramientas que utilizan las placas reales
(arduino-cli, ESP-IDF, MicroPython), y el **binario real** resultante es
ejecutado por una CPU emulada — no una interpretación línea por línea de su
código fuente. Registros de arranque, peculiaridades de temporización, comportamiento de registros: lo que ve es
lo que haría el silicio.

### ¿Es Velxio gratuito?

El simulador principal es gratuito, incluido el catálogo de placas abierto y la
galería de ejemplos. Las placas Pro, el asistente de IA y los proyectos privados requieren un
plan de pago — consulte [planes](/docs/es/getting-started/plans/).

### ¿Puedo importar mis proyectos de Wokwi?

Sí — el botón **open project** (abrir proyecto) acepta archivos `.zip` de Wokwi junto con
los archivos `.vlx` propios de Velxio. Consulte
[Guardar y abrir proyectos](/docs/es/getting-started/projects/).

### ¿Qué placas son compatibles?

Arduino UNO/Nano/Mega, la familia ESP32 (clásico, S3, C3), Raspberry Pi
Pico y Pico W, STM32, Raspberry Pi Linux completo, ATtiny85 y más — la
lista completa con detalles está en [Placas](/docs/es/boards/overview/).

### ¿Funciona el WiFi en el simulador?

En placas ESP32, sí — la estación simulada se asocia, obtiene una IP mediante
DHCP y puede llegar a la puerta de enlace de internet para proyectos MQTT/HTTP. Consulte
[WiFi e IoT](/docs/es/wifi-iot/overview/).

### ¿Puedo llevar mi proyecto a hardware real?

Sí. Para proyectos ESP32, **web flash** (grabación web) escribe el firmware compilado en una
placa real a través de USB, directamente desde el navegador. Consulte
[Web flash](/docs/es/wifi-iot/overview/).

### ¿Dónde reporto un error o solicito una función?

A través del menú **Help** (Ayuda) en el editor, la comunidad de Velxio en
[Discord](https://velxio.dev), o la organización de GitHub —
lo que prefiera.

----- END PAGE -----
